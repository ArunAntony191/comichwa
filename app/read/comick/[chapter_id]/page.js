import Link from "next/link";
import { getComicKChapterInfo, getComicKPages, getAdjacentComicKChapters } from "@/lib/comick";
import { notFound } from "next/navigation";

export default async function ComicKReaderPage({ params }) {
  const { chapter_id } = await params;

  const [chapter, { pages, error }] = await Promise.all([
    getComicKChapterInfo(chapter_id),
    getComicKPages(chapter_id),
  ]);

  if (!chapter) notFound();

  const { prev, next } = await getAdjacentComicKChapters(chapter.mangaHid, chapter.chapter);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 flex items-center h-14 px-4 gap-3">
        <Link href={`/title/${chapter.mangaSlug}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="hidden md:inline text-sm font-medium max-w-xs truncate">{chapter.mangaTitle}</span>
        </Link>
        <div className="flex-1 text-center">
          <span className="font-bold text-sm text-white">Chapter {chapter.chapter}</span>
          {chapter.title && <span className="text-zinc-400 text-sm ml-2 hidden sm:inline">— {chapter.title}</span>}
        </div>
        <span className="text-xs text-zinc-500 hidden sm:block shrink-0 flex items-center gap-1">
          <span className="text-blue-400">ComicK</span>
          {chapter.group && <span className="text-zinc-600 ml-1">· {chapter.group}</span>}
        </span>
      </header>

      {/* Reader Images */}
      <main className="flex-1 flex flex-col items-center w-full max-w-3xl mx-auto">
        {pages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="text-5xl mb-4">😔</div>
            <h2 className="text-xl font-bold text-white mb-2">Chapter Not Available</h2>
            <p className="text-zinc-400 text-sm max-w-sm mb-8">
              {error || "This chapter's images could not be loaded from ComicK."}
            </p>
            <div className="flex gap-3">
              {prev && (
                <Link href={`/read/comick/${prev.id}`} className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors">
                  ← Ch.{prev.chapter}
                </Link>
              )}
              <Link href={`/title/${chapter.mangaSlug}`} className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors">
                All Chapters
              </Link>
              {next && (
                <Link href={`/read/comick/${next.id}`} className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors">
                  Ch.{next.chapter} →
                </Link>
              )}
            </div>
          </div>
        ) : (
          pages.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Page ${i + 1}`}
              className="w-full h-auto block select-none"
              loading={i < 3 ? "eager" : "lazy"}
            />
          ))
        )}
      </main>

      {/* Sticky Bottom Nav */}
      <footer className="sticky bottom-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800 py-3 px-4">
        <div className="flex items-center justify-center gap-3 max-w-lg mx-auto">
          {prev ? (
            <Link href={`/read/comick/${prev.id}`} className="flex-1 text-center py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors">
              ← Ch.{prev.chapter}
            </Link>
          ) : (
            <div className="flex-1 text-center py-2.5 rounded-lg bg-zinc-900 text-zinc-600 text-sm font-semibold cursor-not-allowed">
              ← First Chapter
            </div>
          )}

          <Link href={`/title/${chapter.mangaSlug}`} className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">
            All Ch.
          </Link>

          {next ? (
            <Link href={`/read/comick/${next.id}`} className="flex-1 text-center py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors">
              Ch.{next.chapter} →
            </Link>
          ) : (
            <div className="flex-1 text-center py-2.5 rounded-lg bg-zinc-900 text-zinc-600 text-sm font-semibold cursor-not-allowed">
              Last Chapter
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
