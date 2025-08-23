
import * as React from 'react';
import { SiGithub } from "react-icons/si";
import { Button } from './ui/button';
import { TbBellHeart } from "react-icons/tb";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="flex items-center gap-2">
          <TbBellHeart className="h-8 w-8" />
          <span className="font-headline text-xl font-bold text-foreground">
            httfy
          </span>
        </div>
        <div className="ml-auto">
          <Button variant="ghost" size="icon" asChild>
            <a href="https://github.com/thesushilsharma/httfy" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository">
              <SiGithub className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
