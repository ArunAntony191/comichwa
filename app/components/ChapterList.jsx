"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Pagination from "@/app/components/Pagination";

export default function ChapterList({ chapters = [], source = "mangadex", alternateTitle = null, officialLinks = [] }) {
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

  // Minimum chapter number check (detect missing early chapters due to DMCA)
  const minChapter = useMemo(() => {
    if (chapters.length === 0) return null;
    const nums = chapters
      .map(c => parseFloat(c.chapter))
      .filter(n => !isNaN(n) && n > 0);
    if (nums.length === 0) return null;
    return Math.min(...nums);
  }, [chapters]);

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
      {/* Missing Early Chapters Warning Banner */}
      {minChapter && minChapter > 5 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <span className="text-lg shrink-0">⚠️</span>
            <span>
              <strong>Notice:</strong> Early chapters (Ch. 1 to {Math.floor(minChapter) - 1}) are unavailable on MangaDex for this release due to publisher licensing restrictions. Available chapters start at <strong>Ch. {minChapter}</strong>.
            </span>
          </div>
          {officialLinks && officialLinks.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              {officialLinks.slice(0, 2).map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 font-semibold transition-colors flex items-center gap-1"
                >
                  {link.name} ↗
                </a>
              ))}
            </div>
          )}
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
