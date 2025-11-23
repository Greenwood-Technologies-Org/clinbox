'use client';

import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import SupplementaryPanel from "@/components/SupplementaryPanel";
import DocsPage from "@/components/DocsPage";
import { useState } from "react";

interface SelectedEmail {
  filename?: string;
  sender?: {
    name: string;
    title: string;
    organization: string;
  };
  aiAnalysis?: {
    summary: string;
    quickActions?: string[];
  };
  tasks?: string[];
  hasAttachments?: boolean;
  attachments?: Array<{
    filename: string;
    mimeType: string;
  }>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeView, setActiveView] = useState<'email' | 'calendar' | 'docs'>('email');
  const [selectedEmail, setSelectedEmail] = useState<SelectedEmail | null>(null);

  return (
    <html lang="en">
      <body className="antialiased bg-white text-foreground">
        <div className="flex h-screen overflow-hidden">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          {activeView === 'docs' ? (
            <DocsPage />
          ) : (
            <MainContent 
              activeView={activeView} 
              onSelectEmail={setSelectedEmail}
            >
              {children}
            </MainContent>
          )}
          <SupplementaryPanel selectedEmail={selectedEmail} isDocsView={activeView === 'docs'} />
        </div>
      </body>
    </html>
  );
}
