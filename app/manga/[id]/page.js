import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getMangaChapters } from "@/lib/mangadex";

export default async function MangaDetailsPage({ params }) {
  // Await the params in Next.js 15+ App Router
  const resolvedParams = await params;
  
  // Fetch manga details
  const { data: manga } = await supabase
    .from("mangas")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!manga) {
    return <div className="p-8 text-center">Manga not found.</div>;
  }

  // Fetch chapters — prefer MangaDex API if the manga has a mangadex_id (gives full chapter list)
  let chapters = [];
  if (manga.mangadex_id) {
    const { chapters: mdChapters } = await getMangaChapters(manga.mangadex_id, 500, 0);
    chapters = mdChapters.map(ch => ({
      id: ch.id,
      chapter_number: ch.chapter,
      title: ch.title,
      provider: ch.group,
      created_at: ch.publishedAt,
      isExternal: ch.isExternal,
      externalUrl: ch.externalUrl,
    }));
  } else {
    // Fall back to manually-entered Supabase chapters
    const { data } = await supabase
      .from("chapters")
      .select("*")
      .eq("manga_id", resolvedParams.id)
      .order("chapter_number", { ascending: false });
    chapters = data || [];
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Comichwa
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Manga Header Info */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Cover */}
          <div className="w-full md:w-1/3 max-w-sm mx-auto md:mx-0 shrink-0">
            <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden border border-border shadow-2xl">
              <img
                src={manga.cover_url}
                alt={manga.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 gap-4">
            <h1 className="text-4xl font-bold">{manga.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Author:</span>
                <span className="font-semibold">{manga.author || "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Status:</span>
                <span className="font-semibold text-primary">{manga.status}</span>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                {manga.description || "No synopsis available."}
              </p>
            </div>
          </div>
        </div>

        {/* Chapter List */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            Chapters 
            <span className="text-sm font-normal text-gray-500 bg-card px-2 py-1 rounded-md">
              {chapters?.length || 0}
            </span>
          </h2>
          
          <div className="flex flex-col border border-border rounded-lg overflow-hidden">
            {chapters && chapters.length > 0 ? chapters.map((chapter) => {
              const isExternal = chapter.isExternal && chapter.externalUrl;
              return (
                <Link 
                  href={isExternal ? chapter.externalUrl : `/read/${chapter.id}`}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  key={chapter.id}
                  className="flex items-center justify-between p-4 bg-card border-b border-border last:border-0 hover:bg-zinc-800 transition-colors group"
                >
                  {/* Left side: Chapter number */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-300 group-hover:text-primary transition-colors">
                      Ch.{chapter.chapter_number}
                    </span>
                    {chapter.title && (
                      <span className="text-zinc-500 text-sm hidden sm:block">
                        - {chapter.title}
                      </span>
                    )}
                  </div>

                  {/* Right side: Provider & Date */}
                  <div className="flex items-center gap-6 text-sm text-zinc-400">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      <span>{chapter.provider || "Official"}</span>
                    </div>
                    <span className="hidden sm:inline-block w-24 text-right">
                      {new Date(chapter.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </Link>
              );
            }) : (
              <div className="p-4 text-zinc-500 text-center bg-card">No chapters yet.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
