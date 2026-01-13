import { getConferenceData } from "@/lib/store";
import HomeClient from "./components/HomeClient";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getConferenceData();

  return (
    <main className="min-h-screen bg-background text-text-main flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/systek-logo.svg" alt="Systek Logo" className="h-8 w-auto" />
          </div>

          <div className="text-sm font-medium text-text-muted hidden sm:block">
            Digital styrke – tett på
          </div>
        </div>
      </header>

      <HomeClient data={data} />

      <footer className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-text-muted text-sm flex flex-col items-center gap-4">
          <img src="/systek-logo.svg" alt="Systek Logo" className="h-6 w-auto opacity-50 grayscale hover:grayscale-0 transition-all duration-300" />
          <p>&copy; {new Date().getFullYear()} Systek AS. Laget for Fagdag.</p>
        </div>
      </footer>
    </main>
  );
}
