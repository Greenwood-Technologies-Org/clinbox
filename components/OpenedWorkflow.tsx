export default function OpenedWorkflow({ 
  workflowName, 
  eventId,
  onBack 
}: { 
  workflowName: string; 
  eventId?: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-gray-400 text-xl mb-2">OpenedWorkflow</h1>
        <p className="text-gray-300 text-sm">{workflowName}</p>
        <button 
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
        >
          Back to List
        </button>
      </div>
    </div>
  );
}
