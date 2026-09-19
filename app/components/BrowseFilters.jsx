"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

// Safe Genres
const SAFE_GENRES = [
  { id: "391b0423-d847-456f-aff0-8b0cfc03066b", name: "Action" },
  { id: "87cc87cd-a395-47af-b27a-93258283bbc6", name: "Adventure" },
  { id: "a3c44f8f-492e-490f-8c3f-883a3a4f5800", name: "Boys Love" },
  { id: "4d32cc48-9f00-4cca-9b5a-a839f0764984", name: "Comedy" },
  { id: "5ca107a2-6628-406c-b975-d19580bf60c7", name: "Crime" },
  { id: "b9af3a63-f058-46de-a9a0-e0c13906197a", name: "Drama" },
  { id: "cdc58593-87dd-415e-bbc0-2ec27bf404cc", name: "Fantasy" },
  { id: "a3e40450-55cb-4f0f-8451-d338026d6a4e", name: "Girls Love" },
  { id: "faf75160-234e-484e-a400-709177178ee2", name: "Harem" },
  { id: "33771934-028e-4cb3-8744-691e866a923e", name: "Historical" },
  { id: "cdad7e68-1419-41dd-bdce-27753074a640", name: "Horror" },
  { id: "ace04997-f6bd-436e-b261-779182193d3d", name: "Isekai" },
  { id: "81c836c9-4d48-456a-a3a3-95385b61001c", name: "Magical Girls" },
  { id: "5010472f-bbb2-4fc0-99e3-5507904d0927", name: "Mecha" },
  { id: "c7703008-a414-4049-8d0c-90fba71f65d6", name: "Medical" },
  { id: "ee968100-4191-4968-93d3-f82d72be7e46", name: "Mystery" },
  { id: "3b60b75c-a2d7-4860-ab56-05f391bb889c", name: "Psychological" },
  { id: "423e2eae-a7a2-4a8b-ac03-a8351462d71d", name: "Romance" },
  { id: "256c8bd9-4904-4360-bf4f-508a76d67183", name: "Sci-Fi" },
  { id: "e5301a23-ebd9-49dd-a0cb-2add944c7fe9", name: "Slice of Life" },
  { id: "69964a64-2f90-4d33-beeb-f3ed2875eb4c", name: "Sports" },
  { id: "7081736e-7692-499f-b50a-1119e616954b", name: "Superhero" },
  { id: "07251805-a27e-4d59-b488-f0bfbec15168", name: "Thriller" },
  { id: "f8f62932-27da-44e9-b6a6-8730f00d77ec", name: "Tragedy" },
  { id: "acc803a7-09d9-4514-8a71-501958610580", name: "Wuxia" }
];

// Mature / Erotica Tags (Unlocked only when 18+ content toggle is ON)
const MATURE_GENRES = [
  { id: "b29444b7-0b8a-45b4-bb52-d83928b62986", name: "Mature 🔞" },
  { id: "e137081f-999b-4ef8-a05d-6c2e3794b150", name: "Adult 🔞" },
  { id: "2d1f5d56-a1e5-4d0d-a035-64863d1ac29c", name: "Smut 🔞" },
  { id: "97893a4c-12af-4dac-b6be-0dffb3535699", name: "Erotica 🔞" }
];

const ALL_FORMATS = [
  { id: "b11563f3-9b94-436f-8564-9696d57b5075", name: "4-Koma" },
  { id: "f4124477-925b-4f0e-8540-50fac3572817", name: "Adaptation" },
  { id: "51d83892-414e-4636-b58d-96d13d9e716c", name: "Anthology" },
  { id: "0a86b992-a845-4e5e-a713-b656b9e9305d", name: "Award Winning" },
  { id: "f5ba408b-0581-43a9-a41a-9696413204ed", name: "Full Color" },
  { id: "3e2b8c8f-c96c-43f5-8392-4410d0426d06", name: "Long Strip" },
  { id: "0232a24c-9f27-4e3d-a6f6-91e1493f01f2", name: "Oneshot" },
  { id: "e197df38-d0e7-43b5-9b09-2842d0c326dd", name: "Web Comic" }
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Best match" },
  { value: "followedCount", label: "Popularity" },
  { value: "rating", label: "Rating" },
  { value: "updatedAt", label: "Latest updates" },
  { value: "createdAt", label: "Newest added" }
];

