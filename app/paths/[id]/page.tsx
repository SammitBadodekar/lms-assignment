"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Circle, Lock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Module {
  _id: string;
  title: string;
  description: string;
  content_type: string;
  content: string;
  order: number;
  is_completed: boolean;
  completed_at: string | null;
}

interface PathDetail {
  _id: string;
  title: string;
  description: string;
  image: string;
  total_modules: number;
  completed_modules: number;
  progress: number;
  modules: Module[];
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; path: PathDetail };

function isModuleUnlocked(module: Module, modules: Module[]): boolean {
  if (module.is_completed) return true;
  if (module.order === 1) return true;

  const previousModule = modules.find((m) => m.order === module.order - 1);
  return previousModule?.is_completed ?? false;
}

function ProgressCircle({ progress }: { progress: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative h-16 w-16">
      <svg className="h-16 w-16 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth="4"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          className="stroke-primary transition-all duration-300"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
        {Math.round(progress)}%
      </span>
    </div>
  );
}

export default function PathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "loading" });
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pathId = params.id as string;

  const fetchPath = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const response = await fetch(`/api/paths/${pathId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch path");
      }
      const data = await response.json();
      setState({ status: "success", path: data.path });

      const firstUnlockedIncomplete = data.path.modules.find(
        (m: Module) =>
          !m.is_completed && isModuleUnlocked(m, data.path.modules),
      );
      setActiveModule(firstUnlockedIncomplete || data.path.modules[0] || null);
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }, [pathId]);

  const markComplete = useCallback(
    async (moduleId: string) => {
      if (completing) return;

      setCompleting(moduleId);
      setError(null);
      try {
        const response = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path_id: pathId, module_id: moduleId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to mark as complete");
        }

        await fetchPath();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to mark as complete";
        setError(message);
      } finally {
        setCompleting(null);
      }
    },
    [completing, pathId, fetchPath],
  );

  useEffect(() => {
    fetchPath();
  }, [fetchPath]);

  if (state.status === "loading") {
    return <PathDetailSkeleton />;
  }

  if (state.status === "error") {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <div className="mx-auto max-w-6xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12">
            <p className="text-destructive">{state.message}</p>
            <Button onClick={fetchPath} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { path } = state;
  const isActiveModuleUnlocked = activeModule
    ? isModuleUnlocked(activeModule, path.modules)
    : false;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Paths
            </Link>
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold sm:text-2xl">{path.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2 max-w-2xl">
                {path.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">
                  {path.completed_modules}/{path.total_modules}
                </p>
                <p className="text-xs text-muted-foreground">modules</p>
              </div>
              <ProgressCircle progress={path.progress} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-4">
            {activeModule && (
              <>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                  {isActiveModuleUnlocked ? (
                    activeModule.content_type === "youtube_video" ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${activeModule.content}`}
                        title={activeModule.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white">
                        Content not available
                      </div>
                    )
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-white">
                      <Lock className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Complete the previous module to unlock
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="font-semibold">{activeModule.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Module {activeModule.order} of {path.total_modules}
                    </p>
                  </div>
                  {activeModule.is_completed ? (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 shrink-0">
                      <CheckCircle className="h-4 w-4" />
                      Completed
                    </span>
                  ) : isActiveModuleUnlocked ? (
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Button
                        onClick={() => markComplete(activeModule._id)}
                        disabled={completing === activeModule._id}
                        size="sm"
                      >
                        {completing === activeModule._id
                          ? "Saving..."
                          : "Mark as Complete"}
                      </Button>
                      {error && (
                        <p className="text-xs text-destructive">{error}</p>
                      )}
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground shrink-0">
                      <Lock className="h-4 w-4" />
                      Locked
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-3">Modules</h3>
            <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
              {path.modules.map((module) => {
                const isActive = activeModule?._id === module._id;
                const isUnlocked = isModuleUnlocked(module, path.modules);

                return (
                  <button
                    key={module._id}
                    onClick={() => setActiveModule(module)}
                    disabled={!isUnlocked && !module.is_completed}
                    className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      isActive
                        ? "border-primary bg-accent"
                        : isUnlocked
                          ? "border-border hover:bg-accent"
                          : "border-border opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="shrink-0">
                      {module.is_completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : isUnlocked ? (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {module.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Module {module.order}
                      </p>
                    </div>
                    {isActive && isUnlocked && (
                      <Play className="h-4 w-4 shrink-0 text-primary fill-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PathDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
          <Skeleton className="h-8 w-28 mb-3" />
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-7 w-72" />
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <div className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div>
            <Skeleton className="h-5 w-20 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
