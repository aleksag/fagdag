import { getConferenceData } from "@/lib/store";
import ScheduleView from "./components/ScheduleView";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getConferenceData();

  return (
    <main className="min-h-screen bg-background text-text-main flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Systek Logo Approximation */}
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-primary rounded-sm"></div>
              <div className="w-3 h-3 bg-primary rounded-sm opacity-80"></div>
              <div className="w-3 h-3 bg-primary rounded-sm opacity-60"></div>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">
              systek<span className="text-primary">.</span>no
            </span>
          </div>

          <div className="text-sm font-medium text-text-muted hidden sm:block">
            Digital styrke – tett på
          </div>
        </div>
      </header>

      <div className="flex-grow">
        <ScheduleView data={data} />
      </div>

      <footer className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-text-muted text-sm flex flex-col items-center gap-4">
          <div className="flex gap-1 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="w-4 h-4 bg-primary rounded-sm"></div>
            <div className="w-4 h-4 bg-primary rounded-sm opacity-80"></div>
            <div className="w-4 h-4 bg-primary rounded-sm opacity-60"></div>
          </div>
          <p>&copy; {new Date().getFullYear()} Systek AS. Laget for Fagdag.</p>
        </div>
      </footer>
    </main>
  );
}
