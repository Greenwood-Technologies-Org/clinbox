'use client';

import { useState, useEffect } from 'react';
import { CirclePlus, CircleMinus, ArrowLeft, Check } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';

interface Workflow {
  id: string;
  name: string;
  description: string;
  modified: string;
  approval: string;
  integrations: string[];
}

interface WorkflowAction {
  id: string;
  action: string;
  input: string;
  output: string;
  description: string;
  approval: string;
}

interface WorkflowSettingsProps {
  onSelectWorkflow: (workflow: Workflow | null) => void;
  onBuilderModeChange?: (isBuilderMode: boolean) => void;
}

export default function WorkflowSettings({ onSelectWorkflow, onBuilderModeChange }: WorkflowSettingsProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [actions, setActions] = useState<WorkflowAction[]>([]);
  const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null);
  const [editingField, setEditingField] = useState<{ actionId: string; field: keyof WorkflowAction } | null>(null);

  // Define column widths (percentages for flexible columns, action is fixed width)
  const columnWidths = {
    name: 55,
    approval: 25,
    modified: 20
  };

  const actionColumnWidths = {
    action: 20,
    input: 12,
    output: 12,
    description: 46,
    approval: 10
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

  const handleActionSelect = (action: WorkflowAction) => {
    setSelectedAction(action);
  };

  const handleAddAction = () => {
    const newAction: WorkflowAction = {
      id: `action-${Date.now()}`,
      action: '',
      input: '',
      output: '',
      description: '',
      approval: ''
    };
    setActions([...actions, newAction]);
    setSelectedAction(newAction);
  };

  const handleUpdateAction = (actionId: string, field: keyof WorkflowAction, value: string) => {
    setActions(actions.map(action => 
      action.id === actionId ? { ...action, [field]: value } : action
    ));
  };

  const handleRemoveAction = (actionId: string) => {
    setActions(actions.filter(action => action.id !== actionId));
    if (selectedAction?.id === actionId) {
      setSelectedAction(null);
    }
  };

  const handleAddWorkflow = () => {
    setShowBuilder(true);
    onBuilderModeChange?.(true);
  };

  const handleBackToSettings = () => {
    setShowBuilder(false);
    setWorkflowName('');
    setIsEditingName(false);
    onBuilderModeChange?.(false);
  };

  const handleSaveWorkflow = () => {
    // For now, just go back to settings
    handleBackToSettings();
  };

  if (showBuilder) {
    return (
      <div className="w-full md:w-[66%] lg:w-[69%] xl:w-[73%] bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3">
          <button onClick={handleBackToSettings} className="hover:bg-gray-100 p-1 rounded">
            <ArrowLeft {...getIconProps()} />
          </button>
          
          {isEditingName ? (
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingName(false);
                }
              }}
              className="text-lg font-medium text-gray-900 text-center outline-none border-b-2 border-blue-500 px-2"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className={`text-lg font-medium px-2 py-1 rounded hover:bg-gray-100 ${
                workflowName ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {workflowName || 'Name'}
            </button>
          )}
          
          <button onClick={handleSaveWorkflow} className="hover:bg-gray-100 p-1 rounded">
            <Check {...getIconProps()} />
          </button>
        </div>

        {/* Builder Content */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full table-fixed">
            <thead className="bg-white sticky top-0">
              <tr>
                <th style={{ width: `${actionColumnWidths.action}%` }} className="pl-6 pr-3 py-3 text-left text-sm font-semibold text-black">
                  Action
                </th>
                <th style={{ width: `${actionColumnWidths.input}%` }} className="px-3 py-3 text-left text-sm font-semibold text-black">
                  Input
                </th>
                <th style={{ width: `${actionColumnWidths.output}%` }} className="px-3 py-3 text-left text-sm font-semibold text-black">
                  Output
                </th>
                <th style={{ width: `${actionColumnWidths.description}%` }} className="px-3 py-3 text-left text-sm font-semibold text-black">
                  Description
                </th>
                <th style={{ width: `${actionColumnWidths.approval}%` }} className="px-3 py-3 text-left text-sm font-semibold text-black">
                  Approval
                </th>
                <th style={{ width: '60px' }} className="pl-3 pr-6 py-3 text-right">
                  <button onClick={handleAddAction}>
                    <CirclePlus {...getIconProps()} />
                  </button>
                </th>
              </tr>
              <tr>
                <th colSpan={6} className="px-0 py-0">
                  <div className="mx-6 border-b border-gray-200"></div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {actions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No actions added yet. Click the + icon to add an action.
                  </td>
                </tr>
              ) : (
                actions.map((action) => (
                  <tr 
                    key={action.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedAction?.id === action.id ? 'bg-gray-100' : 'hover:bg-gray-100'
                    }`}
                    onMouseEnter={() => handleActionSelect(action)}
                  >
                    <td className="pl-6 pr-3 py-4 text-sm text-gray-900 truncate">
                      {editingField?.actionId === action.id && editingField?.field === 'action' ? (
                        <input
                          type="text"
                          value={action.action}
                          onChange={(e) => handleUpdateAction(action.id, 'action', e.target.value)}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingField(null);
                            }
                          }}
                          className="w-full outline-none bg-transparent"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => setEditingField({ actionId: action.id, field: 'action' })}
                          className={`w-full text-left ${
                            action.action ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {action.action || 'Action'}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600 truncate">
                      <select
                        value={action.input}
                        onChange={(e) => handleUpdateAction(action.id, 'input', e.target.value)}
                        className={`w-full outline-none bg-transparent cursor-pointer ${
                          action.input ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        <option value="" disabled>Input</option>
                        <option value="Email" className="text-gray-900">Email</option>
                        <option value="CTMS" className="text-gray-900">CTMS</option>
                        <option value="QuickBooks" className="text-gray-900">QuickBooks</option>
                      </select>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600 truncate">
                      <select
                        value={action.output}
                        onChange={(e) => handleUpdateAction(action.id, 'output', e.target.value)}
                        className={`w-full outline-none bg-transparent cursor-pointer ${
                          action.output ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        <option value="" disabled>Output</option>
                        <option value="Email" className="text-gray-900">Email</option>
                        <option value="CTMS" className="text-gray-900">CTMS</option>
                        <option value="QuickBooks" className="text-gray-900">QuickBooks</option>
                      </select>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600 truncate">
                      {editingField?.actionId === action.id && editingField?.field === 'description' ? (
                        <input
                          type="text"
                          value={action.description}
                          onChange={(e) => handleUpdateAction(action.id, 'description', e.target.value)}
                          onBlur={() => setEditingField(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setEditingField(null);
                            }
                          }}
                          className="w-full outline-none bg-transparent"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => setEditingField({ actionId: action.id, field: 'description' })}
                          className={`w-full text-left ${
                            action.description ? 'text-gray-600' : 'text-gray-400'
                          }`}
                        >
                          {action.description || 'Description'}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-600 truncate">
                      <select
                        value={action.approval}
                        onChange={(e) => handleUpdateAction(action.id, 'approval', e.target.value)}
                        className={`w-full outline-none bg-transparent cursor-pointer ${
                          action.approval ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        <option value="" disabled>Approval</option>
                        <option value="Yes" className="text-gray-900">Yes</option>
                        <option value="No" className="text-gray-900">No</option>
                      </select>
                    </td>
                    <td style={{ width: '60px' }} className="pl-3 pr-6 py-4 text-right">
                      <button onClick={() => handleRemoveAction(action.id)}>
                        <CircleMinus {...getIconProps()} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

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
                <th style={{ width: `${columnWidths.approval}%` }} className="px-3 py-3 text-left text-sm font-semibold text-black">
                  Approval
                </th>
                <th style={{ width: `${columnWidths.modified}%` }} className="px-3 py-3 text-left text-sm font-semibold text-black">
                  Modified
                </th>
                <th style={{ width: '60px' }} className="pl-3 pr-6 py-3 text-right">
                  <button onClick={handleAddWorkflow}>
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
                    {workflow.approval}
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
