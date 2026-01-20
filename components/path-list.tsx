"use client";

import { useEffect, useState, useCallback } from "react";
import { PathCard, PathCardSkeleton } from "@/components/path-card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Path {
  _id: string;
  title: string;
  description: string;
  image: string;
  total_modules: number;
  completed_modules: number;
  progress: number;
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; paths: Path[] };

export function PathList() {
  const [state, setState] = useState<State>({ status: "loading" });

  const fetchPaths = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/paths");
      if (!response.ok) {
        throw new Error("Failed to fetch paths");
      }
      const data = await response.json();
      setState({ status: "success", paths: data.paths });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }, []);

  useEffect(() => {
    fetchPaths();
  }, [fetchPaths]);

  if (state.status === "loading") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PathCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="font-semibold">Failed to load paths</h3>
          <p className="text-sm text-muted-foreground">{state.message}</p>
        </div>
        <Button onClick={fetchPaths} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (state.paths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-12">
        <h3 className="font-semibold">No paths assigned</h3>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have any learning paths assigned yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {state.paths.map((path) => (
        <PathCard key={path._id} path={path} />
      ))}
    </div>
  );
}
