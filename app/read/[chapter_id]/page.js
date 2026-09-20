import Link from "next/link";
import { getChapterInfo, getChapterPages, getAdjacentChapters } from "@/lib/mangadex";
import { notFound } from "next/navigation";

export default async function ReaderPage({ params }) {
  const { chapter_id } = await params;

  const [chapter, { pages, error }] = await Promise.all([
    getChapterInfo(chapter_id),
    getChapterPages(chapter_id),
  ]);

  if (!chapter) notFound();

  const { prev, next } = await getAdjacentChapters(chapter.mangaId, chapter.chapter);

  let hostname = "";
  if (chapter.externalUrl) {
    try {
      hostname = new URL(chapter.externalUrl).hostname.replace("www.", "");
    } catch (e) {
      hostname = "Official Site";
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Sticky Top Bar */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 flex items-center h-14 px-4 gap-3">
        <Link href={`/title/${chapter.mangaId}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors shrink-0">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span className="hidden md:inline text-sm font-medium max-w-xs truncate">{chapter.mangaTitle}</span>
        </Link>
        <div className="flex-1 text-center">
          <span className="font-bold text-sm text-white">Chapter {chapter.chapter}</span>
          {chapter.title && <span className="text-zinc-400 text-sm ml-2 hidden sm:inline">— {chapter.title}</span>}
        </div>
        <span className="text-xs text-zinc-500 hidden sm:block shrink-0">{chapter.group}</span>
      </header>

      {/* Reader Images */}
      <main className="flex-1 flex flex-col items-center w-full max-w-3xl mx-auto">
        {pages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="text-5xl mb-4">😔</div>
            <h2 className="text-xl font-bold text-white mb-2">Chapter Images Not Available</h2>
            <p className="text-zinc-400 text-sm max-w-sm mb-6">
              {error || "This chapter's images could not be loaded from MangaDex."}
            </p>

            {/* Alternative Sites Buttons */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 max-w-md w-full mb-8 space-y-3">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                🌐 Read Chapter {chapter.chapter} on Free Alternative Sites:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { name: "MangaDex", icon: "📚", url: `https://mangadex.org/titles?q=${encodeURIComponent(chapter.mangaTitle)}` },
                  { name: "ComicK", icon: "🚀", url: `https://comick.io/search?q=${encodeURIComponent(chapter.mangaTitle)}` },
                  { name: "Bato.to", icon: "🔖", url: `https://bato.to/search?word=${encodeURIComponent(chapter.mangaTitle)}` },
                  { name: "MangaSee", icon: "👁️", url: `https://mangasee123.com/search/?q=${encodeURIComponent(chapter.mangaTitle)}` },
                  { name: "Flame Scans", icon: "🔥", url: `https://flamecomics.xyz/?s=${encodeURIComponent(chapter.mangaTitle)}` },
                  { name: "Asura Scans", icon: "⚡", url: `https://asuracomic.net/series?query=${encodeURIComponent(chapter.mangaTitle)}` },
                  { name: "MangaKakalot", icon: "🌸", url: `https://ww5.mangakakalot.tv/search/${encodeURIComponent(chapter.mangaTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_"))}` },
                ].map((site) => (
                  <a
                    key={site.name}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
                  >
                    <span>{site.icon}</span>
                    <span>{site.name}</span>
                    <span className="text-[10px] opacity-60">↗</span>
                  </a>
                ))}
              </div>
            </div>

            {chapter.externalUrl && (
              <a
                href={chapter.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-8 px-6 py-3 rounded-full bg-primary hover:bg-primary/95 text-white font-bold transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center gap-2 hover:scale-105"
              >
                Read on {hostname} ↗
              </a>
            )}
            <div className="flex gap-3">
              {prev && (
                <Link href={`/read/${prev.id}`} className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors">
                  ← Ch.{prev.chapter}
                </Link>
              )}
              <Link href={`/title/${chapter.mangaId}`} className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors">
                All Chapters
              </Link>
              {next && (
                <Link href={`/read/${next.id}`} className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors">
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
            <Link href={`/read/${prev.id}`} className="flex-1 text-center py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold transition-colors">
              ← Ch.{prev.chapter}
            </Link>
          ) : (
            <div className="flex-1 text-center py-2.5 rounded-lg bg-zinc-900 text-zinc-600 text-sm font-semibold cursor-not-allowed">
              ← First Chapter
            </div>
          )}

          <Link href={`/title/${chapter.mangaId}`} className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">
            All Ch.
          </Link>

          {next ? (
            <Link href={`/read/${next.id}`} className="flex-1 text-center py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-colors">
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
