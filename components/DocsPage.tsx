'use client';

import { useState, useEffect } from 'react';
import { CirclePlus, CircleMinus } from 'lucide-react';
import { getIconProps } from '@/lib/icon-utils';

interface Document {
  id: string;
  name: string;
  description: string;
  modified: string;
  version: string;
  type: string;
}

interface DocsPageProps {
  onSelectDocument: (doc: Document | null) => void;
}

export default function DocsPage({ onSelectDocument }: DocsPageProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Define column widths (percentages for flexible columns, action is fixed width)
  const columnWidths = {
    name: 56,
    modified: 20,
    version: 10,
    type: 14
  };

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const response = await fetch('/api/docs');
        const data = await response.json();
        setDocuments(data);
        if (data.length > 0) {
          setSelectedDoc(data[0]);
          onSelectDocument(data[0]);
        }
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [onSelectDocument]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFileTypeColor = (type: string) => {
    const typeMap: Record<string, string> = {
      'pdf': 'text-red-600',
      'pptx': 'text-yellow-600',
      'xlsx': 'text-green-600',
      'docx': 'text-blue-600',
      'txt': 'text-gray-600',
      'csv': 'text-green-600'
    };
    return typeMap[type.toLowerCase()] || 'text-gray-800';
  };

  const handleDocSelect = (doc: Document) => {
    setSelectedDoc(doc);
    onSelectDocument(doc);
  };

  return (
    <div className="w-full md:w-[66%] lg:w-[69%] xl:w-[73%] bg-white flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Loading documents...</p>
          </div>
        ) : (
          <table className="w-full table-fixed">
            <thead className="bg-white sticky top-0">
              <tr>
                <th style={{ width: `${columnWidths.name}%` }} className="pl-6 pr-3 py-3 text-left text-sm font-semibold text-black">
                  Name
                </th>
                <th style={{ width: `${columnWidths.modified}%` }} className="px-3 py-3 text-left text-sm font-semibold text-black">
                  Modified
                </th>
                <th style={{ width: `${columnWidths.version}%` }} className="px-3 py-3 text-left text-sm font-semibold text-black">
                  Version
                </th>
                <th style={{ width: `${columnWidths.type}%` }} className="px-3 py-3 text-left text-sm font-semibold text-black">
                  Type
                </th>
                <th style={{ width: '60px' }} className="pl-3 pr-6 py-3 text-right">
                  <button>
                    <CirclePlus {...getIconProps()} />
                  </button>
                </th>
              </tr>
              <tr>
                <th colSpan={5} className="px-0 py-0">
                  <div className="mx-6 border-b border-gray-200"></div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {documents.map((doc) => (
                <tr 
                  key={doc.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedDoc?.id === doc.id ? 'bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                  onMouseEnter={() => handleDocSelect(doc)}
                >
                  <td className="pl-6 pr-3 py-4 text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-600 truncate">
                    {formatDate(doc.modified)}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-600 truncate">
                    {doc.version}
                  </td>
                  <td className="px-3 py-4 text-sm truncate">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 ${getFileTypeColor(doc.type)} uppercase`}>
                      {doc.type}
                    </span>
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
