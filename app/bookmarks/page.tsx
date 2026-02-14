import { createClient } from "@/utils/supabase/server";
import { BookmarksList } from "./BookmarksList";
import { AddBookmarkForm } from "./AddBookmarkForm";

export default async function BookmarksPage() {
  const supabase = await createClient();
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("id, url, title, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">My Bookmarks</h1>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
          >
            Sign out
          </button>
        </form>
      </header>

      <AddBookmarkForm />
      <BookmarksList initialBookmarks={bookmarks ?? []} />
    </main>
  );
}
