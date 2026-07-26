import Link from "next/link";
import { getMangaById, getMangaChapters } from "@/lib/mangadex";
import { notFound } from "next/navigation";

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

  const { chapters } = await getMangaChapters(id, 96, 0);

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

        {/* Chapter List */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            Chapters
            <span className="text-sm font-normal text-zinc-500 bg-card px-2 py-0.5 rounded-md">{chapters.length}</span>
          </h2>

          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
            {chapters.length === 0 && (
              <div className="p-6 text-center text-zinc-500">No English chapters available yet.</div>
            )}
            {chapters.map(ch => {
              const isExternal = ch.isExternal && ch.externalUrl;
              return (
                <Link
                  key={ch.id}
                  href={isExternal ? ch.externalUrl : `/read/${ch.id}`}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="flex items-center justify-between px-5 py-3.5 bg-card hover:bg-zinc-800 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-zinc-200 group-hover:text-primary transition-colors">
                    Chapter {ch.chapter}
                    {ch.title && <span className="text-zinc-500 font-normal ml-2 text-sm">— {ch.title}</span>}
                  </span>
                  {ch.isExternal && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-medium">
                      External
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-6 text-sm text-zinc-500 shrink-0">
                  <span className="hidden sm:flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {ch.group}
                  </span>
                  <span className="w-20 text-right text-xs">
                    {new Date(ch.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </Link>
            );
          })}
          </div>
        </div>
      </main>
    </div>
  );
}
