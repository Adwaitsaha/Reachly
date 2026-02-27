import { useParams, Link } from "react-router";
import { Mail, Linkedin, Tag, ArrowLeft, Calendar, FileText, MessageSquare } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import { useJobs } from "@/hooks/useJobs";
import { useInteractions } from "@/hooks/useInteractions";

export function ContactProfile() {
  const { id } = useParams();
  const { data: contacts, loading: loadingContacts } = useContacts();
  const { data: jobs, loading: loadingJobs } = useJobs();
  const { data: interactions, loading: loadingInteractions } = useInteractions();

  const loading = loadingContacts || loadingJobs || loadingInteractions;

  if (loading) {
    return <div className="p-8 text-gray-500">Loading...</div>;
  }

  const contact = contacts.find((c) => c.id === id);

  if (!contact) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Contact not found</p>
      </div>
    );
  }

  const contactJobs = jobs.filter((job) =>
    job.contacts.includes(contact.name)
  );

  const contactOutreach = interactions.filter(
    (interaction) => interaction.contactId === contact.id
  );

  return (
    <div className="p-8">
      <Link
        to="/contacts"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Contacts
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-6">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {contact.name}
                </h1>
                <p className="text-lg text-gray-600 mb-1">{contact.role}</p>
                <p className="text-gray-500 mb-4">{contact.company}</p>
                
                <div className="flex items-center gap-4 mb-4">
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    <Mail className="w-4 h-4" />
                    {contact.email}
                  </a>
                  <a
                    href={`https://${contact.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {contact.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Conversation History */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conversation History</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {contactOutreach.length > 0 ? (
                contactOutreach.map((outreach) => (
                  <div key={outreach.id} className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">{outreach.channel}</span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              outreach.stage === "Replied"
                                ? "bg-green-100 text-green-700"
                                : outreach.stage === "Call"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {outreach.stage}
                          </span>
                          <span className="text-sm text-gray-500">{outreach.date}</span>
                        </div>
                        <p className="text-gray-700">{outreach.preview}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No conversation history yet
                </div>
              )}
            </div>
          </div>

          {/* Jobs Associated */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Associated Jobs</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {contactJobs.length > 0 ? (
                contactJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/jobs`}
                    className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={job.companyLogo}
                      alt={job.company}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{job.role}</h3>
                      <p className="text-sm text-gray-600">{job.company}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        job.status === "Offer"
                          ? "bg-green-100 text-green-700"
                          : job.status === "Interview"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {job.status}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No associated jobs
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700">{contact.notes}</p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Contacted</p>
                <p className="text-gray-900">{contact.lastContacted}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Relationship Stage</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      contact.relationshipStage === "Active"
                        ? "bg-green-500"
                        : contact.relationshipStage === "Warm"
                        ? "bg-yellow-500"
                        : "bg-gray-300"
                    }`}
                  />
                  <span className="text-gray-900">{contact.relationshipStage}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Company</p>
                <Link
                  to={`/companies/${contact.companyId}`}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  {contact.company}
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <a
                href={`mailto:${contact.email}`}
                className="w-full flex justify-center px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
              >
                Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}