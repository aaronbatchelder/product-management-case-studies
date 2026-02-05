"use client";

import { useState, useEffect } from "react";
import { CATEGORIES, FORMATS, type Format } from "@/lib/types";

interface PendingSubmission {
  id: string;
  title: string;
  url: string;
  description: string;
  suggestedCategory: string;
  source: string;
  sourceType: "rss" | "community";
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  matchScore: number;
  matchedKeywords: string[];
  format?: string;
  company?: string;
  submitterEmail?: string;
  notes?: string;
}

interface EditableSubmission extends PendingSubmission {
  editedTitle: string;
  editedDescription: string;
  editedCategory: string;
  editedCompany: string;
  editedFormat: Format;
}

export function ReviewQueue() {
  const [submissions, setSubmissions] = useState<EditableSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [actionStatus, setActionStatus] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/admin/submissions");
      if (response.ok) {
        const data = await response.json();
        const editable = data.submissions.map((s: PendingSubmission) => ({
          ...s,
          editedTitle: s.title,
          editedDescription: s.description,
          editedCategory: s.suggestedCategory,
          editedCompany: s.company || "",
          editedFormat: (s.format as Format) || "article",
        }));
        setSubmissions(editable);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    id: string,
    action: "approve" | "reject",
    submission: EditableSubmission
  ) => {
    setActionStatus((prev) => ({ ...prev, [id]: "processing" }));

    try {
      const response = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          action,
          data: {
            title: submission.editedTitle,
            description: submission.editedDescription,
            category: submission.editedCategory,
            company: submission.editedCompany,
            format: submission.editedFormat,
          },
        }),
      });

      if (response.ok) {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: action === "approve" ? "approved" : "rejected" } : s
          )
        );
        setActionStatus((prev) => ({ ...prev, [id]: action === "approve" ? "approved" : "rejected" }));
      } else {
        setActionStatus((prev) => ({ ...prev, [id]: "error" }));
      }
    } catch {
      setActionStatus((prev) => ({ ...prev, [id]: "error" }));
    }
  };

  const updateField = (id: string, field: keyof EditableSubmission, value: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  const counts = {
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted">Loading submissions...</div>
    );
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 border-b border-border pb-4">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "pending"
              ? "bg-ink text-white"
              : "bg-gray-100 text-muted hover:bg-gray-200"
          }`}
        >
          Pending ({counts.pending})
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "approved"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-muted hover:bg-gray-200"
          }`}
        >
          Approved ({counts.approved})
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "rejected"
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-muted hover:bg-gray-200"
          }`}
        >
          Rejected ({counts.rejected})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-ink text-white"
              : "bg-gray-100 text-muted hover:bg-gray-200"
          }`}
        >
          All ({submissions.length})
        </button>
      </div>

      {/* Submissions list */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12 text-muted">
          No {filter !== "all" ? filter : ""} submissions found.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSubmissions.map((submission) => (
            <div
              key={submission.id}
              className={`border rounded-lg p-6 ${
                submission.status === "approved"
                  ? "border-green-200 bg-green-50"
                  : submission.status === "rejected"
                  ? "border-red-200 bg-red-50"
                  : "border-border"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      submission.sourceType === "rss"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {submission.sourceType === "rss" ? "RSS" : "Community"}
                  </span>
                  {submission.matchScore > 0 && (
                    <span className="text-xs text-muted">
                      Score: {submission.matchScore}
                    </span>
                  )}
                  <span className="text-xs text-muted">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-xs text-muted">{submission.source}</span>
              </div>

              {/* Editable fields */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={submission.editedTitle}
                    onChange={(e) =>
                      updateField(submission.id, "editedTitle", e.target.value)
                    }
                    disabled={submission.status !== "pending"}
                    className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm disabled:bg-gray-100"
                  />
                </div>

                {/* URL (read-only) */}
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    URL
                  </label>
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent-hover text-sm font-mono break-all"
                  >
                    {submission.url}
                  </a>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    Description
                  </label>
                  <textarea
                    value={submission.editedDescription}
                    onChange={(e) =>
                      updateField(submission.id, "editedDescription", e.target.value)
                    }
                    disabled={submission.status !== "pending"}
                    rows={2}
                    className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm disabled:bg-gray-100 resize-none"
                  />
                </div>

                {/* Category, Format, Company */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">
                      Category
                    </label>
                    <select
                      value={submission.editedCategory}
                      onChange={(e) =>
                        updateField(submission.id, "editedCategory", e.target.value)
                      }
                      disabled={submission.status !== "pending"}
                      className="w-full px-2 py-2 border border-border rounded-md text-sm disabled:bg-gray-100 bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">
                      Format
                    </label>
                    <select
                      value={submission.editedFormat}
                      onChange={(e) =>
                        updateField(submission.id, "editedFormat", e.target.value)
                      }
                      disabled={submission.status !== "pending"}
                      className="w-full px-2 py-2 border border-border rounded-md text-sm disabled:bg-gray-100 bg-white"
                    >
                      {FORMATS.map((fmt) => (
                        <option key={fmt.value} value={fmt.value}>
                          {fmt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={submission.editedCompany}
                      onChange={(e) =>
                        updateField(submission.id, "editedCompany", e.target.value)
                      }
                      disabled={submission.status !== "pending"}
                      className="w-full px-2 py-2 border border-border rounded-md text-sm disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Matched keywords (for RSS) */}
                {submission.matchedKeywords.length > 0 && (
                  <div className="text-xs text-muted">
                    <span className="font-medium">Matched: </span>
                    {submission.matchedKeywords.join(", ")}
                  </div>
                )}

                {/* Submitter notes */}
                {submission.notes && (
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <span className="font-medium text-muted">Submitter notes: </span>
                    {submission.notes}
                  </div>
                )}
              </div>

              {/* Actions */}
              {submission.status === "pending" && (
                <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                  <button
                    onClick={() => handleAction(submission.id, "approve", submission)}
                    disabled={actionStatus[submission.id] === "processing"}
                    className="flex-1 bg-green-600 text-white py-2 rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionStatus[submission.id] === "processing"
                      ? "Processing..."
                      : "✓ Approve & Add"}
                  </button>
                  <button
                    onClick={() => handleAction(submission.id, "reject", submission)}
                    disabled={actionStatus[submission.id] === "processing"}
                    className="flex-1 bg-red-600 text-white py-2 rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {actionStatus[submission.id] === "processing"
                      ? "Processing..."
                      : "✗ Reject"}
                  </button>
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-border rounded-md text-sm hover:bg-gray-50 transition-colors"
                  >
                    Open →
                  </a>
                </div>
              )}

              {/* Status indicator for processed */}
              {submission.status !== "pending" && (
                <div className="mt-4 pt-4 border-t border-border text-sm text-center">
                  {submission.status === "approved" ? (
                    <span className="text-green-700 font-medium">
                      ✓ Approved and added to database
                    </span>
                  ) : (
                    <span className="text-red-700 font-medium">✗ Rejected</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
