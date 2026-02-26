"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Trophy,
  Users,
  Calendar,
  Medal,
  Plus,
  Search,
  Settings,
  Home,
} from "lucide-react";

export function CommandPalette({ tournaments = [] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Toggle command palette with Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (callback) => {
      setOpen(false);
      callback();
    },
    []
  );

  const navigationItems = [
    {
      icon: Home,
      label: "Dashboard Home",
      onSelect: () => router.push("/dashboard"),
    },
    {
      icon: Trophy,
      label: "All Tournaments",
      onSelect: () => router.push("/dashboard/tournaments"),
    },
    {
      icon: Settings,
      label: "Settings",
      onSelect: () => router.push("/dashboard/settings"),
    },
  ];

  const actionItems = [
    {
      icon: Plus,
      label: "Create New Tournament",
      onSelect: () => router.push("/dashboard/tournaments?action=create"),
      shortcut: "⌘N",
    },
    {
      icon: Search,
      label: "Search Tournaments",
      onSelect: () => router.push("/dashboard/tournaments"),
      shortcut: "⌘F",
    },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline-flex">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen} >
        <CommandInput placeholder="Type a command or search..."  />
        <CommandList className="bg-slate-50 dark:bg-slate-800 text-black dark:text-white">
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Navigation */}
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => handleSelect(item.onSelect)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Quick Actions */}
          <CommandGroup heading="Quick Actions">
            {actionItems.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => handleSelect(item.onSelect)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                {item.shortcut && (
                  <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                    {item.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>

          {/* Recent Tournaments */}
          {tournaments.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Recent Tournaments">
                {tournaments.slice(0, 5).map((tournament) => (
                  <CommandItem
                    key={tournament.id}
                    onSelect={() =>
                      handleSelect(() =>
                        router.push(`/dashboard/tournaments/${tournament.id}`)
                      )
                    }
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{tournament.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {tournament.year}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {/* Tournament Actions (when a tournament is selected) */}
          {tournaments.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Tournament Actions">
                <CommandItem
                  onSelect={() =>
                    handleSelect(() =>
                      router.push(
                        `/dashboard/tournaments/${tournaments[0]?.id}/participants`
                      )
                    )
                  }
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Manage Participants</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    handleSelect(() =>
                      router.push(
                        `/dashboard/tournaments/${tournaments[0]?.id}/matches`
                      )
                    )
                  }
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Manage Matches</span>
                </CommandItem>
                <CommandItem
                  onSelect={() =>
                    handleSelect(() =>
                      router.push(
                        `/dashboard/tournaments/${tournaments[0]?.id}/placements`
                      )
                    )
                  }
                >
                  <Medal className="mr-2 h-4 w-4" />
                  <span>View Placements</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}