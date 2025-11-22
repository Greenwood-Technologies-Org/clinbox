export interface EmailHeader {
  name: string;
  value: string;
}

export interface EmailBody {
  size: number;
  data?: string;
  attachmentId?: string;
}

export interface EmailPart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: EmailHeader[];
  body: EmailBody;
  parts?: EmailPart[];
}

export interface EmailPayload {
  partId: string;
  mimeType: string;
  filename: string;
  headers: EmailHeader[];
  body: EmailBody;
  parts?: EmailPart[];
}

export interface Email {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: EmailPayload;
  sizeEstimate: number;
  raw: string | null;
}

export interface EmailThread {
  id: string;
  emails: Email[];
}

export interface ParsedEmail {
  id: string;
  threadId: string;
  from: string;
  to: string;
  cc?: string;
  subject: string;
  date: string;
  snippet: string;
  labels: string[];
  isUnread: boolean;
  isStarred: boolean;
  isImportant: boolean;
  hasAttachment: boolean;
  attachments?: Array<{
    filename: string;
    size: number;
    mimeType: string;
  }>;
}
