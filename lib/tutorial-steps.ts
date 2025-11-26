import { TutorialStep } from '@/components/TutorialDriver';

export const createClinicalTutorialSteps = (
  onGroupChange?: (group: string) => void,
  onEmailClick?: (filename: string) => void,
  onQuickActionClick?: () => void,
): TutorialStep[] => [
  {
    id: 'documents-button',
    title: 'Documents Library',
    description: 'Click the Documents button to access all study documents, protocols, and guidelines.',
    value: 'Quick access to ICH-GCP guidelines, protocol amendments, EDC user guides, and regulatory documents needed for clinical trial management.',
    targetSelector: '[data-tutorial="documents-button"]',
    position: 'right',
    advanceOnTargetClick: true,
  },
  {
    id: 'workflows-button',
    title: 'Custom Clinical Science Workflows',
    description: 'Click the workflows button above Documents to open the workflow settings workspace.',
    value: 'Automate repetitive tasks like SAE reporting, protocol deviation tracking, and site visit scheduling to save time and ensure consistency.',
    targetSelector: '[data-tutorial="workflows-button"]',
    position: 'right',
    advanceOnTargetClick: true,
  },
  {
    id: 'mail-important',
    title: 'Email Inbox - Important Tab',
    description: 'Click the Important tab to view high-priority clinical communications.',
    value: 'Important emails include protocol updates, vendor communications, and regulatory notifications that require attention but aren\'t immediately critical.',
    targetView: 'email',
    targetSelector: '[data-tutorial="important-tab"]',
    position: 'bottom',
    action: () => {
      onGroupChange?.('Important');
    },
    advanceOnTargetClick: true,
  },
  {
    id: 'dupliplex-email',
    title: 'Dupliplex Imaging Email',
    description: 'This email from Dupliplex Imaging contains brain MRI analysis results for patient follow-up scans.',
    value: 'Central imaging lab results are automatically categorized as Important to help you track biomarker data and imaging endpoints for your clinical trial.',
    targetSelector: '[data-tutorial="dupliplex-email"]',
    position: 'left',
    waitForElement: true,
  },
  {
    id: 'approval-checkmark',
    title: 'Workflow Approval',
    description: 'Use the checkmark button next to approval actions to approve automated workflow steps.',
    value: 'Workflow approvals ensure proper oversight while automating routine clinical trial operations, maintaining compliance and quality control.',
    targetSelector: '[data-tutorial="approval-checkmark"]',
    position: 'left',
    waitForElement: true,
  },
  {
    id: 'urgent-tab',
    title: 'Urgent Tab',
    description: 'Click the Urgent tab to view time-sensitive clinical research communications.',
    value: 'Urgent emails typically include protocol deviations requiring immediate action, site issues, or regulatory deadlines that need prompt resolution.',
    targetSelector: '[data-tutorial="urgent-tab"]',
    position: 'bottom',
    action: () => {
      onGroupChange?.('Urgent');
    },
    advanceOnTargetClick: true,
  },
  {
    id: 'urgent-email-click',
    title: 'Select an Email',
    description: 'Click on an urgent email to open its details and available actions.',
    value: 'Viewing email details helps you understand the context and urgency of clinical trial communications before taking action.',
    targetSelector: '[data-tutorial="urgent-email"]',
    position: 'left',
    waitForElement: true,
    advanceOnTargetClick: true,
  },
  {
    id: 'quick-actions-checkbox',
    title: 'Quick Actions',
    description: 'In the Quick Actions section, click the checkmark to approve AI-suggested actions for the email.',
    value: 'Quick Actions leverage AI to suggest appropriate responses like drafting acknowledgment emails, creating follow-up tasks, or triggering workflows, saving you valuable time.',
    targetSelector: '[data-tutorial="quick-action-checkbox"]',
    position: 'left',
    waitForElement: true,
    action: () => {
      onQuickActionClick?.();
    },
  },
  {
    id: 'complete',
    title: 'Tutorial Complete!',
    description: 'You\'re all set! You\'ve learned how to navigate documents, workflows, and manage urgent clinical communications.',
    value: 'Continue exploring to discover how ClinBox helps you streamline clinical research workflows, prioritize critical communications, and maintain compliance.',
    position: 'center',
  },
];

