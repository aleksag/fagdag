import { getConferenceData } from "@/lib/store";
import AdminDashboard from "./components/AdminDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const data = await getConferenceData();
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <a href="/" className="text-primary hover:underline">View Live Site</a>
                </header>
                <AdminDashboard data={data} />
            </div>
        </div>
    );
}
