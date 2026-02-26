import { Link } from "react-router";
import { ArrowRight, TrendingUp, Calendar, Activity } from "lucide-react";
import { mockJobs, mockOutreach, mockReminders } from "../data/mockData";

export function Dashboard() {
  const pipelineStats = {
    applied: mockJobs.filter((j) => j.status === "Applied").length,
    interview: mockJobs.filter((j) => j.status === "Interview").length,
    offer: mockJobs.filter((j) => j.status === "Offer").length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your job search progress</p>
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Applied</h3>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {pipelineStats.applied}
          </div>
          <p className="text-sm text-gray-500">Active applications</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Interview</h3>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {pipelineStats.interview}
          </div>
          <p className="text-sm text-gray-500">In interview stage</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Offers</h3>
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {pipelineStats.offer}
          </div>
          <p className="text-sm text-gray-500">Offers received</p>
        </div>
      </div>

      {/* Recent Outreach + Follow-ups Due */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Recent Outreach */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Outreach</h2>
              <Link
                to="/outreach"
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {mockOutreach.slice(0, 4).map((outreach) => (
              <div key={outreach.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{outreach.contactName}</span>
                      <span className="text-sm text-gray-500">• {outreach.company}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">{outreach.preview}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          outreach.stage === "Replied"
                            ? "bg-green-100 text-green-700"
                            : outreach.stage === "Call"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {outreach.stage}
                      </span>
                      <span>•</span>
                      <span>{outreach.channel}</span>
                      <span>•</span>
                      <span>{outreach.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Follow-ups Due */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Follow-ups Due</h2>
              <Link
                to="/reminders"
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {mockReminders.slice(0, 4).map((reminder) => (
              <div key={reminder.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        reminder.priority === "high"
                          ? "bg-red-500"
                          : reminder.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-gray-300"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{reminder.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{reminder.dueDate}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          reminder.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : reminder.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {reminder.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}