import { Header } from "@/components/header";
import { PathList } from "@/components/path-list";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl font-bold sm:text-2xl">Your Learning Paths</h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            Continue where you left off or start a new path
          </p>
        </div>
        <PathList />
      </main>
    </div>
  );
}
