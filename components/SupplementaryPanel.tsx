'use client';

interface SupplementaryPanelProps {
  children: React.ReactNode;
}

export default function SupplementaryPanel({ children }: SupplementaryPanelProps) {
  return (
    <div className="flex-1 bg-white border-l border-gray-200 overflow-y-auto">
      {children}
    </div>
  );
}
