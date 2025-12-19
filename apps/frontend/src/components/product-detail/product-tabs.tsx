"use client";

import { useState } from 'react';

interface ProductTabsProps {
  description: string;
  unit: string;
  flavor: string;
  shelfLife: string;
  dietPreference: string;
  disclaimer: string;
}

export function ProductTabs({
  description,
  unit,
  flavor,
  shelfLife,
  dietPreference,
  disclaimer
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('info');

  const tabs = [
    { id: 'info', label: 'Product Info' },
    { id: 'unit', label: 'Unit' },
    { id: 'flavor', label: 'Flavour' },
    { id: 'shelf-life', label: 'Shelf life' },
    { id: 'diet', label: 'Diet preference' },
    { id: 'disclaimer', label: 'Disclaimer' }
  ];

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden">
      <div className="w-full">
        <div className="overflow-x-auto border-b border-gray-200">
          <div className="w-full h-auto p-0 bg-transparent rounded-none flex justify-start">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-none border-b-2 px-4 py-3 text-sm font-medium flex-shrink-0 transition-all ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-gray-900'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>
          )}

          {activeTab === 'unit' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Unit</h3>
              <p className="text-gray-700">{unit}</p>
            </div>
          )}

          {activeTab === 'flavor' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Flavour</h3>
              <p className="text-gray-700">{flavor}</p>
            </div>
          )}

          {activeTab === 'shelf-life' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Shelf life</h3>
              <p className="text-gray-700">{shelfLife}</p>
            </div>
          )}

          {activeTab === 'diet' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Diet preference</h3>
              <p className="text-gray-700">{dietPreference}</p>
            </div>
          )}

          {activeTab === 'disclaimer' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Disclaimer</h3>
              <p className="text-gray-700 text-sm">{disclaimer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
