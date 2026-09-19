import { searchMangaApi } from "@/lib/mangadex";
import BrowseFilters from "@/app/components/BrowseFilters";
import BrowseResults from "@/app/components/BrowseResults";

export const metadata = {
  title: "Browse Manga & Manhwa | Comichwa",
  description: "Search and browse thousands of manga, manhwa and manhua titles.",
};

export default async function BrowsePage({ searchParams }) {
  const sp = await searchParams;
  const query = sp?.q || "";
  const sort = sp?.sort || "relevance";
  const genres = sp?.genres ? sp.genres.split(",") : [];
  const langs = sp?.langs ? sp.langs.split(",") : [];
  const demographics = sp?.demographics ? sp.demographics.split(",") : [];
  const statuses = sp?.statuses ? sp.statuses.split(",") : [];
  const yearFrom = sp?.yearFrom || "";
  const yearTo = sp?.yearTo || "";
  const tagMode = sp?.tagMode || "AND";
  const ratings = sp?.ratings ? sp.ratings.split(",") : ["safe", "suggestive"];

  const { results, total } = await searchMangaApi(
    query,
    36,
    0,
    genres,
    sort,
    langs,
    demographics,
    statuses,
    yearFrom,
    yearTo,
    tagMode,
    ratings
  );

  const filterKey = `${query}-${sort}-${genres.join(",")}-${langs.join(",")}-${demographics.join(",")}-${statuses.join(",")}-${yearFrom}-${tagMode}-${ratings.join(",")}`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {query ? `Results for "${query}"` : "Browse Titles"}
          </h1>
        </div>
      </div>

      {/* Comix-Style Advanced Filters */}
      <BrowseFilters 
        key={filterKey}
        initialQuery={query}
        initialSort={sort}
        initialGenres={genres}
        initialLangs={langs}
        initialDemographics={demographics}
        initialStatuses={statuses}
        initialYearFrom={yearFrom}
        initialYearTo={yearTo}
        initialTagMode={tagMode}
      />

      {/* Interactive Grid & List Results View */}
      <BrowseResults results={results} total={total} />
    </div>
  );
}
