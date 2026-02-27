import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    // ── 1. Verify caller JWT ────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse("Missing Authorization header", 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify with anon client to authenticate the caller
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Admin client for DB writes (bypasses RLS)
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // ── 2. Get provider_token from request body ─────────────────────────────
    const body = await req.json().catch(() => ({}));
    const providerToken: string | undefined = body.provider_token;
    if (!providerToken) {
      return errorResponse("provider_token is required — sign in with Google first", 400);
    }

    // ── 3. Determine time filter (from last sync or 30 days ago) ───────────
    const { data: profile } = await admin
      .from("profiles")
      .select("last_gmail_sync_at")
      .eq("id", user.id)
      .maybeSingle();

    const afterDate = profile?.last_gmail_sync_at
      ? new Date(profile.last_gmail_sync_at)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const afterUnix = Math.floor(afterDate.getTime() / 1000);

    // ── 4. Fetch sent message IDs from Gmail ───────────────────────────────
    const listUrl = `${GMAIL_API}/users/me/messages?q=in:sent+after:${afterUnix}&maxResults=100`;
    const listRes = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${providerToken}` },
    });

    if (!listRes.ok) {
      const errText = await listRes.text();
      return errorResponse(`Gmail API error: ${listRes.status} ${errText}`, 502);
    }

    const listData = await listRes.json();
    const messageIds: string[] = (listData.messages ?? []).map((m: { id: string }) => m.id);
    console.log(`[gmail-sync] found ${messageIds.length} message IDs, afterUnix=${afterUnix}`);

    if (messageIds.length === 0) {
      await updateLastSync(admin, user.id);
      return jsonResponse({ synced: 0, contactsCreated: 0, skipped: 0 });
    }

    // ── 5. Process each message ────────────────────────────────────────────
    let synced = 0;
    let contactsCreated = 0;
    let skipped = 0;
    let hardErrors = 0; // non-duplicate insert failures

    for (const msgId of messageIds) {
      const msgRes = await fetch(`${GMAIL_API}/users/me/messages/${msgId}?format=full`, {
        headers: { Authorization: `Bearer ${providerToken}` },
      });

      if (!msgRes.ok) {
        skipped++;
        continue;
      }

      const msg = await msgRes.json();
      const headers: Array<{ name: string; value: string }> = msg.payload?.headers ?? [];

      const getHeader = (name: string) =>
        headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

      const toHeader = getHeader("To");
      const subject = getHeader("Subject");
      const dateHeader = getHeader("Date");
      const snippet: string = msg.snippet ?? "";

      // Parse date
      const sentDate = dateHeader
        ? new Date(dateHeader).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      // ── 5a. Parse all recipients from To header ───────────────────────
      const recipients = parseRecipients(toHeader);
      if (recipients.length === 0) {
        skipped++;
        continue;
      }

      // ── 5b. Check for resume-like attachments ─────────────────────────
      const hasResumeAttachment = detectResumeAttachment(msg.payload);

      // Process each recipient as a separate contact + interaction
      for (const { name: recipientName, email: recipientEmail } of recipients) {
        if (!recipientEmail) continue;

        // ── 5c. Upsert contact by email ───────────────────────────────
        const { data: existingContact } = await admin
          .from("contacts")
          .select("id")
          .eq("email", recipientEmail)
          .maybeSingle();

        let contactId: string;

        if (existingContact) {
          contactId = existingContact.id;
        } else {
          // Need a company_id — create or find a placeholder company
          // Extract domain from email as company name fallback
          const domain = recipientEmail.split("@")[1] ?? "";
          const companyName = domain.split(".")[0] || "Unknown";

          const { data: existingCompany } = await admin
            .from("companies")
            .select("id")
            .ilike("name", companyName)
            .eq("user_id", user.id)
            .maybeSingle();

          let companyId: string;
          if (existingCompany) {
            companyId = existingCompany.id;
          } else {
            const { data: newCompany, error: compErr } = await admin
              .from("companies")
              .insert({ name: companyName, user_id: user.id })
              .select("id")
              .single();
          if (compErr || !newCompany) {
            console.error("[gmail-sync] company insert error:", compErr?.message);
            hardErrors++;
            skipped++;
            continue;
          }
            companyId = newCompany.id;
          }

          const { data: newContact, error: contactErr } = await admin
            .from("contacts")
            .insert({
              name: recipientName || recipientEmail.split("@")[0],
              email: recipientEmail,
              company_id: companyId,
              relationship_stage: "Cold",
              last_contacted: sentDate,
              user_id: user.id,
            })
            .select("id")
            .single();

          if (contactErr || !newContact) {
            console.error("[gmail-sync] contact insert error:", contactErr?.message);
            hardErrors++;
            skipped++;
            continue;
          }

          contactId = newContact.id;
          contactsCreated++;
        }

        // ── 5d. Insert outreach row (skip if already synced) ──────────
        const { error: outreachErr } = await admin.from("outreach").insert({
          contact_id: contactId,
          channel: "Email",
          date: sentDate,
          stage: "Cold",
          preview: snippet.slice(0, 200),
          gmail_message_id: `${msgId}-${recipientEmail}`, // unique per message+recipient
          direction: "sent",
          subject: subject || null,
          user_id: user.id,
        });

        if (outreachErr) {
          if (outreachErr.code !== "23505") {
            console.error("[gmail-sync] outreach insert error:", outreachErr.message, outreachErr.code);
            hardErrors++;
          }
          skipped++;
          continue;
        }

        synced++;

        // ── 5e. Update contact's last_contacted if this email is newer ─
        await admin
          .from("contacts")
          .update({ last_contacted: sentDate })
          .eq("id", contactId)
          .lt("last_contacted", sentDate);

        // Future: if hasResumeAttachment, store in resume_interaction_links
        void hasResumeAttachment;
      }
    }

    // ── 6. Update last sync timestamp ──────────────────────────────────────
    // Only advance the timestamp if there were no hard errors so a failed
    // sync can be retried and won't permanently skip unprocessed emails.
    if (hardErrors === 0) {
      await updateLastSync(admin, user.id);
    }

    return jsonResponse({ synced, contactsCreated, skipped });
  } catch (err) {
    console.error("gmail-sync error:", err);
    return errorResponse("Internal server error", 500);
  }
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseRecipients(toHeader: string): Array<{ name: string; email: string }> {
  if (!toHeader) return [];

  // Split on commas that are outside angle brackets
  const parts = toHeader.split(/,(?![^<]*>)/);

  return parts.map((part) => {
    part = part.trim();
    // Format: "Name <email>"
    const match = part.match(/^(?:"?([^"<]*)"?\s*)?<?([^>]+@[^>]+)>?$/);
    if (match) {
      return {
        name: (match[1] ?? "").trim(),
        email: (match[2] ?? "").trim().toLowerCase(),
      };
    }
    // Plain email
    if (part.includes("@")) {
      return { name: "", email: part.toLowerCase() };
    }
    return { name: "", email: "" };
  }).filter((r) => r.email);
}

function detectResumeAttachment(payload: Record<string, unknown> | undefined): boolean {
  if (!payload) return false;

  const parts: unknown[] = (payload.parts as unknown[]) ?? [];
  for (const part of parts) {
    const p = part as Record<string, unknown>;
    const filename = (p.filename as string) ?? "";
    if (!filename) continue;
    const lower = filename.toLowerCase();
    if (
      lower.includes("resume") ||
      lower.includes("cv") ||
      lower.endsWith(".pdf") ||
      lower.endsWith(".docx")
    ) {
      return true;
    }
    // Recurse into nested parts
    if (p.parts && detectResumeAttachment(p as Record<string, unknown>)) {
      return true;
    }
  }
  return false;
}

// deno-lint-ignore no-explicit-any
async function updateLastSync(admin: any, userId: string) {
  await admin
    .from("profiles")
    .upsert({ id: userId, last_gmail_sync_at: new Date().toISOString() });
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}
