"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function Header() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
      <h1 className="text-base font-semibold sm:text-xl">Learning Path Service</h1>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden text-sm text-muted-foreground sm:block">
          {session?.user?.email}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
