"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Pagination from "@/app/components/Pagination";

export default function ChapterList({ chapters = [], source = "mangadex", alternateTitle = null, officialLinks = [], mangaTitle = "" }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' or 'asc'

  const containerRef = useRef(null);

  // Filter & Sort chapters
  const filteredChapters = useMemo(() => {
    let result = [...chapters];

    if (searchQuery.trim()) {
      const rawQ = searchQuery.toLowerCase().trim();
      const cleanQ = rawQ.replace(/^(ch|chapter)\s*/, "");
      const numericQ = parseFloat(cleanQ);

      result = result.filter(ch => {
        const numStr = String(ch.chapter || "").toLowerCase();
        const titleStr = String(ch.title || "").toLowerCase();
        const chNum = parseFloat(ch.chapter);

        // 1. Direct substring match (e.g., "150" or "boss")
        if (numStr.includes(rawQ) || titleStr.includes(rawQ) || numStr.includes(cleanQ)) return true;
        // 2. Numeric equivalence (e.g. searching "01" or "001" matches Chapter 1)
        if (!isNaN(numericQ) && !isNaN(chNum) && chNum === numericQ) return true;

        return false;
      });
    }

    result.sort((a, b) => {
      const numA = parseFloat(a.chapter) || 0;
      const numB = parseFloat(b.chapter) || 0;
      return sortOrder === "desc" ? numB - numA : numA - numB;
    });

    return result;
  }, [chapters, searchQuery, sortOrder]);

  const totalItems = filteredChapters.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Detect missing chapters: either missing early ones (starts > ch.5) or a gap in the sequence
  const missingInfo = useMemo(() => {
    if (chapters.length === 0) return null;

    const nums = chapters
      .map(c => parseFloat(c.chapter))
      .filter(n => !isNaN(n) && n > 0)
      .sort((a, b) => a - b);

    if (nums.length === 0) return null;

    const minCh = nums[0];
    const maxCh = nums[nums.length - 1];

    // 1. Missing early chapters (doesn't start at ch.1)
    if (minCh > 5) {
      return { type: "early", from: 1, to: Math.floor(minCh) - 1, resumeAt: minCh };
    }

    // 2. Detect the largest gap in the middle of the sequence
    let biggestGapStart = null;
    let biggestGapEnd = null;
    let biggestGapSize = 0;

    for (let i = 0; i < nums.length - 1; i++) {
      const gap = nums[i + 1] - nums[i];
      // A gap > 5 chapters (ignoring decimal differences like 10.1 -> 11)
      if (gap > 5 && gap > biggestGapSize) {
        biggestGapSize = gap;
        biggestGapStart = Math.floor(nums[i]) + 1;
        biggestGapEnd = Math.ceil(nums[i + 1]) - 1;
      }
    }

    if (biggestGapStart !== null && biggestGapSize > 5) {
      return { type: "gap", from: biggestGapStart, to: biggestGapEnd, resumeAt: null };
    }

    return null;
  }, [chapters]);

  // Keep minChapter for backward compat (used as trigger condition)
  const minChapter = missingInfo?.type === "early" ? missingInfo.resumeAt : null;

  // Ensure current page stays valid when filter changes
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = totalItems === 0 ? 0 : (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const visibleChapters = filteredChapters.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === activePage) return;
    setCurrentPage(newPage);
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Generate pagination numbers array
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, activePage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div ref={containerRef} className="space-y-4">
      {/* 1. Missing / Gap Chapters Notice Banner (shown if early/gap chapters missing) */}
      {missingInfo && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center gap-3 text-xs text-amber-300">
          <span className="text-lg shrink-0">⚠️</span>
          <span>
            <strong>Notice:</strong>{" "}
            {missingInfo.type === "early" ? (
              <>Chapters {missingInfo.from}–{missingInfo.to} are unavailable on MangaDex due to licensing. Available here from <strong>Ch. {missingInfo.resumeAt}</strong>.</>
            ) : (
              <>Chapters {missingInfo.from}–{missingInfo.to} are missing from this release due to licensing restrictions.</>
            )}
            {" "}You can read the missing chapters for free on the alternative sites below.
          </span>
        </div>
      )}

      {/* 2. Alternative Free Reading Sources Bar (Always visible for ALL titles) */}
      {mangaTitle && (
        <div className="bg-[#16191e] border border-zinc-800/90 rounded-xl p-3.5 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span>🌐</span>
              <span>Alternative Free Reading Sites</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-normal normal-case hidden sm:inline">
              If a chapter fails to load, try these alternative sources
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              {
                name: "MangaDex",
                icon: "📚",
                url: `https://mangadex.org/titles?q=${encodeURIComponent(mangaTitle)}`,
                color: "bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border-orange-500/30"
              },
              {
                name: "ComicK",
                icon: "🚀",
                url: `https://comick.io/search?q=${encodeURIComponent(mangaTitle)}`,
                color: "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
              },
              {
                name: "Bato.to",
                icon: "🔖",
                url: `https://bato.to/search?word=${encodeURIComponent(mangaTitle)}`,
                color: "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              },
              {
                name: "MangaSee",
                icon: "👁️",
                url: `https://mangasee123.com/search/?q=${encodeURIComponent(mangaTitle)}`,
                color: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/30"
              },
              {
                name: "Flame Scans",
                icon: "🔥",
                url: `https://flamecomics.xyz/?s=${encodeURIComponent(mangaTitle)}`,
                color: "bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/30"
              },
              {
                name: "Asura Scans",
                icon: "⚡",
                url: `https://asuracomic.net/series?query=${encodeURIComponent(mangaTitle)}`,
                color: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/30"
              },
              {
                name: "MangaKakalot",
                icon: "🌸",
                url: `https://ww5.mangakakalot.tv/search/${encodeURIComponent(mangaTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_"))}`,
                color: "bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border-pink-500/30"
              },
              {
                name: "Webtoon",
                icon: "🎨",
                url: `https://www.webtoons.com/en/search?keyword=${encodeURIComponent(mangaTitle)}`,
                color: "bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border-teal-500/30"
              },
            ].map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm ${site.color}`}
              >
                <span>{site.icon}</span>
                <span>{site.name}</span>
                <span className="text-[10px] opacity-60">↗</span>
              </a>
            ))}

            {/* Official publisher links if available */}
            {officialLinks && officialLinks.map((link, i) => (
              <a
                key={`official-${i}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-sm"
              >
                <span>🏆</span>
                <span>{link.name}</span>
                <span className="text-[10px] opacity-60">↗</span>
              </a>
            ))}
          </div>
        </div>
      )}


      {/* Chapter List Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3.5 rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Chapters
            <span className="text-xs font-semibold text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700/60">
              {searchQuery ? `${totalItems} / ${chapters.length}` : chapters.length}
            </span>
          </h2>
          {source === "alternate" && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              via {alternateTitle}
            </span>
          )}
        </div>

        {/* Filter / Sort / Page Size controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              placeholder="Search chapter..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded-lg pl-8 pr-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-primary transition-colors"
            />
            <svg className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Sort order toggle */}
          <button
            onClick={() => setSortOrder(prev => (prev === "desc" ? "asc" : "desc"))}
            title={sortOrder === "desc" ? "Newest First" : "Oldest First"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors shrink-0"
          >
            <svg className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
          </button>

          {/* Page size dropdown */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-zinc-900 border border-zinc-800 text-xs rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none focus:border-primary transition-colors cursor-pointer shrink-0"
          >
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      {/* Chapter List */}
      {visibleChapters.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-xl border border-border flex flex-col items-center justify-center gap-3">
          <div className="text-3xl mb-1">🔍</div>
          <p className="text-zinc-400 text-sm">
            No chapters found matching &quot;<span className="text-zinc-200 font-semibold">{searchQuery}</span>&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
            }}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors border border-zinc-700/60 shadow-sm"
          >
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
          {visibleChapters.map(ch => {
            const isExternal = ch.isExternal && ch.externalUrl;
            const href = isExternal ? ch.externalUrl : `/read/${ch.id}`;
            return (
              <Link
                key={ch.id}
                href={href}
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
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {ch.group || "Official"}
                  </span>
                  <span className="w-20 text-right text-xs">
                    {ch.publishedAt
                      ? new Date(ch.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Comix.to Styled Pagination Bar */}
      <Pagination
        currentPage={activePage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
