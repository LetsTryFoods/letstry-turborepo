import React from 'react';
import { InfoTableRow } from './InfoTableRow';

interface InfoTableProps {
  data: { label: string; value: string }[];
}

export const InfoTable: React.FC<InfoTableProps> = ({ data }) => {
  return (
    <div className="border-t border-gray-200">
      {data.map((item, index) => (
        <InfoTableRow key={index} label={item.label} value={item.value} />
      ))}
    </div>
  );
};
