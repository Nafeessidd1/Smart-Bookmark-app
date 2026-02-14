"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export type Bookmark = {
  id: string;
  url: string;
  title: string;
  created_at: string;
};

export function BookmarksList({ initialBookmarks }: { initialBookmarks: Bookmark[] }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const supabase = createClient();

  useEffect(() => {
    setBookmarks(initialBookmarks);
  }, [initialBookmarks]);

  useEffect(() => {
    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        (payload) => {
          if (payload.eventType === "INSERT" && payload.new) {
            setBookmarks((prev) => [
              payload.new as Bookmark,
              ...prev.filter((b) => b.id !== (payload.new as Bookmark).id),
            ]);
          }
          if (payload.eventType === "DELETE" && payload.old) {
            const old = payload.old as { id: string };
            setBookmarks((prev) => prev.filter((b) => b.id !== old.id));
          }
          if (payload.eventType === "UPDATE" && payload.new) {
            setBookmarks((prev) =>
              prev.map((b) =>
                b.id === (payload.new as Bookmark).id ? (payload.new as Bookmark) : b
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function deleteBookmark(id: string) {
    await supabase.from("bookmarks").delete().eq("id", id);
  }

  if (bookmarks.length === 0) {
    return (
      <p className="rounded-xl border border-slate-700 bg-slate-800/30 p-6 text-center text-slate-400">
        No bookmarks yet. Add one above.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {bookmarks.map((b) => (
        <li
          key={b.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3"
        >
          <a
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 text-sky-400 hover:underline"
          >
            <span className="block font-medium text-slate-100">
              {b.title || b.url}
            </span>
            <span className="block truncate text-sm text-slate-500">{b.url}</span>
          </a>
          <button
            type="button"
            onClick={() => deleteBookmark(b.id)}
            className="shrink-0 rounded px-2 py-1 text-sm text-slate-400 transition hover:bg-red-500/20 hover:text-red-400"
            aria-label={`Delete ${b.title || b.url}`}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
