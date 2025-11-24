'use client';

import { useState, useEffect } from 'react';
import EmailList from './EmailList';
import OpenedEmail from './OpenedEmail';
import Calendar from './Calendar';
import WorkflowsList from './WorkflowsList';
import OpenedWorkflow from './OpenedWorkflow';
import type { Attachment } from '@/lib/email-utils';

interface Email {
  id: string;
  snippet: string;
  internalDate: string;
  filename?: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
  };
}

interface EmailData {
  [key: string]: {
    folder: string;
    sender?: {
      name: string;
      title: string;
      organization: string;
    };
    tasks?: string[];
    hasAttachments?: boolean;
  };
}

interface EmailAIAnalysis {
  [key: string]: {
    summary: string;
    quickActions?: string[];
  };
}

interface WorkflowEvent {
  id: string;
  workflowId: string;
  workflowName: string;
  eventDescription: string;
  date: string;
  status: string;
  triggerEmail: string | null;
}

interface MainContentProps {
  children: React.ReactNode;
  activeView: 'email' | 'calendar' | 'workflows';
  onSelectEmail: (email: { filename?: string; sender?: { name: string; title: string; organization: string; email?: string }; aiAnalysis?: { summary: string; quickActions?: string[] }; tasks?: string[]; hasAttachments?: boolean; attachments?: Attachment[] } | null) => void;
  onSelectWorkflow?: (workflow: { id: string; workflowId: string; workflowName: string; eventDescription: string; date: string; status: string } | null) => void;
}

