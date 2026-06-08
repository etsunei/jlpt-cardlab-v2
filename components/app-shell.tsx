"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, BookOpen, Brain, Home, Library, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "首页", icon: Home },
  { href: "/learn", label: "学习", icon: BookOpen },
  { href: "/review", label: "复习", icon: Brain },
  { href: "/quiz", label: "测验", icon: Sparkles },
  { href: "/stats", label: "统计", icon: BarChart3 },
  { href: "/library", label: "词库", icon: Library },
  { href: "/settings", label: "设置", icon: Settings }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card/80 p-4 backdrop-blur lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen size={21} />
          </div>
          <div>
            <p className="text-base font-semibold">JLPT CardLab</p>
            <p className="text-xs text-muted-foreground">Anki x Mochi x Quizlet</p>
          </div>
        </Link>
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground",
                  active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-7 border-t border-border bg-card/95 px-1 py-2 backdrop-blur lg:hidden">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex flex-col items-center gap-1 rounded-md py-1 text-[11px] text-muted-foreground", active && "text-primary")}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
