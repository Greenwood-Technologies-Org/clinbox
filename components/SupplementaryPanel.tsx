'use client';

interface SupplementaryPanelProps {
  children: React.ReactNode;
}

export default function SupplementaryPanel({ children }: SupplementaryPanelProps) {
  return (
    <div className="w-60 md:w-72 lg:w-80 xl:w-96 bg-white border-l border-gray-200 overflow-y-auto">
      {children}
    </div>
  );
}