export default function MainContent({ children, activeView, onSelectEmail, onSelectWorkflow }: MainContentProps) {
  const [activeGroup, setActiveGroup] = useState<string>('Important');
  const [emails, setEmails] = useState<Email[]>([]);
  const [emailData, setEmailData] = useState<EmailData>({});
  const [emailAIAnalysis, setEmailAIAnalysis] = useState<EmailAIAnalysis>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmailFilename, setSelectedEmailFilename] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'opened'>('list');
  const [openedEmailSubject, setOpenedEmailSubject] = useState<string>('');
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>([]);

  // Workflow state
  const [workflows, setWorkflows] = useState<WorkflowEvent[]>([]);
  const [allWorkflows, setAllWorkflows] = useState<WorkflowEvent[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState<boolean>(true);
  const [selectedWorkflowEventId, setSelectedWorkflowEventId] = useState<string | null>(null);
  const [workflowViewMode, setWorkflowViewMode] = useState<'list' | 'opened'>('list');
  const [openedWorkflowName, setOpenedWorkflowName] = useState<string>('');
  const [activeWorkflowFilter, setActiveWorkflowFilter] = useState<string>('All');

  // Helper function to load thread emails and extract attachments
  const loadThreadAttachments = async (filename: string): Promise<Attachment[]> => {
    try {
      const response = await fetch(`/api/emails/${filename}`);
      const emailData = await response.json();
      
      if (emailData.threadEmails) {
        const { extractAttachmentsFromThread } = await import('@/lib/email-utils');
        return extractAttachmentsFromThread(emailData.threadEmails);
      }
      return [];
    } catch (error) {
      console.error('Error loading thread attachments:', error);
      return [];
    }
  };

  // Helper function to load thread emails and extract sender email
  const loadSenderEmail = async (filename: string): Promise<string | undefined> => {
    try {
      const response = await fetch(`/api/emails/${filename}`);
      const emailData = await response.json();
      
      if (emailData.threadEmails) {
        const { extractSenderEmailFromThread } = await import('@/lib/email-utils');
        return extractSenderEmailFromThread(emailData.threadEmails);
      }
      return undefined;
    } catch (error) {
      console.error('Error loading sender email:', error);
      return undefined;
    }
  };

  useEffect(() => {
    const loadEmails = async () => {
      setLoading(true);
      try {
        // Load email data to get folder assignments
        const emailDataResponse = await fetch('/api/emails/email_data.json');
        const emailDataJson: EmailData = await emailDataResponse.json();
        setEmailData(emailDataJson);

        // Load AI analysis data
        const aiAnalysisResponse = await fetch('/api/emails/email_ai_analysis.json');
        const aiAnalysisJson: EmailAIAnalysis = await aiAnalysisResponse.json();
        setEmailAIAnalysis(aiAnalysisJson);

        // Load all emails and filter by active group
        const emailPromises = Object.keys(emailDataJson).map(async (filename) => {
          if (emailDataJson[filename].folder === activeGroup) {
            const response = await fetch(`/api/emails/${filename}`);
            const emailContent = await response.json();
            // Attach the filename to the email object so we can look up metadata later
            return { ...emailContent, filename };
          }
          return null;
        });

        const allEmails = await Promise.all(emailPromises);
        const filteredEmails = allEmails.filter((email): email is Email => email !== null);
        
        // Sort by date (most recent first)
        filteredEmails.sort((a, b) => 
          parseInt(b.internalDate) - parseInt(a.internalDate)
        );
        
        setEmails(filteredEmails);
        
        // Select the first email by default
        if (filteredEmails.length > 0) {
          const firstEmail = filteredEmails[0];
          if (firstEmail.filename && emailDataJson[firstEmail.filename]?.sender) {
            const filename = firstEmail.filename;
            setSelectedEmailFilename(filename);
            
            // Load thread emails to extract attachments and sender email
            Promise.all([
              loadThreadAttachments(filename),
              loadSenderEmail(filename)
            ]).then(([attachments, senderEmail]) => {
              onSelectEmail({
                filename: filename,
                sender: {
                  ...emailDataJson[filename].sender!,
                  email: senderEmail
                },
                aiAnalysis: aiAnalysisJson[filename],
                tasks: emailDataJson[filename].tasks,
                hasAttachments: emailDataJson[filename].hasAttachments,
                attachments: attachments
              });
            });
          }
        }
      } catch (error) {
        console.error('Error loading emails:', error);
        setEmails([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeView === 'email') {
      loadEmails();
    }
  }, [activeGroup, activeView]);

  useEffect(() => {
    const loadWorkflows = async () => {
      setWorkflowsLoading(true);
      try {
        const response = await fetch('/api/workflows');
        const workflowsData: WorkflowEvent[] = await response.json();
        setAllWorkflows(workflowsData);
        
        // Apply filter
        const filteredWorkflows = filterWorkflows(workflowsData, activeWorkflowFilter);
        
        // Sort by date (most recent first)
        filteredWorkflows.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setWorkflows(filteredWorkflows);
        
        // Select the first workflow by default
        if (filteredWorkflows.length > 0 && onSelectWorkflow) {
          const firstWorkflow = filteredWorkflows[0];
          setSelectedWorkflowEventId(firstWorkflow.id);
          onSelectWorkflow({
            id: firstWorkflow.id,
            workflowId: firstWorkflow.workflowId,
            workflowName: firstWorkflow.workflowName,
            eventDescription: firstWorkflow.eventDescription,
            date: firstWorkflow.date,
            status: firstWorkflow.status
          });
        }
      } catch (error) {
        console.error('Error loading workflows:', error);
        setWorkflows([]);
      } finally {
        setWorkflowsLoading(false);
      }
    };

    if (activeView === 'workflows') {
      loadWorkflows();
    }
  }, [activeView, activeWorkflowFilter]);

  const filterWorkflows = (workflowsData: WorkflowEvent[], filter: string): WorkflowEvent[] => {
    if (filter === 'All') return workflowsData;
    
    const statusMap: { [key: string]: string[] } = {
      'Pending': ['pending_approval'],
      'In Progress': ['in_progress'],
      'Completed': ['completed']
    };
    
    const targetStatuses = statusMap[filter] || [];
    return workflowsData.filter(wf => targetStatuses.includes(wf.status));
  };

  const handleWorkflowFilterChange = (filter: string) => {
    setActiveWorkflowFilter(filter);
    const filteredWorkflows = filterWorkflows(allWorkflows, filter);
    filteredWorkflows.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setWorkflows(filteredWorkflows);
  };

  return (
    <div className="w-full md:w-[66%] lg:w-[69%] xl:w-[73%] bg-white flex flex-col">
      {activeView === 'email' ? (
        viewMode === 'list' ? (
          <EmailList
            emails={emails}
            emailData={emailData}
            emailAIAnalysis={emailAIAnalysis}
            selectedEmailFilename={selectedEmailFilename}
            loading={loading}
            activeGroup={activeGroup}
            onActiveGroupChange={setActiveGroup}
            onSelectEmail={onSelectEmail}
            onEmailHover={(email) => {
              if (email?.filename) {
                setSelectedEmailFilename(email.filename);
                onSelectEmail(email);
              }
            }}
            onSetSelectedFilename={setSelectedEmailFilename}
            onOpenEmail={(subject) => {
              setOpenedEmailSubject(subject);
              setViewMode('opened');
            }}
            loadThreadAttachments={loadThreadAttachments}
          />
        ) : (
          <OpenedEmail 
            subject={openedEmailSubject}
            filename={selectedEmailFilename || undefined}
            onBack={() => setViewMode('list')}
            onNavigateUp={() => {
              const currentIndex = emails.findIndex(e => e.filename === selectedEmailFilename);
              if (currentIndex > 0) {
                const prevEmail = emails[currentIndex - 1];
                if (prevEmail.filename && emailData[prevEmail.filename]?.sender) {
                  const subjectHeader = prevEmail.payload.headers.find(h => h.name === 'Subject');
                  const subject = subjectHeader?.value || 'No Subject';
                  setSelectedEmailFilename(prevEmail.filename);
                  setOpenedEmailSubject(subject);
                  
                  Promise.all([
                    loadThreadAttachments(prevEmail.filename),
                    loadSenderEmail(prevEmail.filename)
                  ]).then(([attachments, senderEmail]) => {
                    onSelectEmail({
                      filename: prevEmail.filename,
                      sender: {
                        ...emailData[prevEmail.filename!].sender!,
                        email: senderEmail
                      },
                      aiAnalysis: emailAIAnalysis[prevEmail.filename!],
                      tasks: emailData[prevEmail.filename!].tasks,
                      hasAttachments: emailData[prevEmail.filename!].hasAttachments,
                      attachments: attachments
                    });
                  });
                }
              }
            }}
            onNavigateDown={() => {
              const currentIndex = emails.findIndex(e => e.filename === selectedEmailFilename);
              if (currentIndex < emails.length - 1) {
                const nextEmail = emails[currentIndex + 1];
                if (nextEmail.filename && emailData[nextEmail.filename]?.sender) {
                  const subjectHeader = nextEmail.payload.headers.find(h => h.name === 'Subject');
                  const subject = subjectHeader?.value || 'No Subject';
                  setSelectedEmailFilename(nextEmail.filename);
                  setOpenedEmailSubject(subject);
                  
                  Promise.all([
                    loadThreadAttachments(nextEmail.filename),
                    loadSenderEmail(nextEmail.filename)
                  ]).then(([attachments, senderEmail]) => {
                    onSelectEmail({
                      filename: nextEmail.filename,
                      sender: {
                        ...emailData[nextEmail.filename!].sender!,
                        email: senderEmail
                      },
                      aiAnalysis: emailAIAnalysis[nextEmail.filename!],
                      tasks: emailData[nextEmail.filename!].tasks,
                      hasAttachments: emailData[nextEmail.filename!].hasAttachments,
                      attachments: attachments
                    });
                  });
                }
              }
            }}
            canNavigateUp={emails.findIndex(e => e.filename === selectedEmailFilename) > 0}
            canNavigateDown={emails.findIndex(e => e.filename === selectedEmailFilename) < emails.length - 1}
            onAttachmentsChange={(attachments) => {
              setCurrentAttachments(attachments);
              if (selectedEmailFilename && emailData[selectedEmailFilename]?.sender) {
                // Load sender email when attachments change
                loadSenderEmail(selectedEmailFilename).then(senderEmail => {
                  onSelectEmail({
                    filename: selectedEmailFilename,
                    sender: {
                      ...emailData[selectedEmailFilename].sender!,
                      email: senderEmail
                    },
                    aiAnalysis: emailAIAnalysis[selectedEmailFilename],
                    tasks: emailData[selectedEmailFilename].tasks,
                    hasAttachments: emailData[selectedEmailFilename].hasAttachments,
                    attachments: attachments
                  });
                });
              }
            }}
          />
        )
      ) : activeView === 'calendar' ? (
        <Calendar />
      ) : activeView === 'workflows' ? (
        workflowViewMode === 'list' ? (
          <WorkflowsList
            workflows={workflows}
            selectedWorkflowEventId={selectedWorkflowEventId}
            loading={workflowsLoading}
            activeFilter={activeWorkflowFilter}
            onActiveFilterChange={handleWorkflowFilterChange}
            onSelectWorkflow={(workflow) => {
              if (onSelectWorkflow) {
                onSelectWorkflow(workflow);
              }
            }}
            onWorkflowHover={(workflow) => {
              if (workflow && onSelectWorkflow) {
                setSelectedWorkflowEventId(workflow.id);
                onSelectWorkflow(workflow);
              }
            }}
            onSetSelectedEventId={setSelectedWorkflowEventId}
            onOpenWorkflow={(workflowName) => {
              setOpenedWorkflowName(workflowName);
              setWorkflowViewMode('opened');
            }}
          />
        ) : (
          <OpenedWorkflow 
            workflowName={openedWorkflowName}
            eventId={selectedWorkflowEventId || undefined}
            onBack={() => setWorkflowViewMode('list')}
          />
        )
      ) : null}
    </div>
  );
}
