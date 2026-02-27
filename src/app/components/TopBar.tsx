import { Search, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGmailSync } from "@/hooks/useGmailSync";

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { sync, syncing, result, error: syncError, hasGoogleToken } = useGmailSync();

  // Use first two characters of the email as initials
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "?";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search people, companies, jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-6">
          {hasGoogleToken && (
            <button
              onClick={sync}
              disabled={syncing}
              title={
                syncError
                  ? syncError
                  :               result
                  ? `Last sync: ${result.synced} synced, ${result.contactsCreated} new contacts, ${result.skipped} skipped`
                  : "Sync sent Gmail emails"
              }
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing…" : "Sync Gmail"}
            </button>
          )}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="font-medium">Add</span>
          </button>

          {/* User avatar + sign-out dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold"
            >
              {initials}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-10 bg-white border border-gray-200 rounded-lg shadow-md py-1 w-48">
                <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 truncate">
                  {user?.email}
                </div>
                <button
                  onClick={signOut}
                  className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
