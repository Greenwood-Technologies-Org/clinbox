'use client';

import { useState, useEffect } from 'react';
import { CirclePlus, CircleMinus } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';

interface Workflow {
  id: string;
  name: string;
  description: string;
  modified: string;
  requiresApproval: string;
  integrations: string[];
}

interface WorkflowSettingsProps {
  onSelectWorkflow: (workflow: Workflow | null) => void;
}

export default function WorkflowSettings({ onSelectWorkflow }: WorkflowSettingsProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // Define column widths (percentages for flexible columns, action is fixed width)
  const columnWidths = {
    name: 55,
    requiresApproval: 25,
    modified: 20
  };

  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const response = await fetch('/api/emails/workflow_settings.json');
        const data = await response.json();
        setWorkflows(data);
        if (data.length > 0) {
          setSelectedWorkflow(data[0]);
          onSelectWorkflow(data[0]);
        }
      } catch (error) {
        console.error('Error loading workflows:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflows();
  }, [onSelectWorkflow]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleWorkflowSelect = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    onSelectWorkflow(workflow);
  };

  return (
    <div className="w-full md:w-[66%] lg:w-[69%] xl:w-[73%] bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Loading workflows...</p>
          </div>
        ) : (
          <table className="w-full table-fixed">
            <thead className="bg-white sticky top-0">
              <tr>
                <th style={{ width: `${columnWidths.name}%` }} className="pl-6 pr-3 py-3 text-left text-sm font-semibold text-black">
                  Name
                </th>
                <th style={{ width: `${columnWidths.requiresApproval}%` }} className="px-3 py-3 text-left text-sm font-semibold text-black">
                  Requires Approval
                </th>
                <th style={{ width: `${columnWidths.modified}%` }} className="px-3 py-3 text-left text-sm font-semibold text-black">
                  Modified
                </th>
                <th style={{ width: '60px' }} className="pl-3 pr-6 py-3 text-right">
                  <button>
                    <CirclePlus {...getIconProps()} />
                  </button>
                </th>
              </tr>
              <tr>
                <th colSpan={4} className="px-0 py-0">
                  <div className="mx-6 border-b border-gray-200"></div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {workflows.map((workflow) => (
                <tr 
                  key={workflow.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedWorkflow?.id === workflow.id ? 'bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                  onMouseEnter={() => handleWorkflowSelect(workflow)}
                >
                  <td className="pl-6 pr-3 py-4 text-sm font-medium text-gray-900 truncate">
                    {workflow.name}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-600 truncate">
                    {workflow.requiresApproval}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-600 truncate">
                    {formatDate(workflow.modified)}
                  </td>
                  <td style={{ width: '60px' }} className="pl-3 pr-6 py-4 text-right">
                    <button>
                      <CircleMinus {...getIconProps()} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
