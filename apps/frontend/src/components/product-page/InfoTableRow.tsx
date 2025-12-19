import React from 'react';

interface InfoTableRowProps {
  label: string;
  value: string;
}

export const InfoTableRow: React.FC<InfoTableRowProps> = ({ label, value }) => {
  const isHtml = /<[a-z][\s\S]*>/i.test(value);

  return (
    <div className="flex border-b border-gray-200 last:border-b-0">
      <div className="w-1/3 bg-gray-50 p-4 text-sm font-bold text-gray-900 flex-shrink-0">
        {label}
      </div>
      <div className="w-2/3 bg-white p-4 text-sm text-gray-600">
        {isHtml ? (
          <div 
            dangerouslySetInnerHTML={{ __html: value }} 
            className="text-gray-600 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mb-2 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mb-2 [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-2 [&>li]:mb-1" 
          />
        ) : (
          value
        )}
      </div>
    </div>
  );
};
