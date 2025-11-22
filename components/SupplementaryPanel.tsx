'use client';

interface SupplementaryPanelProps {
  children: React.ReactNode;
}

export default function SupplementaryPanel({ children }: SupplementaryPanelProps) {
  return (
    <div className="flex-[0.3] bg-white border-l border-gray-200 overflow-y-auto">
      {children}
    </div>
  );
}
