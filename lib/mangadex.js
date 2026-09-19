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

export async function searchMangaApi(
  query = "",
  limit = 36,
  offset = 0,
  genres = [],
  sort = "relevance",
  languages = [],
  demographics = [],
  statuses = [],
  yearFrom = "",
  yearTo = "",
  tagMode = "AND",
  contentRatings = ["safe", "suggestive"]
) {
  let url = `${BASE}/manga?limit=${limit}&offset=${offset}&includes[]=cover_art&availableTranslatedLanguage[]=en`;

  const validRatings = Array.isArray(contentRatings) && contentRatings.length > 0 
    ? contentRatings.filter(r => ["safe", "suggestive", "erotica"].includes(r))
    : ["safe", "suggestive"];

  validRatings.forEach(r => {
    url += `&contentRating[]=${r}`;
  });

  if (sort && ["followedCount", "rating", "updatedAt", "createdAt", "relevance"].includes(sort)) {
    url += `&order[${sort}]=desc`;
  } else {
    url += `&order[relevance]=desc`;
  }

  let normalizedQuery = query.trim();
  if (normalizedQuery.toLowerCase() === "spiderman") normalizedQuery = "spider-man";
  if (normalizedQuery.toLowerCase() === "xmen") normalizedQuery = "x-men";
  if (normalizedQuery.toLowerCase() === "ironman") normalizedQuery = "iron man";

  if (normalizedQuery) url += `&title=${encodeURIComponent(normalizedQuery)}`;
  
  if (genres.length > 0) {
    genres.forEach(g => url += `&includedTags[]=${g}`);
    url += `&includedTagsMode=${tagMode.toUpperCase() === "OR" ? "OR" : "AND"}`;
  }
  
  if (languages.length > 0) {
    if (!normalizedQuery) {
      languages.forEach(l => url += `&originalLanguage[]=${l}`);
    }
  }
  if (demographics.length > 0) demographics.forEach(d => url += `&publicationDemographic[]=${d}`);
  if (statuses.length > 0) statuses.forEach(s => url += `&status[]=${s}`);
  if (yearFrom && !isNaN(yearFrom)) url += `&year=${yearFrom}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();
    let results = formatMangaList(data.data || []);
    let total = data.total || 0;

    // Fallback search if 0 results found and query has no hyphen
    if (results.length === 0 && query && !query.includes("-")) {
      const altQuery = query.replace(/([a-z])(man|men)/i, "$1-$2");
      if (altQuery !== query) {
        const altUrl = url.replace(`title=${encodeURIComponent(normalizedQuery)}`, `title=${encodeURIComponent(altQuery)}`);
        const altRes = await fetch(altUrl, { next: { revalidate: 60 } });
        const altData = await altRes.json();
        if (altData.data?.length > 0) {
          results = formatMangaList(altData.data);
          total = altData.total || 0;
        }
      }
    }

    return { results, total };
  } catch {
    return { results: [], total: 0 };
  }
}

export async function getRandomManga() {
  try {
    const url = `${BASE}/manga/random?includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    if (data.data?.id) {
      return data.data.id;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getMangaById(id) {
  const url = `${BASE}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();
  if (!data.data) return null;
  return formatManga(data.data);
}

export async function getMangaChapters(mangaId, limit = 500, maxTotal = 2500) {
  let offset = 0;
  let rawList = [];
  let total = 0;

  try {
    do {
      const url = `${BASE}/manga/${mangaId}/feed?translatedLanguage[]=en&limit=${limit}&offset=${offset}&order[chapter]=desc&includes[]=scanlation_group&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`;
      const res = await fetch(url, { next: { revalidate: 300 } });
      if (!res.ok) break;
      const data = await res.json();
      const batch = data.data || [];
      total = data.total || 0;
      rawList = rawList.concat(batch);
      offset += limit;
    } while (offset < total && offset < maxTotal);
  } catch {
    // Return what we have so far if fetch fails
  }

  const formatted = rawList.map(ch => ({
    id: ch.id,
    chapter: ch.attributes.chapter,
    title: ch.attributes.title,
    pages: ch.attributes.pages,
    // If pages === 0, it's externally hosted (Webtoon, Kakao, etc.)
    isExternal: (ch.attributes.pages === 0),
    externalUrl: ch.attributes.externalUrl || null,
    group: ch.relationships.find(r => r.type === "scanlation_group")?.attributes?.name || "Official",
    publishedAt: ch.attributes.publishAt,
  }));

  // Deduplicate by chapter number (prefer readable/non-external ones with higher page count)
  const map = new Map();
  for (const ch of formatted) {
    const key = ch.chapter ? String(parseFloat(ch.chapter)) : ch.id;
    if (!map.has(key)) {
      map.set(key, ch);
    } else {
      const existing = map.get(key);
      if (existing.isExternal && !ch.isExternal) {
        map.set(key, ch);
      } else if (!existing.isExternal && !ch.isExternal && (ch.pages || 0) > (existing.pages || 0)) {
        map.set(key, ch);
      }
    }
  }

  const chapters = Array.from(map.values()).sort((a, b) => parseFloat(b.chapter || 0) - parseFloat(a.chapter || 0));

  return {
    chapters,
    total: chapters.length
  };
}

/**
 * Searches MangaDex for alternate/related manga entries with English chapters
 * when the main entry has no or very few English chapters available (e.g. DMCA removed series).
 * Strategy:
 *  1. Query /manga/{id}/relation to get official variants (colored, adapted, preserialization...)
 *  2. Search by title variations (Colored, Official Colored, Digital Edition, Fan-Colored, Webcomic)
 *  3. Pick the variant with the highest English chapter count
 */
export async function getAlternateMangaChapters(mangaTitle, englishTitle, excludeId, currentCount = 0) {
  const query = englishTitle || mangaTitle;
  if (!query) return { chapters: [], alternateTitle: null, alternateId: null };

  let candidateIds = new Map(); // id -> title

  try {
    // === Strategy 1: Official MangaDex relations (colored, adapted, spin-off, etc.) ===
    const relRes = await fetch(`${BASE}/manga/${excludeId}/relation`, { next: { revalidate: 3600 } });
    if (relRes.ok) {
      const relData = await relRes.json();
      const USEFUL_RELATIONS = new Set(["colored", "preserialization", "adapted", "alternative_setting", "alternative_version", "spin_off"]);
      const relatedIds = (relData.data || [])
        .filter(r => USEFUL_RELATIONS.has(r.attributes?.relation))
        .map(r => r.id);

      // Fetch titles for related entries
      if (relatedIds.length > 0) {
        const idsParam = relatedIds.map(i => `ids[]=${i}`).join("&");
        const mRes = await fetch(`${BASE}/manga?${idsParam}&limit=50`, { next: { revalidate: 3600 } });
        if (mRes.ok) {
          const mData = await mRes.json();
          for (const m of (mData.data || [])) {
            const t = m.attributes.title?.en || Object.values(m.attributes.title || {})[0] || "Alternate Version";
            candidateIds.set(m.id, t);
          }
        }
      }
    }
  } catch {
    // ignore
  }

  try {
    // === Strategy 2: Title search with common variant suffixes ===
    const searchQueries = [
      query,
      `${query} Colored`,
      `${query} (Official Colored)`,
      `${query} Digital Colored Edition`,
      `${query} Fan-Colored`,
      `${query} Webcomic`,
    ];

    for (const q of searchQueries) {
      const searchUrl = `${BASE}/manga?title=${encodeURIComponent(q)}&limit=10&includes[]=cover_art`;
      const res = await fetch(searchUrl, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data = await res.json();
        for (const m of (data.data || [])) {
          if (m.id !== excludeId && !candidateIds.has(m.id)) {
            const t = m.attributes.title?.en || Object.values(m.attributes.title || {})[0] || "Alternate Version";
            candidateIds.set(m.id, t);
          }
        }
      }
    }
  } catch {
    // ignore
  }

  // === Pick the best candidate by EN chapter count ===
  let bestAltChapters = [];
  let bestAltTitle = null;
  let bestAltId = null;

  for (const [id, altTitle] of candidateIds.entries()) {
    // Skip obvious doujinshis if we already have a good candidate
    if (altTitle.toLowerCase().includes("doujinshi") && bestAltChapters.length > 0) {
      continue;
    }

    try {
      const { chapters: altChapters } = await getMangaChapters(id);
      if (altChapters.length > bestAltChapters.length) {
        bestAltChapters = altChapters;
        bestAltTitle = altTitle;
        bestAltId = id;
      }
    } catch {
      // skip this candidate
    }
  }

  if (bestAltChapters.length > currentCount) {
    return {
      chapters: bestAltChapters,
      alternateTitle: bestAltTitle,
      alternateId: bestAltId,
    };
  }

  return { chapters: [], alternateTitle: null, alternateId: null };
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
  const url = `${BASE}/manga/${mangaId}/feed?translatedLanguage[]=en&limit=500&order[chapter]=asc&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic`;
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
function formatLinks(links) {
  if (!links) return [];
  const result = [];
  if (links.engtl) result.push({ name: "Official English", url: links.engtl, type: "official" });
  if (links.raw) result.push({ name: "Official Raw", url: links.raw, type: "raw" });
  if (links.bw) result.push({ name: "BookWalker", url: `https://bookwalker.jp/${links.bw}`, type: "store" });
  if (links.amz) result.push({ name: "Amazon", url: links.amz, type: "store" });
  if (links.ebj) result.push({ name: "eBookJapan", url: links.ebj, type: "store" });
  if (links.mal) result.push({ name: "MyAnimeList", url: `https://myanimelist.net/manga/${links.mal}`, type: "info" });
  if (links.al) result.push({ name: "AniList", url: `https://anilist.co/manga/${links.al}`, type: "info" });
  if (links.ap) result.push({ name: "Anime-Planet", url: `https://www.anime-planet.com/manga/${links.ap}`, type: "info" });
  if (links.mu) result.push({ name: "MangaUpdates", url: `https://www.mangaupdates.com/series.html?id=${links.mu}`, type: "info" });
  return result;
}

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
    type: m.attributes.originalLanguage === "ko" ? "Manhwa" : m.attributes.originalLanguage === "zh" ? "Manhua" : m.attributes.originalLanguage === "en" ? "Comic" : "Manga",
    officialLinks: formatLinks(m.attributes.links),
  };
}

function formatMangaList(list) {
  return list.map(formatManga);
}
