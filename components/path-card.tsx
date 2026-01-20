"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface PathCardProps {
  path: {
    _id: string;
    title: string;
    description: string;
    image: string;
    total_modules: number;
    completed_modules: number;
    progress: number;
  };
}

function getCtaText(progress: number): string {
  if (progress === 0) return "Start Learning";
  if (progress === 100) return "Review";
  return "Continue Learning";
}

export function PathCard({ path }: PathCardProps) {
  const ctaText = getCtaText(path.progress);

  return (
    <Card className="flex flex-col overflow-hidden py-0 gap-0">
      <div className="relative aspect-video w-full">
        <Image
          src={path.image}
          alt={path.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <CardHeader className="p-3 pb-1">
        <CardTitle className="line-clamp-1 text-sm">{path.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0">
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {path.completed_modules}/{path.total_modules} modules
            </span>
            <span className="font-medium">
              {Math.round(path.progress)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${path.progress}%` }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button asChild size="sm" className="w-full">
          <Link href={`/paths/${path._id}`}>{ctaText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PathCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden py-0 gap-0">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardHeader className="p-3 pb-1">
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="flex-1 p-3 pt-0">
        <div className="space-y-1">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full" />
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Skeleton className="h-8 w-full" />
      </CardFooter>
    </Card>
  );
}
