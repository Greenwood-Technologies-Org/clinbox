'use client';

import { Menu, PenLine, Search } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';
import { useState, useEffect } from 'react';
import EmailList from './EmailList';
import OpenedEmail from './OpenedEmail';
import Calendar from './Calendar';
import WorkflowsList from './WorkflowsList';
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

interface MainContentProps {
  children: React.ReactNode;
  activeView: 'email' | 'calendar' | 'workflows' | 'workflowslist';
  onSelectEmail: (email: { filename?: string; sender?: { name: string; title: string; organization: string; email?: string }; aiAnalysis?: { summary: string; quickActions?: string[] }; tasks?: string[]; hasAttachments?: boolean; attachments?: Attachment[] } | null) => void;
}

export default function MainContent({ children, activeView, onSelectEmail }: MainContentProps) {
  const [activeGroup, setActiveGroup] = useState<string>('Important');
  const [emails, setEmails] = useState<Email[]>([]);
  const [emailData, setEmailData] = useState<EmailData>({});
  const [emailAIAnalysis, setEmailAIAnalysis] = useState<EmailAIAnalysis>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEmailFilename, setSelectedEmailFilename] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'opened'>('list');
  const [openedEmailSubject, setOpenedEmailSubject] = useState<string>('');
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>([]);

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
      ) : activeView === 'workflowslist' ? (
        <WorkflowsList />
      ) : null}
    </div>
  );
}
