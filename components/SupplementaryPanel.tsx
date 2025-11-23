'use client';

interface SelectedEmail {
  filename?: string;
  sender?: {
    name: string;
    title: string;
    organization: string;
  };
}

interface SupplementaryPanelProps {
  children: React.ReactNode;
  selectedEmail: SelectedEmail | null;
}

export default function SupplementaryPanel({ children, selectedEmail }: SupplementaryPanelProps) {
  return (
    <div className="flex-1 bg-white border-l border-gray-200 overflow-y-auto">
      {selectedEmail?.sender ? (
        <div className="pt-3 px-6">
          {/* Sender Information */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {selectedEmail.sender.name}
            </h1>
            <p className="text-sm text-gray-600">
              {selectedEmail.sender.title}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {selectedEmail.sender.organization}
            </p>
            <div className="border-b border-gray-200"></div>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
