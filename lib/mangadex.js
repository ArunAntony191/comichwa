// Centralized MangaDex API helper for server-side calls
const BASE = "https://api.mangadex.org";

export function getCoverUrl(mangaId, coverFileName, size = ".512") {
  if (!coverFileName) return "https://placehold.co/300x430/1e293b/94a3b8?text=No+Cover";
  return `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}${size}.jpg`;
}

export async function getTrending(limit = 18) {
  const url = `${BASE}/manga?limit=${limit}&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&order[followedCount]=desc&availableTranslatedLanguage[]=en`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  return formatMangaList(data.data || []);
}

export async function getLatestUpdates(limit = 18) {
  // Fetch latest chapters then map to mangas
  const url = `${BASE}/manga?limit=${limit}&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&order[updatedAt]=desc&availableTranslatedLanguage[]=en`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  const data = await res.json();
  return formatMangaList(data.data || []);
}

export async function searchMangaApi(query, limit = 20, offset = 0, genres = [], sort = "relevance", languages = []) {
  let url = `${BASE}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&availableTranslatedLanguage[]=en`;
  
  if (sort && ["followedCount", "rating", "updatedAt", "createdAt", "relevance"].includes(sort)) {
    url += `&order[${sort}]=desc`;
  } else {
    url += `&order[relevance]=desc`;
  }

  if (query) url += `&title=${encodeURIComponent(query)}`;
  if (genres.length > 0) genres.forEach(g => url += `&includedTags[]=${g}`);
  if (languages.length > 0) languages.forEach(l => url += `&originalLanguage[]=${l}`);
  
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  return { results: formatMangaList(data.data || []), total: data.total || 0 };
}

export async function getMangaById(id) {
  const url = `${BASE}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  if (!data.data) return null;
  return formatManga(data.data);
}

export async function getMangaChapters(mangaId, limit = 96, offset = 0) {
  const url = `${BASE}/manga/${mangaId}/feed?translatedLanguage[]=en&limit=${limit}&offset=${offset}&order[chapter]=desc&includes[]=scanlation_group&contentRating[]=safe&contentRating[]=suggestive`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  const data = await res.json();
  return {
    chapters: (data.data || []).map(ch => ({
      id: ch.id,
      chapter: ch.attributes.chapter,
      title: ch.attributes.title,
      pages: ch.attributes.pages,
      // If pages === 0, it's externally hosted (Webtoon, Kakao, etc.) — can't be read here
      isExternal: (ch.attributes.pages === 0),
      externalUrl: ch.attributes.externalUrl || null,
      group: ch.relationships.find(r => r.type === "scanlation_group")?.attributes?.name || "Unknown Group",
      publishedAt: ch.attributes.publishAt,
    })),
    total: data.total || 0
  };
}

export async function getChapterPages(chapterId) {
  try {
    const url = `${BASE}/at-home/server/${chapterId}`;
    // Do NOT cache at-home URLs — they expire and rotate frequently
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { pages: [], error: `MangaDex API error: ${res.status}` };
    const data = await res.json();
    if (!data.baseUrl) return { pages: [], error: "Chapter has no image server (may be hosted externally on Webtoon/Kakao)." };

    // Prefer high-quality `data`, fall back to `dataSaver`
    const files = data.chapter.data?.length > 0 ? data.chapter.data : (data.chapter.dataSaver || []);
    const quality = data.chapter.data?.length > 0 ? "data" : "data-saver";

    if (files.length === 0) return { pages: [], error: "No pages found in this chapter." };

    const pages = files.map(file => `${data.baseUrl}/${quality}/${data.chapter.hash}/${file}`);
    return { pages, error: null };
  } catch (e) {
    return { pages: [], error: "Failed to connect to MangaDex image server." };
  }
}

export async function getChapterInfo(chapterId) {
  const url = `${BASE}/chapter/${chapterId}?includes[]=manga&includes[]=scanlation_group`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  if (!data.data) return null;
  const ch = data.data;
  const mangaRel = ch.relationships.find(r => r.type === "manga");
  return {
    id: ch.id,
    chapter: ch.attributes.chapter,
    title: ch.attributes.title,
    mangaId: mangaRel?.id,
    mangaTitle: mangaRel?.attributes?.title?.en || Object.values(mangaRel?.attributes?.title || {})[0] || "Unknown",
    group: ch.relationships.find(r => r.type === "scanlation_group")?.attributes?.name || "Unknown Group",
    externalUrl: ch.attributes.externalUrl || null,
  };
}

// Helper: get adjacent chapters (prev/next)
export async function getAdjacentChapters(mangaId, currentChapterNumber) {
  const url = `${BASE}/manga/${mangaId}/feed?translatedLanguage[]=en&limit=500&order[chapter]=asc&contentRating[]=safe&contentRating[]=suggestive`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  const data = await res.json();
  const all = (data.data || []).map(c => ({ id: c.id, chapter: parseFloat(c.attributes.chapter || "0") }));
  const sorted = all.sort((a, b) => a.chapter - b.chapter);
  const current = parseFloat(currentChapterNumber || "0");
  const prev = sorted.filter(c => c.chapter < current).pop() || null;
  const next = sorted.find(c => c.chapter > current) || null;
  return { prev, next };
}

// ---- Private Formatters ----
function formatManga(m) {
  const coverRel = m.relationships?.find(r => r.type === "cover_art");
  const authorRel = m.relationships?.find(r => r.type === "author");
  const title = m.attributes.title?.en || Object.values(m.attributes.title || {})[0] || "Unknown";
  
  // Find English alternative title if it exists and is different from the main title
  const altEnglish = m.attributes.altTitles?.find(t => t.en)?.en;
  const englishTitle = altEnglish && altEnglish.toLowerCase() !== title.toLowerCase() ? altEnglish : null;

  return {
    id: m.id,
    title: title,
    englishTitle: englishTitle,
    description: m.attributes.description?.en || "",
    status: m.attributes.status || "unknown",
    year: m.attributes.year,
    coverUrl: getCoverUrl(m.id, coverRel?.attributes?.fileName),
    author: authorRel?.attributes?.name || "Unknown",
    tags: (m.attributes.tags || []).map(t => t.attributes.name.en).filter(Boolean),
    type: m.attributes.originalLanguage === "ko" ? "Manhwa" : m.attributes.originalLanguage === "zh" ? "Manhua" : "Manga",
  };
}

function formatMangaList(list) {
  return list.map(formatManga);
}
