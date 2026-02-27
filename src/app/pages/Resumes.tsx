import { useRef, useState } from "react";
import { FileText, Upload, Calendar } from "lucide-react";
import { useResumes } from "@/hooks/useResumes";
import type { Resume } from "@/hooks/useResumes";

export function Resumes() {
  const { data: resumes, loading, upload, rename, remove, getSignedUrl } = useResumes();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading]         = useState(false);
  const [menuOpenId, setMenuOpenId]       = useState<string | null>(null);
  const [renamingId, setRenamingId]       = useState<string | null>(null);
  const [renameValue, setRenameValue]     = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId]               = useState<string | null>(null);

  if (loading) {
    return <div className="p-8 text-gray-500">Loading...</div>;
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const name = file.name.replace(/\.[^/.]+$/, ''); // strip extension for display name
      await upload(file, name);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      e.target.value = ''; // reset so same file can be re-selected
    }
  };

  const startRename = (resume: Resume) => {
    setRenamingId(resume.id);
    setRenameValue(resume.name);
    setMenuOpenId(null);
  };

  const confirmRename = async (id: string) => {
    if (!renameValue.trim()) return;
    setBusyId(id);
    try {
      await rename(id, renameValue.trim());
    } catch (err) {
      console.error('Rename failed:', err);
    } finally {
      setBusyId(null);
      setRenamingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await remove(id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setBusyId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleView = async (resume: Resume) => {
    if (!resume.fileUrl) return;
    const url = await getSignedUrl(resume.fileUrl);
    if (url) window.open(url, '_blank');
  };

  const handleDownload = async (resume: Resume) => {
    if (!resume.fileUrl) return;
    const url = await getSignedUrl(resume.fileUrl);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = resume.name;
    a.click();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Resumes</h1>
          <p className="text-gray-600">Manage your resume versions</p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
        >
          <Upload className="w-4 h-4" />
          <span className="font-medium">{uploading ? 'Uploading…' : 'Upload New'}</span>
        </button>

        {/* Hidden file input — triggered by the button above */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            {/* Card header: icon + ⋯ menu */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setMenuOpenId(menuOpenId === resume.id ? null : resume.id);
                    setConfirmDeleteId(null);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 px-1"
                >
                  ⋯
                </button>

                {menuOpenId === resume.id && (
                  <div className="absolute right-0 top-6 z-10 bg-white border border-gray-200 rounded-lg shadow-md py-1 w-32">
                    <button
                      onClick={() => startRename(resume)}
                      className="w-full px-3 py-1.5 text-sm text-left text-gray-700 hover:bg-gray-50"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => { setConfirmDeleteId(resume.id); setMenuOpenId(null); }}
                      className="w-full px-3 py-1.5 text-sm text-left text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Name — inline rename when active */}
            {renamingId === resume.id ? (
              <div className="mb-2 flex items-center gap-2">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmRename(resume.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  onClick={() => confirmRename(resume.id)}
                  disabled={busyId === resume.id}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => setRenamingId(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <h3 className="font-semibold text-gray-900 mb-2">{resume.name}</h3>
            )}

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
                  <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
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

            {/* Action row — delete confirm or view/download */}
            {confirmDeleteId === resume.id ? (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDelete(resume.id)}
                  disabled={busyId === resume.id}
                  className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-60"
                >
                  {busyId === resume.id ? 'Deleting…' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleView(resume)}
                  disabled={!resume.fileUrl}
                  className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  View
                </button>
                <button
                  onClick={() => handleDownload(resume)}
                  disabled={!resume.fileUrl}
                  className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Download
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
