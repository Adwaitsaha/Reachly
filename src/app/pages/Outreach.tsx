import { Mail, Linkedin } from "lucide-react";
import { useInteractions } from "@/hooks/useInteractions";

export function Outreach() {
  const { data: outreach, loading } = useInteractions();

  if (loading) {
    return <div className="p-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Outreach</h1>
        <p className="text-gray-600">Auto-tracked from Gmail and LinkedIn</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="divide-y divide-gray-100">
          {outreach.map((outreach) => (
            <div
              key={outreach.id}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{outreach.contactName}</h3>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{outreach.company}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{outreach.preview}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      {outreach.channel === "Email" ? (
                        <Mail className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Linkedin className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-600">{outreach.channel}</span>
                    </div>
                    
                    <span className="text-sm text-gray-400">•</span>
                    
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        outreach.stage === "Replied"
                          ? "bg-green-100 text-green-700"
                          : outreach.stage === "Call"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {outreach.stage}
                    </span>
                    
                    <span className="text-sm text-gray-400">•</span>
                    
                    <span className="text-sm text-gray-500">{outreach.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}