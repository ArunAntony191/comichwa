"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { searchMangaApi, getMangaChapters } from "@/lib/mangadex";

export default function AdminPage() {
  const [mangas, setMangas] = useState([]);
  const [chapters, setChapters] = useState([]);

  // Form states
  const [mangaForm, setMangaForm] = useState({ title: "", description: "", cover_url: "", author: "", status: "Ongoing" });
  const [chapterForm, setChapterForm] = useState({ manga_id: "", chapter_number: "", title: "", provider: "Official" });
  const [pagesForm, setPagesForm] = useState({ chapter_id: "", image_urls: "" });

  // Auto-Importer states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const fetchMangas = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("mangas").select("*").order("created_at", { ascending: false });
    if (data) setMangas(data);
  }, []);

  const fetchChapters = useCallback(async (mangaId) => {
    if (!supabase || !mangaId) return;
    const { data } = await supabase.from("chapters").select("*").eq("manga_id", mangaId).order("chapter_number", { ascending: true });
    if (data) setChapters(data);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMangas();
  }, [fetchMangas]);

  useEffect(() => {
    if (chapterForm.manga_id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchChapters(chapterForm.manga_id);
    }
  }, [chapterForm.manga_id, fetchChapters]);

  // --- Manual Actions ---
  const handleAddManga = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("mangas").insert([mangaForm]);
    if (error) alert(error.message);
    else { alert("Manga added!"); setMangaForm({ title: "", description: "", cover_url: "", author: "", status: "Ongoing" }); fetchMangas(); }
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("chapters").insert([chapterForm]);
    if (error) alert(error.message);
    else { alert("Chapter added!"); setChapterForm({ ...chapterForm, chapter_number: "", title: "", provider: "Official" }); fetchChapters(chapterForm.manga_id); }
  };

  const handleAddPages = async (e) => {
    e.preventDefault();
    const urls = pagesForm.image_urls.split(/[\n,]+/).map(u => u.trim()).filter(u => u);
    const pagesToInsert = urls.map((url, i) => ({
      chapter_id: pagesForm.chapter_id,
      page_number: i + 1,
      image_url: url
    }));
    
    const { error } = await supabase.from("pages").insert(pagesToInsert);
    if (error) alert(error.message);
    else { alert("Pages added!"); setPagesForm({ ...pagesForm, image_urls: "" }); }
  };

  // --- Auto-Importer Actions ---
  const handleSearchMangaDex = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    const { results } = await searchMangaApi(searchQuery, 5);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleImportMangaDex = async (mangaDexData) => {
    if (!confirm(`Import ${mangaDexData.title} and its latest chapters?`)) return;
    setIsImporting(true);

    try {
      // 1. Insert Manga
      const { data: newManga, error: mangaError } = await supabase.from("mangas").insert([{
        title: mangaDexData.title,
        description: mangaDexData.description,
        cover_url: mangaDexData.cover_url,
        author: "Unknown (MangaDex)",
        status: mangaDexData.status
      }]).select().single();

      if (mangaError) throw mangaError;

      // 2. Fetch Chapters from MangaDex
      const { chapters: mdChapters } = await getMangaChapters(mangaDexData.mangadex_id, 50);
      
      if (mdChapters.length > 0) {
        // 3. Insert Chapters
        const chaptersToInsert = mdChapters.map(ch => ({
          manga_id: newManga.id,
          chapter_number: parseFloat(ch.chapter_number) || 0,
          title: ch.title,
          provider: ch.provider,
          external_id: ch.external_id // Used to fetch images dynamically
        }));

        const { error: chapterError } = await supabase.from("chapters").insert(chaptersToInsert);
        if (chapterError) throw chapterError;
      }

      alert(`Successfully imported ${mangaDexData.title} with ${mdChapters.length} chapters!`);
      fetchMangas();
      setSearchResults([]);
      setSearchQuery("");
    } catch (err) {
      alert("Error importing: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Auto-Importer Section */}
      <section className="bg-primary/10 p-6 rounded-lg border border-primary/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
        <h2 className="text-2xl font-bold mb-4 text-primary flex items-center gap-2">
          ⚡ Auto-Importer (MangaDex)
        </h2>
        <p className="text-sm text-zinc-400 mb-4">
          Search for a manga below. Clicking import will automatically add the series and fetch its latest 50 English chapters. Image links are handled dynamically so they never expire!
        </p>
        
        <form onSubmit={handleSearchMangaDex} className="flex gap-2 mb-6">
          <input 
            className="flex-1 p-3 rounded bg-card text-white border border-border focus:border-primary outline-none" 
            placeholder="Search manga by title (e.g. Solo Leveling)" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            required 
          />
          <button type="submit" disabled={isSearching} className="bg-primary hover:bg-primary-hover text-white px-6 rounded font-bold transition-colors disabled:opacity-50">
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-zinc-300">Search Results:</h3>
            <div className="grid gap-4">
              {searchResults.map((res) => (
                <div key={res.mangadex_id} className="flex gap-4 p-4 bg-card rounded-lg border border-border">
                  <img src={res.cover_url} alt={res.title} className="w-16 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{res.title}</h4>
                    <p className="text-sm text-zinc-400 line-clamp-2 mt-1">{res.description}</p>
                  </div>
                  <button 
                    onClick={() => handleImportMangaDex(res)}
                    disabled={isImporting}
                    className="self-center bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
                  >
                    Import
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <hr className="border-border" />

      {/* Manual Entry Sections */}
      <div className="space-y-12 opacity-80">
        <h2 className="text-2xl font-bold text-zinc-500">Manual Entry (Advanced)</h2>
        
        <section className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4 text-zinc-300">1. Add New Manga</h2>
          <form onSubmit={handleAddManga} className="space-y-4 text-black">
            <input className="w-full p-2 rounded" placeholder="Title" value={mangaForm.title} onChange={e => setMangaForm({...mangaForm, title: e.target.value})} required />
            <input className="w-full p-2 rounded" placeholder="Author" value={mangaForm.author} onChange={e => setMangaForm({...mangaForm, author: e.target.value})} />
            <input className="w-full p-2 rounded" placeholder="Cover Image URL (External link)" value={mangaForm.cover_url} onChange={e => setMangaForm({...mangaForm, cover_url: e.target.value})} required />
            <textarea className="w-full p-2 rounded" placeholder="Description" value={mangaForm.description} onChange={e => setMangaForm({...mangaForm, description: e.target.value})} />
            <select className="w-full p-2 rounded" value={mangaForm.status} onChange={e => setMangaForm({...mangaForm, status: e.target.value})}>
              <option>Ongoing</option>
              <option>Completed</option>
            </select>
            <button type="submit" className="w-full bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded font-bold">Add Manga</button>
          </form>
        </section>

        <section className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4 text-zinc-300">2. Add Chapter</h2>
          <form onSubmit={handleAddChapter} className="space-y-4 text-black">
            <select className="w-full p-2 rounded" value={chapterForm.manga_id} onChange={e => setChapterForm({...chapterForm, manga_id: e.target.value})} required>
              <option value="">Select Manga</option>
              {mangas.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
            <input className="w-full p-2 rounded" type="number" step="0.1" placeholder="Chapter Number" value={chapterForm.chapter_number} onChange={e => setChapterForm({...chapterForm, chapter_number: e.target.value})} required />
            <input className="w-full p-2 rounded" placeholder="Provider / Scanlation Group" value={chapterForm.provider} onChange={e => setChapterForm({...chapterForm, provider: e.target.value})} required />
            <input className="w-full p-2 rounded" placeholder="Chapter Title (Optional)" value={chapterForm.title} onChange={e => setChapterForm({...chapterForm, title: e.target.value})} />
            <button type="submit" className="w-full bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded font-bold">Add Chapter</button>
          </form>
        </section>

        <section className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-xl font-semibold mb-4 text-zinc-300">3. Add Pages to Chapter</h2>
          <form onSubmit={handleAddPages} className="space-y-4 text-black">
            <select className="w-full p-2 rounded" value={pagesForm.chapter_id} onChange={e => setPagesForm({...pagesForm, chapter_id: e.target.value})} required>
              <option value="">Select Chapter</option>
              {chapters.map(c => <option key={c.id} value={c.id}>Ch. {c.chapter_number} {c.title ? `- ${c.title}` : ""}</option>)}
            </select>
            <textarea className="w-full p-2 rounded h-40" placeholder="Paste image URLs here (separated by commas or new lines)" value={pagesForm.image_urls} onChange={e => setPagesForm({...pagesForm, image_urls: e.target.value})} required />
            <button type="submit" className="w-full bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded font-bold">Add Pages</button>
          </form>
        </section>
      </div>

    </div>
  );
}
