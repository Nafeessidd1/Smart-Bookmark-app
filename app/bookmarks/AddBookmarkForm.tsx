"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function AddBookmarkForm() {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!url.trim()) {
      setError("URL is required");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in");
      setLoading(false);
      return;
    }
    const titleToUse =
      title.trim() ||
      (() => {
        try {
          return new URL(url).hostname;
        } catch {
          return url;
        }
      })();
    const { error: err } = await supabase.from("bookmarks").insert({
      user_id: user.id,
      url: url.trim(),
      title: titleToUse,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setUrl("");
    setTitle("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 flex flex-col gap-3 rounded-xl border border-slate-700 bg-slate-800/50 p-4"
    >
      <input
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        disabled={loading}
      />
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-sky-600 px-4 py-2 font-medium text-white transition hover:bg-sky-500 disabled:opacity-50"
      >
        {loading ? "Adding…" : "Add bookmark"}
      </button>
    </form>
  );
}
