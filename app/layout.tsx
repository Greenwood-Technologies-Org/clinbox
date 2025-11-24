'use client';

import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import SupplementaryPanel from "@/components/SupplementaryPanel";
import DocsPage from "@/components/DocsPage";
import WorkflowSettings from "@/components/WorkflowSettings";
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

interface SelectedDocument {
  id: string;
  name: string;
  description: string;
  modified: string;
  version: string;
  type: string;
}

interface SelectedWorkflow {
  id: string;
  name: string;
  description: string;
  modified: string;
  approval: string;
  integrations: string[];
}

interface SelectedWorkflowEvent {
  id: string;
  workflowId: string;
  workflowName: string;
  eventDescription: string;
  date: string;
  status: string;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [activeView, setActiveView] = useState<'email' | 'calendar' | 'docs' | 'workflows' | 'workflowsettings'>('email');
  const [selectedEmail, setSelectedEmail] = useState<SelectedEmail | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<SelectedDocument | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<SelectedWorkflow | null>(null);
  const [selectedWorkflowEvent, setSelectedWorkflowEvent] = useState<SelectedWorkflowEvent | null>(null);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isWorkflowBuilder, setIsWorkflowBuilder] = useState(false);

  return (
    <html lang="en">
      <body className="antialiased bg-white text-foreground">
        <div className="flex h-screen overflow-hidden">
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          {activeView === 'docs' ? (
            <DocsPage onSelectDocument={setSelectedDocument} />
          ) : activeView === 'workflowsettings' ? (
            <WorkflowSettings 
              onSelectWorkflow={setSelectedWorkflow} 
              onBuilderModeChange={setIsWorkflowBuilder}
            />
          ) : (
            <MainContent 
              activeView={activeView} 
              onSelectEmail={setSelectedEmail}
              onSelectWorkflow={setSelectedWorkflowEvent}
            >
              {children}
            </MainContent>
          )}
          <SupplementaryPanel 
            selectedEmail={selectedEmail} 
            selectedDocument={selectedDocument}
            selectedWorkflow={selectedWorkflow}
            selectedWorkflowEvent={selectedWorkflowEvent}
            activeView={activeView}
            showAllTasks={showAllTasks}
            onToggleAllTasks={() => setShowAllTasks(!showAllTasks)}
            showChat={showChat}
            onToggleChat={() => setShowChat(!showChat)}
            isWorkflowBuilder={isWorkflowBuilder}
          />
        </div>
      </body>
    </html>
  );
}
