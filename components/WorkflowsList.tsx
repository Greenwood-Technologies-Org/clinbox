'use client';

import { Menu, Search } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';

interface WorkflowEvent {
  id: string;
  workflowId: string;
  workflowName: string;
  eventDescription: string;
  date: string;
  status: string;
  triggerEmail: string | null;
}

interface WorkflowsListProps {
  workflows: WorkflowEvent[];
  selectedWorkflowEventId: string | null;
  loading: boolean;
  activeFilter: string;
  onActiveFilterChange: (filter: string) => void;
  onSelectWorkflow: (workflow: { id: string; workflowId: string; workflowName: string; eventDescription: string; date: string; status: string } | null) => void;
  onWorkflowHover: (workflow: { id: string; workflowId: string; workflowName: string; eventDescription: string; date: string; status: string } | null) => void;
  onSetSelectedEventId: (id: string | null) => void;
  onOpenWorkflow: (workflowName: string) => void;
}

export default function WorkflowsList({ 
  workflows, 
  selectedWorkflowEventId,
  loading,
  activeFilter,
  onActiveFilterChange,
  onSelectWorkflow,
  onWorkflowHover,
  onSetSelectedEventId,
  onOpenWorkflow
}: WorkflowsListProps) {
  let hoverTimeout: NodeJS.Timeout | null = null;
  const filters = ['Important', 'Critical', 'Urgent', 'Monitoring', 'Other'];

  return (
    <>
      {/* Navigation Bar */}
      <div className="px-4 pt-4 pb-6 flex items-start justify-between shrink-0">
        {/* Left: Hamburger Icon */}
        <button>
          <Menu {...getIconProps()} />
        </button>

        {/* Middle: Workflow Filters */}
        <div className="flex items-center gap-6">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => onActiveFilterChange(filter)}
              className={`text-sm transition-colors ${
                activeFilter === filter
                  ? 'text-black font-medium'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Right: Pen and Search Icons */}
        <div className="flex items-center gap-3">
          <button>
            <Search {...getIconProps()} />
          </button>
        </div>
      </div>

      {/* Workflow List Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No {activeFilter} Workflows</p>
          </div>
        ) : (
          <div>
            {workflows.map((workflow, index) => {
              const dateObj = new Date(workflow.date);
              const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              
              const handleMouseEnter = () => {
                // Clear any existing timeout
                if (hoverTimeout) {
                  clearTimeout(hoverTimeout);
                }
                
                // Set a new timeout for 0.1 seconds
                const timeout = setTimeout(() => {
                  onWorkflowHover({
                    id: workflow.id,
                    workflowId: workflow.workflowId,
                    workflowName: workflow.workflowName,
                    eventDescription: workflow.eventDescription,
                    date: workflow.date,
                    status: workflow.status
                  });
                }, 100);
                
                hoverTimeout = timeout;
              };
              
              const handleMouseLeave = () => {
                // Clear the timeout if the user leaves before 0.1 seconds
                if (hoverTimeout) {
                  clearTimeout(hoverTimeout);
                  hoverTimeout = null;
                }
              };
              
              return (
                <div
                  key={workflow.id || `workflow-${index}`}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => {
                    onSetSelectedEventId(workflow.id);
                    onSelectWorkflow({
                      id: workflow.id,
                      workflowId: workflow.workflowId,
                      workflowName: workflow.workflowName,
                      eventDescription: workflow.eventDescription,
                      date: workflow.date,
                      status: workflow.status
                    });
                    onOpenWorkflow(workflow.workflowName);
                  }}
                  className={`px-6 py-2 hover:bg-gray-100 cursor-pointer transition-colors min-w-0 ${
                    workflow.id === selectedWorkflowEventId ? 'bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Workflow Name - Fixed 20% width */}
                    <div className="w-[20%] shrink-0">
                      <span className="text-sm font-medium text-gray-900 truncate block">
                        {workflow.workflowName}
                      </span>
                    </div>
                    
                    {/* Event Description - Flexible width */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">
                        <span className="text-gray-700">{workflow.eventDescription}</span>
                      </div>
                    </div>
                    
                    {/* Date - Fixed width */}
                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      <span className="text-sm text-gray-600 w-16 text-right">
                        {date}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
