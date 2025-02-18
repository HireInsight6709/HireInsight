import React from 'react';
import { Paperclip, X } from 'lucide-react';

interface AttachmentsSectionProps {
  document: File | null;
  onChange: (document: File | null) => void;
}

export default function AttachmentsSection({ document, onChange }: AttachmentsSectionProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file); // Set only one file
  };

  const removeDocument = () => {
    onChange(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Upload Job Description</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-center w-full">
          <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-gray-400 rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-50">
            <Paperclip className="h-8 w-8" />
            <span className="mt-2 text-sm">
              {document ? 'Replace file' : 'Upload JD (PDF/DOC)'}
            </span>
            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          </label>
        </div>

        {document && (
          <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
            <div className="flex items-center">
              <Paperclip className="h-5 w-5 text-gray-400" />
              <span className="ml-2 text-sm text-gray-900">{document.name}</span>
            </div>
            <button
              type="button"
              onClick={removeDocument}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
