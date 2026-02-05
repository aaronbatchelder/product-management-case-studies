"use client";

import { useState } from "react";
import { CATEGORIES, FORMATS, type Format } from "@/lib/types";

interface FormData {
  url: string;
  title: string;
  description: string;
  category: string;
  format: Format;
  company: string;
  submitterEmail: string;
  notes: string;
}

const initialFormData: FormData = {
  url: "",
  title: "",
  description: "",
  category: "",
  format: "article",
  company: "",
  submitterEmail: "",
  notes: "",
};

export function SubmitForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    // Basic validation
    if (!formData.url || !formData.title || !formData.category) {
      setStatus("error");
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    // Validate URL format
    try {
      new URL(formData.url);
    } catch {
      setStatus("error");
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Submission failed");
      }

      setStatus("success");
      setFormData(initialFormData);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-2xl mb-2">✓</div>
        <h3 className="font-bold text-green-800 mb-2">Submission Received!</h3>
        <p className="text-green-700 text-sm mb-4">
          Thanks for contributing to the PM community. We&apos;ll review your
          submission and add it if it meets our quality standards.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-accent hover:text-accent-hover text-sm font-medium"
        >
          Submit another case study →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {/* URL */}
      <div>
        <label htmlFor="url" className="block font-medium mb-1">
          Case Study URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          placeholder="https://example.com/case-study"
          className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          required
        />
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block font-medium mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="How Slack Built a $27B Product"
          className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief summary of what the case study covers..."
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
        />
        <p className="text-xs text-muted mt-1">Optional, max 300 characters</p>
      </div>

      {/* Category and Format */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block font-medium mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
            required
          >
            <option value="">Select...</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="format" className="block font-medium mb-1">
            Format
          </label>
          <select
            id="format"
            name="format"
            value={formData.format}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
          >
            {FORMATS.map((fmt) => (
              <option key={fmt.value} value={fmt.value}>
                {fmt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Company */}
      <div>
        <label htmlFor="company" className="block font-medium mb-1">
          Company Featured
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Slack, Airbnb, Stripe..."
          className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="submitterEmail" className="block font-medium mb-1">
          Your Email
        </label>
        <input
          type="email"
          id="submitterEmail"
          name="submitterEmail"
          value={formData.submitterEmail}
          onChange={handleChange}
          placeholder="you@example.com"
          className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <p className="text-xs text-muted mt-1">
          Optional. We&apos;ll notify you if your submission is approved.
        </p>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block font-medium mb-1">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Why is this case study valuable? Any specific insights worth highlighting?"
          rows={2}
          className="w-full px-3 py-2 border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-ink text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Submitting..." : "Submit for Review"}
      </button>
    </form>
  );
}
