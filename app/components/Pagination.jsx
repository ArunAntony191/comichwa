"use client";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 20,
  onPageChange,
  className = ""
}) {
  if (totalItems === 0) return null;

  const activePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (activePage - 1) * pageSize + 1;
  const endIndex = Math.min(activePage * pageSize, totalItems);

  // Generate 5 visible page numbers around active page
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

  const handleSelect = (p) => {
    if (p < 1 || p > totalPages || p === activePage) return;
    if (onPageChange) onPageChange(p);
  };

  return (
    <div className={`flex flex-col items-center gap-2.5 py-4 ${className}`}>
      {/* Comix.to Summary Text */}
      <div className="text-sm text-zinc-400 font-medium">
        Showing <span className="text-zinc-200">{startIndex}</span> to{" "}
        <span className="text-zinc-200">{endIndex}</span> of{" "}
        <span className="text-zinc-200">{totalItems}</span> items
      </div>

      {/* Comix.to Page Buttons Row */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* First Page Button « */}
          <button
            onClick={() => handleSelect(1)}
            disabled={activePage === 1}
            title="First Page"
            className="min-w-[38px] h-[38px] px-2 flex items-center justify-center rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
          >
            «
          </button>

          {/* Previous Page Button ‹ */}
          <button
            onClick={() => handleSelect(activePage - 1)}
            disabled={activePage === 1}
            title="Previous Page"
            className="min-w-[38px] h-[38px] px-2 flex items-center justify-center rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
          >
            ‹
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((p) => {
            const isActive = p === activePage;
            return (
              <button
                key={p}
                onClick={() => handleSelect(p)}
                className={`min-w-[38px] h-[38px] px-3 flex items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-zinc-700/80 text-white border border-zinc-600/50 shadow"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/80"
                }`}
              >
                {p}
              </button>
            );
          })}

          {/* Next Page Button › */}
          <button
            onClick={() => handleSelect(activePage + 1)}
            disabled={activePage === totalPages}
            title="Next Page"
            className="min-w-[38px] h-[38px] px-2 flex items-center justify-center rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
          >
            ›
          </button>

          {/* Last Page Button » */}
          <button
            onClick={() => handleSelect(totalPages)}
            disabled={activePage === totalPages}
            title="Last Page"
            className="min-w-[38px] h-[38px] px-2 flex items-center justify-center rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/80 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-400 transition-colors"
          >
            »
          </button>
        </div>
      )}
    </div>
  );
}
