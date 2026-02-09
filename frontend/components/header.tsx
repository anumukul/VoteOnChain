"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Vote, LayoutDashboard, PlusCircle, Users } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Vote className="h-5 w-5" />
          </div>
          <span className="text-lg">VoteOnChain</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/proposals" className="flex items-center gap-2">
              Proposals
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/delegate" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Delegation
            </Link>
          </Button>
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus="avatar"
          />
        </nav>
      </div>
    </header>
  );
}
