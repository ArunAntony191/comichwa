import Link from "next/link";
import { getTrending, getLatestUpdates } from "@/lib/mangadex";

export const metadata = {
  title: "Comichwa | Read Manga & Manhwa Free Online",
  description: "Read thousands of manga, manhwa and manhua online for free. Updated daily with the latest chapters.",
};

function MangaCard({ manga }) {
  return (
    <Link href={`/title/${manga.id}`} className="group flex flex-col gap-2">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-card border border-border group-hover:border-primary transition-all duration-300 shadow-lg">
        <img
          src={manga.coverUrl}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/80 text-white backdrop-blur-sm">
            {manga.type}
          </span>
        </div>
      </div>
      <h3 className="font-medium text-sm line-clamp-2 text-zinc-200 group-hover:text-primary transition-colors leading-tight">
        {manga.englishTitle ? (
          <>
            <span className="title-original">{manga.title}</span>
            <span className="title-english">{manga.englishTitle}</span>
          </>
        ) : (
          <span>{manga.title}</span>
        )}
      </h3>
      <p className="text-xs text-zinc-500 capitalize">{manga.status}</p>
    </Link>
  );
}

export default async function Home() {
  const [trending, latest] = await Promise.all([
    getTrending(18),
    getLatestUpdates(18),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-b from-primary/10 via-background to-background pt-20 pb-10 px-4 text-center border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
          Read <span className="text-primary">Manga</span>, <span className="text-primary">Manhwa</span> & <span className="text-primary">Comics</span> Free
        </h1>
        <p className="text-zinc-400 text-lg mb-6">Thousands of Japanese, Korean, Chinese & Western titles updated daily.</p>
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <Link href="/browse?langs=ja" className="px-4 py-1.5 rounded-full bg-card border border-border hover:border-primary text-xs font-semibold transition-all">
            🇯🇵 Manga
          </Link>
          <Link href="/browse?langs=ko" className="px-4 py-1.5 rounded-full bg-card border border-border hover:border-primary text-xs font-semibold transition-all">
            🇰🇷 Manhwa
          </Link>
          <Link href="/browse?langs=zh" className="px-4 py-1.5 rounded-full bg-card border border-border hover:border-primary text-xs font-semibold transition-all">
            🇨🇳 Manhua
          </Link>
          <Link href="/browse?langs=en" className="px-4 py-1.5 rounded-full bg-card border border-border hover:border-primary text-xs font-semibold transition-all text-primary font-bold">
            🦸 Western Comics
          </Link>
        </div>

        <Link href="/browse" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold px-6 py-3 rounded-full transition-colors">
          Browse All Titles →
        </Link>
      </div>

      <main className="container mx-auto px-4 py-10 max-w-7xl space-y-14">
        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              🔥 Trending Now
            </h2>
            <Link href="/browse?sort=followedCount" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trending.map(manga => <MangaCard key={manga.id} manga={manga} />)}
          </div>
        </section>

        {/* Latest Updates */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              🕐 Latest Updates
            </h2>
            <Link href="/browse?sort=updatedAt" className="text-sm text-primary hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {latest.map(manga => <MangaCard key={manga.id} manga={manga} />)}
          </div>
        </section>
      </main>
    </div>
  );
}
