import { Email, ParsedEmail } from '@/types/email';

export function parseEmail(email: Email): ParsedEmail {
  const headers = email.payload.headers;
  
  const getHeader = (name: string): string => {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header?.value || '';
  };

  // Parse attachments
  const attachments: ParsedEmail['attachments'] = [];
  const parsePartsForAttachments = (parts?: any[]) => {
    if (!parts) return;
    parts.forEach(part => {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          size: part.body.size || 0,
          mimeType: part.mimeType
        });
      }
      if (part.parts) {
        parsePartsForAttachments(part.parts);
      }
    });
  };
  parsePartsForAttachments(email.payload.parts);

  return {
    id: email.id,
    threadId: email.threadId,
    from: getHeader('From'),
    to: getHeader('To'),
    cc: getHeader('Cc'),
    subject: getHeader('Subject'),
    date: getHeader('Date'),
    snippet: email.snippet,
    labels: email.labelIds,
    isUnread: email.labelIds.includes('UNREAD'),
    isStarred: email.labelIds.includes('STARRED'),
    isImportant: email.labelIds.includes('IMPORTANT'),
    hasAttachment: attachments.length > 0,
    attachments: attachments.length > 0 ? attachments : undefined
  };
}

export async function loadEmails(): Promise<ParsedEmail[]> {
  try {
    // Load the three email JSON files
    const emailFiles = ['email_001.json', 'email_002.json', 'email_003.json'];
    const emails: ParsedEmail[] = [];

    for (const file of emailFiles) {
      const response = await fetch(`/api/emails/${file}`);
      if (response.ok) {
        const email: Email = await response.json();
        emails.push(parseEmail(email));
      }
    }

    return emails;
  } catch (error) {
    console.error('Error loading emails:', error);
    return [];
  }
}

export interface Attachment {
  filename: string;
  mimeType: string;
}

interface EmailPart {
  mimeType: string;
  filename?: string;
}

interface EmailPayload {
  parts?: EmailPart[];
}

interface ThreadEmail {
  payload: EmailPayload;
}

export function extractAttachmentsFromThread(threadEmails: ThreadEmail[]): Attachment[] {
  const attachments: Attachment[] = [];
  
  threadEmails.forEach(email => {
    if (email.payload.parts) {
      email.payload.parts.forEach(part => {
        if (part.filename && part.filename !== '' && 
            part.mimeType !== 'text/plain' && 
            part.mimeType !== 'text/html') {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType
          });
        }
      });
    }
  });
  
  return attachments;
}

interface EmailHeader {
  name: string;
  value: string;
}

interface ThreadEmailWithHeaders {
  payload: {
    headers: EmailHeader[];
    parts?: EmailPart[];
  };
}

export function extractSenderEmailFromThread(threadEmails: ThreadEmailWithHeaders[]): string | undefined {
  if (!threadEmails || threadEmails.length === 0) return undefined;
  
  // Get the last email in the thread (most recent)
  const lastEmail = threadEmails[threadEmails.length - 1];
  const fromHeader = lastEmail.payload.headers.find(h => h.name.toLowerCase() === 'from');
  
  if (!fromHeader) return undefined;
  
  // Extract email from formats like "Name <email@example.com>" or just "email@example.com"
  const emailMatch = fromHeader.value.match(/<(.+?)>/) || fromHeader.value.match(/([^\s]+@[^\s]+)/);
  return emailMatch ? emailMatch[1] : undefined;
}
