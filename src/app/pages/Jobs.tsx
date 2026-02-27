import { useState } from "react";
import { LayoutGrid, List, MapPin, Calendar, FileText, Users } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";

type ViewMode = "table" | "kanban";

export function Jobs() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const { data: jobs, loading } = useJobs();

  const kanbanColumns = {
    Applied: jobs.filter((j) => j.status === "Applied"),
    Interview: jobs.filter((j) => j.status === "Interview"),
    Offer: jobs.filter((j) => j.status === "Offer"),
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Jobs</h1>
          <p className="text-gray-600">Auto-detected from your emails</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-emerald-50 text-emerald-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <List className="w-4 h-4" />
            <span className="font-medium">Table</span>
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === "kanban"
                ? "bg-emerald-50 text-emerald-600"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="font-medium">Kanban</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Source
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Resume
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Date Applied
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                    Contacts
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{job.role}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={job.companyLogo}
                          alt={job.company}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span className="text-gray-900">{job.company}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{job.source}</span>
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{job.resumeUsed}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{job.dateApplied}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {job.contacts.length > 0 ? (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{job.contacts.length}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {Object.entries(kanbanColumns).map(([status, jobs]) => (
            <div key={status} className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">{status}</h3>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {jobs.length}
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1">{job.role}</h4>
                        <p className="text-sm text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>Applied {job.dateApplied}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        <span>{job.resumeUsed}</span>
                      </div>
                      {job.contacts.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3 h-3" />
                          <span>{job.contacts.length} contacts</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{job.salary}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}