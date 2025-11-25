'use client';

import { useState, useEffect } from 'react';
import EmailList from './EmailList';
import OpenedEmail from './OpenedEmail';
import Calendar from './Calendar';
import WorkflowsList from './WorkflowsList';
import OpenedWorkflow from './OpenedWorkflow';
import type { Attachment } from '@/lib/email-utils';

interface Thread {
  filename: string;
  messages: Array<{
    from_address: string;
    to_addresses: string[];
    cc_addresses: string[];
    subject: string;
    timestamp: string;
    body: string;
    attachments: string[];
    message_id: number;
    in_reply_to: number | null;
  }>;
}

interface ThreadData {
  folder: string;
  senders: Array<{
    name: string;
    title: string;
    organization: string;
  }>;
  tasks: string[];
  hasAttachments: boolean;
}

interface ThreadAIAnalysis {
  summary: string;
  quickActions: any[];
  workflow: {
    workflowId: string;
    status: string;
    steps: Array<{
      name: string;
      result: string;
      reasoning: string;
    }>;
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
  onSelectEmail: (email: { filename?: string; sender?: { name: string; title: string; organization: string; email?: string }; aiAnalysis?: { summary: string; quickActions?: Array<string | { action: string; emails?: Array<{ to: string; subject: string; body: string; references: string[] }> }> }; tasks?: string[]; hasAttachments?: boolean; attachments?: Attachment[] } | null) => void;
  onSelectWorkflow?: (workflow: { id: string; workflowId: string; workflowName: string; eventDescription: string; date: string; status: string } | null) => void;
}

export default function MainContent({ children, activeView, onSelectEmail, onSelectWorkflow }: MainContentProps) {
  const [activeGroup, setActiveGroup] = useState<string>('Critical');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadData, setThreadData] = useState<ThreadData[]>([]);
  const [threadAIAnalysis, setThreadAIAnalysis] = useState<ThreadAIAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedThreadFilename, setSelectedThreadFilename] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'opened'>('list');
  const [openedThreadSubject, setOpenedThreadSubject] = useState<string>('');
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>([]);

  // Workflow state
  const [workflows, setWorkflows] = useState<WorkflowEvent[]>([]);
  const [allWorkflows, setAllWorkflows] = useState<WorkflowEvent[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState<boolean>(true);
  const [selectedWorkflowEventId, setSelectedWorkflowEventId] = useState<string | null>(null);
  const [workflowViewMode, setWorkflowViewMode] = useState<'list' | 'opened'>('list');
  const [openedWorkflowName, setOpenedWorkflowName] = useState<string>('');
  const [activeWorkflowFilter, setActiveWorkflowFilter] = useState<string>('All');

  // Helper function to load thread messages and extract attachments
  const loadThreadAttachments = async (filename: string): Promise<Attachment[]> => {
    try {
      const response = await fetch(`/api/emails/${filename}`);
      const threadData = await response.json();
      
      // Extract attachments from all messages in the thread
      const allAttachments: Attachment[] = [];
      threadData.forEach((message: any) => {
        message.attachments.forEach((attachment: string) => {
          allAttachments.push({
            filename: attachment,
            mimeType: 'application/octet-stream' // Default mime type
          });
        });
      });
      return allAttachments;
    } catch (error) {
      console.error('Error loading thread attachments:', error);
      return [];
    }
  };

  // Helper function to load thread messages and extract sender email
  const loadSenderEmail = async (filename: string): Promise<string | undefined> => {
    try {
      const response = await fetch(`/api/emails/${filename}`);
      const threadData = await response.json();
      
      // Return the from_address of the first message
      if (threadData.length > 0) {
        return threadData[0].from_address;
      }
      return undefined;
    } catch (error) {
      console.error('Error loading sender email:', error);
      return undefined;
    }
  };

  useEffect(() => {
    const loadThreads = async () => {
      setLoading(true);
      try {
        // Load thread data to get folder assignments
        const threadDataResponse = await fetch('/api/emails/thread_data.json');
        const threadDataJson: ThreadData[] = await threadDataResponse.json();
        setThreadData(threadDataJson);

        // Load AI analysis data
        const aiAnalysisResponse = await fetch('/api/emails/thread_ai_analyses.json');
        const aiAnalysisJson: ThreadAIAnalysis[] = await aiAnalysisResponse.json();
        setThreadAIAnalysis(aiAnalysisJson);

        // Load all threads and filter by active group
        const threadPromises = threadDataJson.map(async (threadInfo, index) => {
          const filename = `thread_${index.toString().padStart(3, '0')}.json`;
          if (threadInfo.folder === activeGroup) {
            const response = await fetch(`/api/emails/${filename}`);
            const threadContent = await response.json();
            // Attach the filename to the thread object so we can look up metadata later
            return { filename, messages: threadContent };
          }
          return null;
        });

        const allThreads = await Promise.all(threadPromises);
        const filteredThreads = allThreads.filter((thread): thread is Thread => thread !== null);
        
        // Sort by date (most recent first) - use the timestamp of the first message
        filteredThreads.sort((a, b) => 
          new Date(b.messages[0].timestamp).getTime() - new Date(a.messages[0].timestamp).getTime()
        );
        
        setThreads(filteredThreads);
        
        // Select the first thread by default
        if (filteredThreads.length > 0) {
          const firstThread = filteredThreads[0];
          const threadIndex = parseInt(firstThread.filename.replace('thread_', '').replace('.json', ''));
          setSelectedThreadFilename(firstThread.filename);
          
          // Load thread messages to extract attachments and sender email
          Promise.all([
            loadThreadAttachments(firstThread.filename),
            loadSenderEmail(firstThread.filename)
          ]).then(([attachments, senderEmail]) => {
            const threadDataItem = threadDataJson[threadIndex];
            onSelectEmail({
              filename: firstThread.filename,
              sender: {
                name: threadDataItem.senders[0]?.name || 'Unknown',
                title: threadDataItem.senders[0]?.title || '',
                organization: threadDataItem.senders[0]?.organization || '',
                email: senderEmail
              },
              aiAnalysis: aiAnalysisJson[threadIndex],
              tasks: threadDataItem.tasks,
              hasAttachments: threadDataItem.hasAttachments,
              attachments: attachments
            });
          });
        }
      } catch (error) {
        console.error('Error loading threads:', error);
        setThreads([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeView === 'email') {
      loadThreads();
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
            threads={threads}
            threadData={threadData}
            threadAIAnalysis={threadAIAnalysis}
            selectedThreadFilename={selectedThreadFilename}
            loading={loading}
            activeGroup={activeGroup}
            onActiveGroupChange={setActiveGroup}
            onSelectEmail={onSelectEmail}
            onThreadHover={(thread) => {
              if (thread?.filename) {
                setSelectedThreadFilename(thread.filename);
                onSelectEmail(thread);
              }
            }}
            onSetSelectedFilename={setSelectedThreadFilename}
            onOpenThread={(subject) => {
              setOpenedThreadSubject(subject);
              setViewMode('opened');
            }}
            loadThreadAttachments={loadThreadAttachments}
          />
        ) : (
          <OpenedEmail 
            subject={openedThreadSubject}
            filename={selectedThreadFilename || undefined}
            onBack={() => setViewMode('list')}
            onNavigateUp={() => {
              const currentIndex = threads.findIndex(t => t.filename === selectedThreadFilename);
              if (currentIndex > 0) {
                const prevThread = threads[currentIndex - 1];
                const threadIndex = parseInt(prevThread.filename.replace('thread_', '').replace('.json', ''));
                const subject = prevThread.messages[0]?.subject || 'No Subject';
                setSelectedThreadFilename(prevThread.filename);
                setOpenedThreadSubject(subject);
                
                Promise.all([
                  loadThreadAttachments(prevThread.filename),
                  loadSenderEmail(prevThread.filename)
                ]).then(([attachments, senderEmail]) => {
                  const threadDataItem = threadData[threadIndex];
                  onSelectEmail({
                    filename: prevThread.filename,
                    sender: {
                      name: threadDataItem.senders[0]?.name || 'Unknown',
                      title: threadDataItem.senders[0]?.title || '',
                      organization: threadDataItem.senders[0]?.organization || '',
                      email: senderEmail
                    },
                    aiAnalysis: threadAIAnalysis[threadIndex],
                    tasks: threadDataItem.tasks,
                    hasAttachments: threadDataItem.hasAttachments,
                    attachments: attachments
                  });
                });
              }
            }}
            onNavigateDown={() => {
              const currentIndex = threads.findIndex(t => t.filename === selectedThreadFilename);
              if (currentIndex < threads.length - 1) {
                const nextThread = threads[currentIndex + 1];
                const threadIndex = parseInt(nextThread.filename.replace('thread_', '').replace('.json', ''));
                const subject = nextThread.messages[0]?.subject || 'No Subject';
                setSelectedThreadFilename(nextThread.filename);
                setOpenedThreadSubject(subject);
                
                Promise.all([
                  loadThreadAttachments(nextThread.filename),
                  loadSenderEmail(nextThread.filename)
                ]).then(([attachments, senderEmail]) => {
                  const threadDataItem = threadData[threadIndex];
                  onSelectEmail({
                    filename: nextThread.filename,
                    sender: {
                      name: threadDataItem.senders[0]?.name || 'Unknown',
                      title: threadDataItem.senders[0]?.title || '',
                      organization: threadDataItem.senders[0]?.organization || '',
                      email: senderEmail
                    },
                    aiAnalysis: threadAIAnalysis[threadIndex],
                    tasks: threadDataItem.tasks,
                    hasAttachments: threadDataItem.hasAttachments,
                    attachments: attachments
                  });
                });
              }
            }}
            canNavigateUp={threads.findIndex(t => t.filename === selectedThreadFilename) > 0}
            canNavigateDown={threads.findIndex(t => t.filename === selectedThreadFilename) < threads.length - 1}
            onAttachmentsChange={(attachments) => {
              setCurrentAttachments(attachments);
              if (selectedThreadFilename && threadData.length > 0) {
                const threadIndex = parseInt(selectedThreadFilename.replace('thread_', '').replace('.json', ''));
                // Load sender email when attachments change
                loadSenderEmail(selectedThreadFilename).then(senderEmail => {
                  const threadDataItem = threadData[threadIndex];
                  onSelectEmail({
                    filename: selectedThreadFilename,
                    sender: {
                      name: threadDataItem.senders[0]?.name || 'Unknown',
                      title: threadDataItem.senders[0]?.title || '',
                      organization: threadDataItem.senders[0]?.organization || '',
                      email: senderEmail
                    },
                    aiAnalysis: threadAIAnalysis[threadIndex],
                    tasks: threadDataItem.tasks,
                    hasAttachments: threadDataItem.hasAttachments,
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
