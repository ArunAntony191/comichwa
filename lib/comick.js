// ComicK public API helper — used as a fallback when MangaDex has no English chapters
const BASE = "https://api.comick.fun";

/**
 * Search ComicK for a manga by title.
 * Returns the first match's HID (ComicK's internal manga ID) and slug, or null.
 */
export async function searchComicK(title) {
  try {
    const url = `${BASE}/v1.0/search?q=${encodeURIComponent(title)}&limit=5&type=comic`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    // Pick the closest title match
    const match = data.find(m =>
      m.title?.toLowerCase().includes(title.toLowerCase()) ||
      title.toLowerCase().includes(m.title?.toLowerCase())
    ) || data[0];
    return { hid: match.hid, slug: match.slug, title: match.title };
  } catch {
    return null;
  }
}

/**
 * Fetch English chapters for a ComicK manga HID.
 * Returns an array of chapter objects shaped for the title page.
 */
export async function getComicKChapters(hid, limit = 300) {
  try {
    const url = `${BASE}/comic/${hid}/chapters?lang=en&limit=${limit}&page=1`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    const chapters = data.chapters || [];
    return chapters.map(ch => ({
      id: ch.hid,
      chapter: ch.chap || "?",
      title: ch.title || null,
      group: ch.group_name?.[0] || "Unknown Group",
      publishedAt: ch.created_at || ch.updated_at || null,
      source: "comick",
    })).sort((a, b) => parseFloat(b.chapter) - parseFloat(a.chapter));
  } catch {
    return [];
  }
}

/**
 * Fetch page image URLs for a ComicK chapter HID.
 * Returns { pages: string[], error: string|null }
 */
export async function getComicKPages(chapterHid) {
  try {
    const url = `${BASE}/chapter/${chapterHid}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { pages: [], error: `ComicK API error: ${res.status}` };
    const data = await res.json();
    const images = data.chapter?.images || data.chapter?.md_images || [];
    if (images.length === 0) return { pages: [], error: "No pages found for this chapter." };
    // ComicK images are served from their CDN
    const pages = images
      .sort((a, b) => (a.b2key || "").localeCompare(b.b2key || "", undefined, { numeric: true }))
      .map(img => `https://meo.comick.pictures/${img.b2key}`);
    return { pages, error: null };
  } catch (e) {
    return { pages: [], error: "Failed to load chapter images from ComicK." };
  }
}

/**
 * Fetch info about a single ComicK chapter (for the reader header).
 */
export async function getComicKChapterInfo(chapterHid) {
  try {
    const url = `${BASE}/chapter/${chapterHid}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    const ch = data.chapter;
    if (!ch) return null;
    return {
      id: ch.hid,
      chapter: ch.chap || "?",
      title: ch.title || null,
      group: ch.group_name?.[0] || "Unknown Group",
      mangaSlug: ch.md_comics?.slug || null,
      mangaHid: ch.md_comics?.hid || null,
      mangaTitle: ch.md_comics?.title || "Unknown",
      publishedAt: ch.created_at || null,
    };
  } catch {
    return null;
  }
}

/**
 * Get previous and next ComicK chapters relative to the current chapter number.
 */
export async function getAdjacentComicKChapters(mangaHid, currentChap) {
  try {
    const url = `${BASE}/comic/${mangaHid}/chapters?lang=en&limit=500&page=1`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return { prev: null, next: null };
    const data = await res.json();
    const all = (data.chapters || [])
      .map(c => ({ id: c.hid, chapter: parseFloat(c.chap || "0") }))
      .sort((a, b) => a.chapter - b.chapter);
    const current = parseFloat(currentChap || "0");
    const prev = all.filter(c => c.chapter < current).pop() || null;
    const next = all.find(c => c.chapter > current) || null;
    return { prev, next };
  } catch {
    return { prev: null, next: null };
  }
}
