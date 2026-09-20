import Link from "next/link";
import { getMangaById, getMangaChapters, getAlternateMangaChapters } from "@/lib/mangadex";
import { notFound } from "next/navigation";
import ChapterList from "@/app/components/ChapterList";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const manga = await getMangaById(id);
  if (!manga) return { title: "Not Found" };
  return {
    title: `${manga.title} | Comichwa`,
    description: manga.description?.slice(0, 160) || "Read for free on Comichwa.",
  };
}

export default async function TitlePage({ params }) {
  const { id } = await params;
  const manga = await getMangaById(id);
  if (!manga) notFound();

  // 1. Try primary MangaDex entry first
  let { chapters } = await getMangaChapters(id);
  let source = "mangadex";
  let alternateTitle = null;

  // 2. If primary entry has fewer than 15 chapters (common for DMCA'd major series), check alternate releases (Official Colored, Digital Edition, etc.)
  if (chapters.length < 15) {
    const alt = await getAlternateMangaChapters(manga.title, manga.englishTitle, id, chapters.length);
    if (alt.chapters && alt.chapters.length > chapters.length) {
      chapters = alt.chapters;
      source = "alternate";
      alternateTitle = alt.alternateTitle;
    }
  }



  const statusColor = {
    ongoing: "text-green-400",
    completed: "text-blue-400",
    hiatus: "text-yellow-400",
    cancelled: "text-red-400",
  }[manga.status] || "text-zinc-400";

  return (
    <div className="min-h-screen pb-16">
      {/* Banner */}
      <div className="relative h-64 md:h-72 w-full overflow-hidden">
        <img src={manga.coverUrl} alt="" className="w-full h-full object-cover blur-xl scale-110 opacity-30" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <main className="container mx-auto px-4 max-w-5xl -mt-36 relative z-10">
        {/* Manga Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          {/* Cover */}
          <div className="shrink-0 w-40 md:w-52">
            <div className="aspect-[2/3] rounded-xl overflow-hidden border-2 border-border shadow-2xl">
              <img src={manga.coverUrl} alt={manga.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3 pt-4 md:pt-16">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-medium">
                {manga.type}
              </span>
              <span className={`text-xs font-semibold capitalize ${statusColor}`}>● {manga.status}</span>
              {manga.year && <span className="text-xs text-zinc-500">{manga.year}</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
              {manga.englishTitle ? (
                <>
                  <span className="title-original">{manga.title}</span>
                  <span className="title-english">{manga.englishTitle}</span>
                </>
              ) : (
                manga.title
              )}
            </h1>
            {manga.englishTitle && (
              <p className="text-sm text-zinc-500">
                <span className="title-original">English: <span className="text-zinc-400 italic">{manga.englishTitle}</span></span>
                <span className="title-english">Original: <span className="text-zinc-400 italic">{manga.title}</span></span>
              </p>
            )}            
            <p className="text-sm text-zinc-400">by <span className="text-zinc-300 font-medium">{manga.author}</span></p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-1">
              {manga.tags.slice(0, 8).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-card border border-border text-zinc-400">
                  {tag}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <p className="text-sm text-zinc-400 leading-relaxed line-clamp-4 mt-1">{manga.description || "No description available."}</p>
          </div>
        </div>

        {/* Chapter List Section */}
        <div>
          {chapters.length === 0 ? (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                Chapters
                <span className="text-sm font-normal text-zinc-500 bg-card px-2 py-0.5 rounded-md">0</span>
              </h2>
              <div className="rounded-xl border border-border bg-card p-8 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 text-2xl">
                  📖
                </div>
                <h3 className="text-lg font-bold text-zinc-200 mb-1">No English Chapters on MangaDex</h3>
                <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
                  English chapters for this title were removed from MangaDex due to publisher licensing restrictions. Read it for free on these sites:
                </p>

                {/* Free Reading Site Grid */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                  {[
                    { name: "MangaDex", icon: "📚", url: `https://mangadex.org/titles?q=${encodeURIComponent(manga.title)}`, color: "bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border-orange-500/30" },
                    { name: "Bato.to", icon: "🔖", url: `https://bato.to/search?word=${encodeURIComponent(manga.title)}`, color: "bg-green-500/15 hover:bg-green-500/25 text-green-300 border-green-500/30" },
                    { name: "MangaSee", icon: "👁️", url: `https://mangasee123.com/search/?q=${encodeURIComponent(manga.title)}`, color: "bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border-blue-500/30" },
                    { name: "Flame Scans", icon: "🔥", url: `https://flamecomics.xyz/?s=${encodeURIComponent(manga.title)}`, color: "bg-red-500/15 hover:bg-red-500/25 text-red-300 border-red-500/30" },
                    { name: "Asura Scans", icon: "⚡", url: `https://asuracomic.net/series?query=${encodeURIComponent(manga.title)}`, color: "bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border-purple-500/30" },
                    { name: "MangaKakalot", icon: "🌸", url: `https://ww5.mangakakalot.tv/search/${encodeURIComponent(manga.title.toLowerCase().replace(/[^a-z0-9]+/g, "_"))}`, color: "bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border-pink-500/30" },
                    { name: "Webtoon", icon: "🎨", url: `https://www.webtoons.com/en/search?keyword=${encodeURIComponent(manga.title)}`, color: "bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/30" },
                  ].map((site) => (
                    <a
                      key={site.name}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors ${site.color}`}
                    >
                      <span>{site.icon}</span>
                      <span>{site.name}</span>
                      <span className="text-[10px] opacity-60">↗</span>
                    </a>
                  ))}
                </div>

                {/* Official publisher links */}
                {manga.officialLinks && manga.officialLinks.length > 0 && (
                  <div className="w-full border-t border-border/50 pt-4 mt-2">
                    <p className="text-xs text-zinc-500 mb-3">Official publisher links:</p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {manga.officialLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          {link.name}
                          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <ChapterList chapters={chapters} source={source} alternateTitle={alternateTitle} officialLinks={manga.officialLinks} mangaTitle={manga.title} />
          )}
        </div>
      </main>
    </div>
  );
}
