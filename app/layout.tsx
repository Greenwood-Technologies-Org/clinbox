'use client';

import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import SupplementaryPanel from "@/components/SupplementaryPanel";
import DocsPage from "@/components/DocsPage";
import WorkflowSettings from "@/components/WorkflowSettings";
import TutorialDriver from "@/components/TutorialDriver";
import { createClinicalTutorialSteps } from "@/lib/tutorial-steps";
import { useState, useEffect, useRef } from "react";

interface SelectedEmail {
  filename?: string;
  sender?: {
    name: string;
    title: string;
    organization: string;
  };
  aiAnalysis?: {
    summary: string;
    quickActions?: Array<string | { action: string; emails?: Array<{ to: string; subject: string; body: string; references: string[] }> }>;
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
  actions?: Array<{
    actionNumber: number;
    action: string;
    input: string;
    output: string;
    description: string;
    approval: string;
  }>;
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
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialActiveGroup, setTutorialActiveGroup] = useState<string | undefined>(undefined);

  // Create tutorial steps with handlers
  const tutorialSteps = createClinicalTutorialSteps(
    (group) => {
      if (showTutorial) {
        setTutorialActiveGroup(group);
      }
    },
    (filename) => {
      // Email click will be handled by normal email selection
      // The tutorial will just highlight and guide
    },
    () => {
      // Quick action click handler
    }
  );

  // Handle tutorial actions
  const handleTutorialAction = (actionId: string) => {
    // Handle specific tutorial actions
    if (actionId === 'urgent-email-click') {
      // Wait a bit for emails to load, then click first urgent email
      setTimeout(() => {
        const urgentEmail = document.querySelector('[data-tutorial="urgent-email"]');
        if (urgentEmail) {
          (urgentEmail as HTMLElement).click();
        }
      }, 800);
    } else if (actionId === 'dupliplex-email') {
      // Ensure we're on Important tab and wait for email to appear
      setTutorialActiveGroup('Important');
      setTimeout(() => {
        const dupliplexEmail = document.querySelector('[data-tutorial="dupliplex-email"]');
        if (dupliplexEmail) {
          (dupliplexEmail as HTMLElement).click();
        }
      }, 800);
    }
  };

  // Handler for email clicks from tutorial
  const handleEmailClick = (filename: string) => {
    // This will be called when tutorial needs to click an email
    // The email click will be handled by the normal email selection flow
  };

  return (
    <html lang="en">
      <body className="antialiased bg-white text-foreground">
        <div className="flex h-screen overflow-hidden">
          <Sidebar 
            activeView={activeView} 
            setActiveView={setActiveView}
            onTutorialClick={() => setShowTutorial(true)}
          />
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
              externalActiveGroup={showTutorial ? tutorialActiveGroup : undefined}
              onActiveGroupChange={(group) => {
                // Only control group if tutorial is active
                if (showTutorial) {
                  setTutorialActiveGroup(group);
                }
              }}
              onEmailClick={handleEmailClick}
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
          
          {/* Tutorial Driver */}
          {showTutorial && (
            <TutorialDriver
              steps={tutorialSteps}
              isActive={showTutorial}
              activeView={activeView}
              onViewChange={(view) => {
                setActiveView(view);
              }}
              onClose={() => {
                setShowTutorial(false);
                // Reset group control after a delay to let MainContent resume control
                setTimeout(() => {
                  setTutorialActiveGroup(undefined);
                }, 100);
              }}
              onComplete={() => {
                localStorage.setItem('tutorial-completed', 'true');
                setShowTutorial(false);
                setTimeout(() => {
                  setTutorialActiveGroup(undefined);
                }, 100);
              }}
              onAction={(actionId) => {
                handleTutorialAction(actionId);
              }}
            />
          )}
        </div>
      </body>
    </html>
  );
}
