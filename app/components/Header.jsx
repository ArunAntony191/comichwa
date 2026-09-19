"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import SettingsModal from "@/app/components/SettingsModal";

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [translated, setTranslated] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Sync initial preferences on mount
    const prefTranslate = localStorage.getItem("comichwa_translate") === "true";
    const prefTheme = localStorage.getItem("comichwa_theme") || "comix";

    setTranslated(prefTranslate);
    if (prefTranslate) {
      document.documentElement.classList.add("translate-titles");
    }
    document.documentElement.setAttribute("data-theme", prefTheme);
  }, []);

  const toggleTranslation = () => {
    const nextVal = !translated;
    setTranslated(nextVal);
    localStorage.setItem("comichwa_translate", String(nextVal));
    if (nextVal) {
      document.documentElement.classList.add("translate-titles");
    } else {
      document.documentElement.classList.remove("translate-titles");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border h-16 flex items-center">
        <div className="container mx-auto px-4 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="text-xl font-extrabold text-primary shrink-0 tracking-tight flex items-center gap-1.5">
            <span>Comichwa</span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-zinc-400 ml-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/browse" className="hover:text-white transition-colors">Browse</Link>
          </nav>

          {/* Search & Translation & Settings controls */}
          <div className="flex-1 flex items-center gap-2 sm:gap-3 justify-end">
            <form onSubmit={handleSearch} className="w-full max-w-md">
              <div className="relative">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search manga, manhwa..."
                  className="w-full bg-card border border-border rounded-full pl-4 pr-10 py-1.5 sm:py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary transition-colors"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-primary transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </form>

            {/* Translation Toggle */}
            <button
              onClick={toggleTranslation}
              title={translated ? "Show original titles" : "Translate titles to English"}
              className={`rounded-full border transition-all flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold shrink-0 ${
                translated
                  ? "bg-primary border-primary text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  : "bg-card border-border hover:border-zinc-500 text-zinc-400 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="hidden sm:inline">{translated ? "English" : "Translate"}</span>
            </button>

            {/* Settings Button (⚙️) */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Site Settings & Themes"
              className="p-2 rounded-full border border-border bg-card hover:border-primary text-zinc-400 hover:text-primary transition-all shrink-0 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
