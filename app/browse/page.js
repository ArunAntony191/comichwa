import Link from "next/link";
import { searchMangaApi } from "@/lib/mangadex";
import BrowseFilters from "@/app/components/BrowseFilters";

export const metadata = {
  title: "Browse Manga & Manhwa | Comichwa",
  description: "Search and browse thousands of manga, manhwa and manhua titles.",
};

function MangaCard({ manga }) {
  return (
    <Link href={`/title/${manga.id}`} className="group flex flex-col gap-2">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-card border border-border group-hover:border-primary transition-all duration-300 shadow-md">
        <img
          src={manga.coverUrl}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-2 left-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/80 text-white">{manga.type}</span>
        </div>
      </div>
      <h3 className="font-medium text-sm line-clamp-2 text-zinc-200 group-hover:text-primary transition-colors">
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

export default async function BrowsePage({ searchParams }) {
  const sp = await searchParams;
  const query = sp?.q || "";
  const sort = sp?.sort || "relevance";
  const genres = sp?.genres ? sp.genres.split(",") : [];
  const langs = sp?.langs ? sp.langs.split(",") : [];

  const { results, total } = await searchMangaApi(query, 36, 0, genres, sort, langs);

  const filterKey = `${query}-${sort}-${genres.join(",")}-${langs.join(",")}`;

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">
          {query ? `Results for "${query}"` : "Browse All Titles"}
        </h1>
        {total > 0 && <p className="text-zinc-500 text-sm">{total.toLocaleString()} titles found</p>}
      </div>

      {/* Filters */}
      <BrowseFilters 
        key={filterKey}
        initialQuery={query}
        initialSort={sort}
        initialGenres={genres}
        initialLangs={langs}
      />

      {/* Results Grid */}
      {results.length === 0 ? (
        <div className="py-24 text-center text-zinc-500">
          <p className="text-lg mb-2">No results found.</p>
          <p className="text-sm">Try a different search term or clear some filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map(manga => <MangaCard key={manga.id} manga={manga} />)}
        </div>
      )}
    </div>
  );
}
