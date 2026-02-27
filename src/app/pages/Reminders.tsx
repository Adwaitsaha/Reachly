import { useState } from "react";
import { Calendar } from "lucide-react";
import { useReminders } from "@/hooks/useReminders";

export function Reminders() {
  const { data: reminders, loading, markComplete, snooze } = useReminders();
  const [busyId, setBusyId] = useState<string | null>(null);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading...</div>;
  }

  const handleComplete = async (id: string) => {
    setBusyId(id);
    try {
      await markComplete(id);
    } catch (err) {
      console.error('Failed to complete reminder:', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleSnooze = async (id: string) => {
    setBusyId(`snooze-${id}`);
    try {
      await snooze(id, 1);
    } catch (err) {
      console.error('Failed to snooze reminder:', err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Reminders</h1>
        <p className="text-gray-600">Stay on top of your follow-ups</p>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="divide-y divide-gray-100">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Priority dot */}
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

                  {/* Body */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ml-4 ${
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

                    <p className="text-gray-700 mb-3">{reminder.description}</p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Due: {reminder.dueDate}</span>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs ${
                          reminder.category === "follow-up"
                            ? "bg-emerald-100 text-emerald-700"
                            : reminder.category === "interview"
                            ? "bg-teal-100 text-teal-700"
                            : reminder.category === "application"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {reminder.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleSnooze(reminder.id)}
                      disabled={busyId !== null}
                      className="px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-60"
                    >
                      Snooze 1d
                    </button>
                    <button
                      onClick={() => handleComplete(reminder.id)}
                      disabled={busyId !== null}
                      className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium disabled:opacity-60"
                    >
                      {busyId === reminder.id ? 'Saving…' : 'Complete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {reminders.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No pending reminders
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