const TYPES = [
  { code: "", label: "Any" },
  { code: "en", label: "Comic (Western / English)" },
  { code: "ja", label: "Manga (Japanese)" },
  { code: "ko", label: "Manhwa (Korean)" },
  { code: "zh", label: "Manhua (Chinese)" }
];

const DEMOGRAPHICS = [
  { value: "", label: "Any" },
  { value: "shounen", label: "Shounen" },
  { value: "shoujo", label: "Shoujo" },
  { value: "seinen", label: "Seinen" },
  { value: "josei", label: "Josei" }
];

const STATUSES = [
  { value: "", label: "Any" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "hiatus", label: "Hiatus" },
  { value: "cancelled", label: "Cancelled" }
];

export default function BrowseFilters({
  initialQuery = "",
  initialSort = "relevance",
  initialGenres = [],
  initialLangs = [],
  initialDemographics = [],
  initialStatuses = [],
  initialYearFrom = "",
  initialYearTo = "",
  initialTagMode = "AND",
  initialRatings = ["safe", "suggestive"]
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedGenres, setSelectedGenres] = useState(initialGenres);
  const [selectedLangs, setSelectedLangs] = useState(initialLangs);
  const [selectedDemographic, setSelectedDemographic] = useState(initialDemographics[0] || "");
  const [selectedStatus, setSelectedStatus] = useState(initialStatuses[0] || "");
  const [yearFrom, setYearFrom] = useState(initialYearFrom);
  const [tagMode, setTagMode] = useState(initialTagMode);
  const [selectedRatings, setSelectedRatings] = useState(initialRatings);

  const [allowNsfw, setAllowNsfw] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [genresOpen, setGenresOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const dropdownRef = useRef(null);

  // Sync settings state from localStorage & event listener
  useEffect(() => {
    const checkNsfwSetting = () => {
      const isAllowed = localStorage.getItem("comichwa_allow_nsfw") === "true";
      setAllowNsfw(isAllowed);
    };

    checkNsfwSetting();
    window.addEventListener("comichwa_settings_changed", checkNsfwSetting);
    return () => window.removeEventListener("comichwa_settings_changed", checkNsfwSetting);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setGenresOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableGenres = allowNsfw ? [...SAFE_GENRES, ...MATURE_GENRES] : SAFE_GENRES;

  const updateUrl = (newParams) => {
    const params = new URLSearchParams();
    
    const q = newParams.query !== undefined ? newParams.query : query;
    const sort = newParams.sort !== undefined ? newParams.sort : selectedSort;
    const genres = newParams.genres !== undefined ? newParams.genres : selectedGenres;
    const langs = newParams.langs !== undefined ? newParams.langs : selectedLangs;
    const demo = newParams.demographic !== undefined ? newParams.demographic : selectedDemographic;
    const stat = newParams.status !== undefined ? newParams.status : selectedStatus;
    const yr = newParams.yearFrom !== undefined ? newParams.yearFrom : yearFrom;
    const mode = newParams.tagMode !== undefined ? newParams.tagMode : tagMode;
    const rts = newParams.ratings !== undefined ? newParams.ratings : selectedRatings;

    if (q.trim()) params.set("q", q.trim());
    if (sort && sort !== "relevance") params.set("sort", sort);
    if (genres.length > 0) params.set("genres", genres.join(","));
    if (langs.length > 0) params.set("langs", langs.join(","));
    if (demo) params.set("demographics", demo);
    if (stat) params.set("statuses", stat);
    if (yr) params.set("yearFrom", yr);
    if (mode && mode !== "AND") params.set("tagMode", mode);
    if (allowNsfw && rts.length > 0) params.set("ratings", rts.join(","));

    router.push(`/browse?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrl({ query });
  };

  const toggleGenre = (id) => {
    const next = selectedGenres.includes(id)
      ? selectedGenres.filter(g => g !== id)
      : [...selectedGenres, id];
    setSelectedGenres(next);
    updateUrl({ genres: next });
  };

  const handleTypeChange = (langCode) => {
    const nextLangs = langCode ? [langCode] : [];
    setSelectedLangs(nextLangs);
    updateUrl({ langs: nextLangs });
  };

  const handleDemographicChange = (val) => {
    setSelectedDemographic(val);
    updateUrl({ demographic: val });
  };

  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    updateUrl({ status: val });
  };

  const handleSortChange = (val) => {
    setSelectedSort(val);
    updateUrl({ sort: val });
  };

  const handleTagModeChange = (mode) => {
    setTagMode(mode);
    updateUrl({ tagMode: mode });
  };

  const handleRatingChange = (val) => {
    let rts = ["safe", "suggestive"];
    if (val === "erotica") rts = ["erotica"];
    else if (val === "all") rts = ["safe", "suggestive", "erotica"];
    
    setSelectedRatings(rts);
    updateUrl({ ratings: rts });
  };

  const handleReset = () => {
    setQuery("");
    setSelectedSort("relevance");
    setSelectedGenres([]);
    setSelectedLangs([]);
    setSelectedDemographic("");
    setSelectedStatus("");
    setYearFrom("");
    setTagMode("AND");
    setSelectedRatings(["safe", "suggestive"]);
    router.push("/browse");
  };

  const handleFeelingLucky = () => {
    router.push("/api/random");
  };

  const filteredGenres = availableGenres.filter(g => g.name.toLowerCase().includes(tagSearch.toLowerCase()));
  const filteredFormats = ALL_FORMATS.filter(f => f.name.toLowerCase().includes(tagSearch.toLowerCase()));

  const hasActiveFilters =
    query ||
    selectedSort !== "relevance" ||
    selectedGenres.length > 0 ||
    selectedLangs.length > 0 ||
    selectedDemographic ||
    selectedStatus ||
    yearFrom;

  return (
    <div className="space-y-4">
      {/* Top Search & Toggle Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <div className="relative flex items-center">
            <svg className="w-4 h-4 absolute left-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any title..."
              className="w-full bg-[#181a1d] border border-zinc-800 rounded-lg pl-10 pr-24 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); updateUrl({ query: "" }); }}
                className="absolute right-20 text-xs text-zinc-500 hover:text-zinc-300 px-1"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors border border-zinc-700"
            >
              Browse
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-colors border ${
            showAdvanced
              ? "bg-zinc-800 border-cyan-500/50 text-cyan-400"
              : "bg-[#181a1d] border-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Advanced Filters
        </button>
      </div>

      {/* Filter Grid */}
      {showAdvanced && (
        <div className="bg-[#181a1d] border border-zinc-800/80 rounded-xl p-4 space-y-4 shadow-xl text-xs text-zinc-300">
          {/* First Filter Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Sort By */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-1">Sort By</label>
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full bg-[#111315] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Content Rating */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-1">Content Rating</label>
              {allowNsfw ? (
                <select
                  onChange={(e) => handleRatingChange(e.target.value)}
                  className="w-full bg-[#111315] border border-amber-500/50 rounded-lg px-3 py-2 text-amber-400 font-semibold text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="safe">Safe + Suggestive</option>
                  <option value="erotica">Erotica (18+)</option>
                  <option value="all">Safe, Suggestive & Erotica</option>
                </select>
              ) : (
                <div className="w-full bg-[#111315] border border-zinc-800 rounded-lg px-3 py-2 text-emerald-400 font-semibold text-xs flex items-center justify-between">
                  <span>Safe</span>
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">SFW</span>
                </div>
              )}
            </div>

            {/* Types */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-1">Types</label>
              <select
                value={selectedLangs[0] || ""}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full bg-[#111315] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {TYPES.map((t) => (
                  <option key={t.code} value={t.code}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Genres Popover Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-1">
                Genres {allowNsfw && <span className="text-red-400 font-bold">(18+ Unlocked)</span>}
              </label>
              <button
                type="button"
                onClick={() => setGenresOpen(!genresOpen)}
                className={`w-full bg-[#111315] border rounded-lg px-3 py-2 text-xs text-left flex items-center justify-between transition-colors ${
                  selectedGenres.length > 0
                    ? "border-cyan-500 text-cyan-400 font-semibold"
                    : "border-zinc-800 text-zinc-200"
                }`}
              >
                <span className="truncate">
                  {selectedGenres.length > 0
                    ? `${selectedGenres.length} selected`
                    : "Any"}
                </span>
                <svg className={`w-3.5 h-3.5 transition-transform ${genresOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Genres Dropdown Modal */}
              {genresOpen && (
                <div className="absolute left-0 sm:left-auto right-0 sm:right-auto w-full sm:w-[480px] max-w-[90vw] mt-2 bg-[#141618] border border-zinc-800 rounded-xl shadow-2xl p-4 z-50 space-y-3">
                  {/* Match mode header */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Match Mode</span>
                    <div className="flex gap-1 bg-[#0d0e10] p-1 rounded-md border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => handleTagModeChange("AND")}
                        className={`px-3 py-0.5 rounded text-[10px] font-bold transition-all ${
                          tagMode === "AND"
                            ? "bg-cyan-500 text-black shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        AND
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTagModeChange("OR")}
                        className={`px-3 py-0.5 rounded text-[10px] font-bold transition-all ${
                          tagMode === "OR"
                            ? "bg-cyan-500 text-black shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        OR
                      </button>
                    </div>
                  </div>

                  {/* Search inside tags */}
                  <div className="relative">
                    <input
                      type="text"
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Type to filter tags..."
                      className="w-full bg-[#0d0e10] border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Genres List */}
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Genres</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {filteredGenres.map((g) => {
                          const isChecked = selectedGenres.includes(g.id);
                          const isMature = g.name.includes("🔞");
                          return (
                            <label
                              key={g.id}
                              onClick={() => toggleGenre(g.id)}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                isChecked
                                  ? isMature 
                                    ? "bg-red-500/20 border-red-500 text-red-400 font-semibold"
                                    : "bg-cyan-500/10 border-cyan-500 text-cyan-400 font-semibold"
                                  : isMature
                                    ? "bg-red-950/20 border-red-900/50 text-red-400/80 hover:border-red-600"
                                    : "bg-[#0d0e10] border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
                              />
                              <span className="truncate">{g.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Formats Section */}
                    {filteredFormats.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Formats</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {filteredFormats.map((f) => {
                            const isChecked = selectedGenres.includes(f.id);
                            return (
                              <label
                                key={f.id}
                                onClick={() => toggleGenre(f.id)}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                                  isChecked
                                    ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 font-semibold"
                                    : "bg-[#0d0e10] border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-cyan-500 focus:ring-0"
                                />
                                <span className="truncate">{f.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Dropdown footer info */}
                  <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-500">
                    <span>{selectedGenres.length} tags active</span>
                    <button
                      type="button"
                      onClick={() => setGenresOpen(false)}
                      className="text-cyan-400 hover:underline font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Demographic */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-1">Demographic</label>
              <select
                value={selectedDemographic}
                onChange={(e) => handleDemographicChange(e.target.value)}
                className="w-full bg-[#111315] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {DEMOGRAPHICS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Release Status */}
            <div>
              <label className="block text-[10px] font-bold tracking-wider text-zinc-400 uppercase mb-1">Release Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-[#111315] border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Second Filter Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
            {/* Release Year */}
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase whitespace-nowrap">Release Year</label>
              <input
                type="number"
                placeholder="From"
                value={yearFrom}
                onChange={(e) => {
                  setYearFrom(e.target.value);
                  updateUrl({ yearFrom: e.target.value });
                }}
                className="w-20 bg-[#111315] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Action Buttons: Reset & I'm Feeling Lucky */}
            <div className="flex items-center gap-2 justify-end">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors border border-zinc-700"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </button>
              )}

              <button
                type="button"
                onClick={handleFeelingLucky}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black font-extrabold rounded-lg text-xs tracking-wider uppercase transition-all shadow-md shadow-cyan-500/20"
              >
                <span>🎲</span>
                <span>I'm Feeling Lucky</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
