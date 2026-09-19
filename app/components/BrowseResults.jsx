"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

function GridCard({ manga }) {
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
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/90 text-white backdrop-blur-md shadow-sm">
            {manga.type}
          </span>
        </div>
      </div>
      <h3 className="font-medium text-xs sm:text-sm line-clamp-2 text-zinc-200 group-hover:text-primary transition-colors leading-tight">
        {manga.englishTitle ? (
          <>
            <span className="title-original">{manga.title}</span>
            <span className="title-english">{manga.englishTitle}</span>
          </>
        ) : (
          <span>{manga.title}</span>
        )}
      </h3>
      <p className="text-[11px] text-zinc-500 capitalize">{manga.status} {manga.year ? `• ${manga.year}` : ""}</p>
    </Link>
  );
}

function ListCard({ manga }) {
  return (
    <Link
      href={`/title/${manga.id}`}
      className="group flex gap-4 p-3.5 rounded-2xl bg-[#16191e] border border-zinc-800/80 hover:border-cyan-500/60 transition-all duration-300 shadow-md hover:shadow-cyan-500/5"
    >
      {/* Thumbnail */}
      <div className="relative w-28 sm:w-36 aspect-[2/3] shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-cyan-500/40 transition-colors">
        <img
          src={manga.coverUrl}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 left-2">
          <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/90 text-black shadow-sm">
            {manga.type}
          </span>
        </div>
      </div>

      {/* Details Right Side */}
      <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
        <div className="space-y-1.5">
          {/* Title */}
          <h3 className="font-extrabold text-sm sm:text-base text-zinc-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
            {manga.englishTitle ? (
              <>
                <span className="title-original">{manga.title}</span>
                <span className="title-english">{manga.englishTitle}</span>
              </>
            ) : (
              <span>{manga.title}</span>
            )}
          </h3>

          {/* Metadata Line: TYPE • YEAR • STATUS • AUTHOR */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <span className="text-cyan-400 font-bold">{manga.type}</span>
            {manga.year && (
              <>
                <span>•</span>
                <span>{manga.year}</span>
              </>
            )}
            <span>•</span>
            <span className="capitalize text-emerald-400">{manga.status}</span>
            {manga.author && manga.author !== "Unknown" && (
              <>
                <span>•</span>
                <span className="text-zinc-400 line-clamp-1">by {manga.author}</span>
              </>
            )}
          </div>

          {/* Synopsis preview */}
          {manga.description && (
            <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed pt-1">
              {manga.description}
            </p>
          )}
        </div>

        {/* Tags cloud preview */}
        {manga.tags && manga.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {manga.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function BrowseResults({ results = [], total = 0 }) {
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const savedMode = localStorage.getItem("comichwa_view_mode");
    if (savedMode === "list" || savedMode === "grid") {
      setViewMode(savedMode);
    }
  }, []);

  const handleModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem("comichwa_view_mode", mode);
  };

  return (
    <div className="space-y-4">
      {/* Info bar & View Toggle */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs font-mono font-bold text-zinc-400 tracking-wide">
          {total.toLocaleString()} items
        </div>

        {/* Grid / List View Buttons */}
        <div className="flex items-center gap-1 bg-[#16191e] p-1 rounded-lg border border-zinc-800">
          {/* List View Toggle (≡) */}
          <button
            type="button"
            onClick={() => handleModeChange("list")}
            title="List View"
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "list"
                ? "bg-cyan-500 text-black shadow-sm font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Grid View Toggle (㗊) */}
          <button
            type="button"
            onClick={() => handleModeChange("grid")}
            title="Grid View"
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "grid"
                ? "bg-cyan-500 text-black shadow-sm font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {results.length === 0 ? (
        <div className="py-24 text-center text-zinc-500">
          <p className="text-lg mb-2">No results found.</p>
          <p className="text-sm">Try a different search term or clear some filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Layout */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((manga) => (
            <GridCard key={manga.id} manga={manga} />
          ))}
        </div>
      ) : (
        /* List Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {results.map((manga) => (
            <ListCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}
