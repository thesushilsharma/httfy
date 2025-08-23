
import * as React from 'react';

export function Footer() {
  return (
    <footer className="bg-muted/50">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} httfy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
