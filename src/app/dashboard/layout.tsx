import Navbar from "./_components/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <div className="bg-accent/5 min-h-screen">
        <Navbar />
        <div className="container">
            {children}
        </div>
    </div>
}