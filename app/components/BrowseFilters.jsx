"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AVAILABLE_GENRES = [
  { id: "391b0423-d847-456f-aff0-8b0cfc03066b", name: "Action" },
  { id: "87cc87cd-a395-47af-b27a-93258283bbc6", name: "Adventure" },
  { id: "4d32cc48-9f00-4cca-9b5a-a839f0764984", name: "Comedy" },
  { id: "b9af3a63-f058-46de-a9a0-e0c13906197a", name: "Drama" },
  { id: "cdc58593-87dd-415e-bbc0-2ec27bf404cc", name: "Fantasy" },
  { id: "33771934-028e-4cb3-8744-691e866a923e", name: "Historical" },
  { id: "cdad7e68-1419-41dd-bdce-27753074a640", name: "Horror" },
  { id: "ace04997-f6bd-436e-b261-779182193d3d", name: "Isekai" },
  { id: "ee968100-4191-4968-93d3-f82d72be7e46", name: "Mystery" },
  { id: "3b60b75c-a2d7-4860-ab56-05f391bb889c", name: "Psychological" },
  { id: "423e2eae-a7a2-4a8b-ac03-a8351462d71d", name: "Romance" },
  { id: "256c8bd9-4904-4360-bf4f-508a76d67183", name: "Sci-Fi" },
  { id: "e5301a23-ebd9-49dd-a0cb-2add944c7fe9", name: "Slice of Life" },
  { id: "69964a64-2f90-4d33-beeb-f3ed2875eb4c", name: "Sports" },
  { id: "07251805-a27e-4d59-b488-f0bfbec15168", name: "Thriller" }
];

const LANGUAGES = [
  { code: "ja", name: "Manga (Japanese)" },
  { code: "ko", name: "Manhwa (Korean)" },
  { code: "zh", name: "Manhua (Chinese)" }
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "followedCount", label: "Popularity" },
  { value: "rating", label: "Rating" },
  { value: "updatedAt", label: "Latest Updates" },
  { value: "createdAt", label: "Newest Added" }
];

export default function BrowseFilters({ initialQuery = "", initialSort = "relevance", initialGenres = [], initialLangs = [] }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedGenres, setSelectedGenres] = useState(initialGenres);
  const [selectedLangs, setSelectedLangs] = useState(initialLangs);
  const [showMobileFilters, setShowMobileFilters] = useState(false);


  const updateUrl = (newQuery, newSort, newGenres, newLangs) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set("q", newQuery.trim());
    if (newSort && newSort !== "relevance") params.set("sort", newSort);
    if (newGenres.length > 0) params.set("genres", newGenres.join(","));
    if (newLangs.length > 0) params.set("langs", newLangs.join(","));

    router.push(`/browse?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrl(query, selectedSort, selectedGenres, selectedLangs);
  };

  const toggleGenre = (genreId) => {
    const nextGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter(g => g !== genreId)
      : [...selectedGenres, genreId];
    setSelectedGenres(nextGenres);
    updateUrl(query, selectedSort, nextGenres, selectedLangs);
  };

  const toggleLang = (langCode) => {
    const nextLangs = selectedLangs.includes(langCode)
      ? selectedLangs.filter(l => l !== langCode)
      : [...selectedLangs, langCode];
    setSelectedLangs(nextLangs);
    updateUrl(query, selectedSort, selectedGenres, nextLangs);
  };

  const handleSortChange = (newSort) => {
    setSelectedSort(newSort);
    updateUrl(query, newSort, selectedGenres, selectedLangs);
  };

  const handleReset = () => {
    setQuery("");
    setSelectedSort("relevance");
    setSelectedGenres([]);
    setSelectedLangs([]);
    router.push("/browse");
  };

  const hasActiveFilters = query || selectedSort !== "relevance" || selectedGenres.length > 0 || selectedLangs.length > 0;

  return (
    <div className="space-y-6 bg-card border border-border rounded-2xl p-6 shadow-xl">
      {/* Search and Mobile Toggle Row */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg relative">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search within filters..."
            className="w-full bg-background border border-border rounded-full pl-4 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>

        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors border border-border hover:border-zinc-500 rounded-full"
            >
              Reset All
            </button>
          )}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex-1 px-4 py-2 text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-full flex items-center justify-center gap-2 border border-zinc-700"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            {showMobileFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {/* Expandable filters block */}
      <div className={`${showMobileFilters ? "block" : "hidden"} md:block space-y-6 pt-4 border-t border-border`}>
        {/* Sort and original language row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sorting */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Sort Preference</label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSortChange(opt.value)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                    selectedSort === opt.value
                      ? "bg-primary border-primary text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                      : "bg-background border-border hover:border-zinc-500 text-zinc-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Formats / Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Format / Type</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLangs.includes(lang.code);
                return (
                  <button
                    key={lang.code}
                    onClick={() => toggleLang(lang.code)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                      isSelected
                        ? "bg-primary border-primary text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                        : "bg-background border-border hover:border-zinc-500 text-zinc-400"
                    }`}
                  >
                    {lang.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Genres tag cloud */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Genres</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre.id);
              return (
                <button
                  key={genre.id}
                  onClick={() => toggleGenre(genre.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                    isSelected
                      ? "bg-primary border-primary text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                      : "bg-background border-border hover:border-zinc-500 text-zinc-400"
                  }`}
                >
                  {genre.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
