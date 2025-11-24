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
        const response = await fetch('/api/emails/docs_info.json');
        const data = await response.json();
        setDocuments(data);
        if (data.length > 0) {
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
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onMouseEnter={() => onSelectDocument(doc)}
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 uppercase">
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
