import { FileText, Upload, Calendar } from "lucide-react";
import { mockResumes } from "../data/mockData";

export function Resumes() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Resumes</h1>
          <p className="text-gray-600">Manage your resume versions</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Upload className="w-4 h-4" />
          <span className="font-medium">Upload New</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockResumes.map((resume) => (
          <div
            key={resume.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                ⋯
              </button>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2">{resume.name}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Last used: {resume.lastUsed}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="text-gray-500">Created:</span> {resume.dateCreated}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Sent to:</p>
              <div className="flex flex-wrap gap-1.5">
                {resume.jobsSentTo.slice(0, 3).map((job, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {job}
                  </span>
                ))}
                {resume.jobsSentTo.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{resume.jobsSentTo.length - 3} more
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium">
                View
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}