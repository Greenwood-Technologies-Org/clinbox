'use client';

import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import SupplementaryPanel from "@/components/SupplementaryPanel";
import { useState } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeView, setActiveView] = useState<'email' | 'calendar'>('email');

  return (
    <html lang="en">
      <body className="antialiased bg-white text-foreground">
        <div className="flex h-screen overflow-hidden">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          <MainContent activeView={activeView}>{children}</MainContent>
          <SupplementaryPanel>
            <div className="flex items-center justify-center h-full">
              <p className="text-muted">Supp Info</p>
            </div>
          </SupplementaryPanel>
        </div>
      </body>
    </html>
  );
}
