import { Geist } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata = {
  title: "Comichwa | Read Manga & Manhwa Free Online",
  description: "Read thousands of manga, manhwa and manhua online for free. Updated daily.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('comichwa_translate') === 'true') {
                  document.documentElement.classList.add('translate-titles');
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Header />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-border py-6 text-center text-xs text-zinc-600 mt-auto">
          © 2025 Comichwa. Images and manga content provided by MangaDex.
        </footer>
      </body>
    </html>
  );
}
