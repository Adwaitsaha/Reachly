import { Link } from "react-router";
import { Mail, Linkedin, MapPin, Tag } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";

export function Contacts() {
  const { data: contacts, loading } = useContacts();

  if (loading) {
    return <div className="p-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Contacts</h1>
        <p className="text-gray-600">Auto-tracked from Gmail and LinkedIn</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <Link
            key={contact.id}
            to={`/contacts/${contact.id}`}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4 mb-4">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">{contact.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{contact.role}</p>
                <p className="text-sm text-gray-500">{contact.company}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{contact.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Linkedin className="w-4 h-4" />
                <span className="truncate">{contact.linkedin}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {contact.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-gray-500">
                <span
                  className={`w-2 h-2 rounded-full ${
                    contact.relationshipStage === "Active"
                      ? "bg-green-500"
                      : contact.relationshipStage === "Warm"
                      ? "bg-yellow-500"
                      : "bg-gray-300"
                  }`}
                />
                <span>{contact.relationshipStage}</span>
              </div>
              <span className="text-gray-500">Last: {contact.lastContacted}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}