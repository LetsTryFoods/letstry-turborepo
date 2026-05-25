'use client';

import React, { useState } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client/react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { BULK_UPSERT_PINCODES, CHECK_PINCODE_SERVICEABILITY } from '@/lib/pincodes/pincodes.query';
import { Search, CheckCircle, XCircle } from 'lucide-react';

interface PincodeInput {
  pincode: string;
  product: string;
  city: string;
  state: string;
  zone: string;
  tat: number;
}

function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [checkServiceability, { data, loading }] = useLazyQuery<{ checkPincodeServiceability: any }>(CHECK_PINCODE_SERVICEABILITY);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) {
      toast.error('Please enter a 6-digit pincode');
      return;
    }
    checkServiceability({ variables: { pincode } });
  };

  const result = data?.checkPincodeServiceability;
  const isAnyDeliverable = result?.smartExpress?.isDeliverable || result?.priority?.isDeliverable;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-[#0C5273]" />
        Quick Pincode Checker
      </h2>
      <form onSubmit={handleCheck} className="flex gap-2 max-w-md mb-6">
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter 6-digit pincode"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C5273]"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#0C5273] text-white px-6 py-2 rounded-md font-medium hover:bg-[#0C5273]/90 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </form>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Location Header */}
          <div className="bg-gray-50 border border-gray-150 p-4 rounded-lg flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-700">
            <div>
              <span className="font-semibold text-gray-900">Pincode:</span> {pincode}
            </div>
            {isAnyDeliverable && (
              <>
                <div>
                  <span className="font-semibold text-gray-900">City:</span>{' '}
                  {result.smartExpress?.city || result.priority?.city || result.city}
                </div>
                <div>
                  <span className="font-semibold text-gray-900">State:</span>{' '}
                  {result.smartExpress?.state || result.priority?.state || result.state}
                </div>
              </>
            )}
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Smart Express Card */}
            <div
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all hover:shadow-md ${result.smartExpress?.isDeliverable
                ? 'bg-emerald-50/55 border-emerald-200'
                : 'bg-red-50/55 border-red-200'
                }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">B2C SMART EXPRESS</h3>
                    <p className="text-xs text-gray-500">Standard Delivery Service</p>
                  </div>
                  {result.smartExpress?.isDeliverable ? (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Serviceable
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      Not Serviceable
                    </span>
                  )}
                </div>

                {result.smartExpress?.isDeliverable && (
                  <div className="space-y-2 mt-4 text-sm text-gray-700">
                    <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                      <span className="text-gray-500 font-medium">Estimated Delivery:</span>
                      <span className="font-bold text-emerald-800">{result.smartExpress.estimatedDays} days</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                      <span className="text-gray-500 font-medium">Zone:</span>
                      <span className="font-bold text-emerald-800">{result.smartExpress.zone || 'N/A'}</span>
                    </div>
                  </div>
                )}
                {!result.smartExpress?.isDeliverable && (
                  <p className="text-xs text-red-700 mt-4 italic">
                    Smart Express delivery is not serviceable for this pincode.
                  </p>
                )}
              </div>
            </div>

            {/* Priority Card */}
            <div
              className={`p-5 rounded-xl border flex flex-col justify-between transition-all hover:shadow-md ${result.priority?.isDeliverable
                ? 'bg-emerald-50/55 border-emerald-200'
                : 'bg-red-50/55 border-red-200'
                }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">B2C PRIORITY</h3>
                    <p className="text-xs text-gray-500">Expedited Priority Service</p>
                  </div>
                  {result.priority?.isDeliverable ? (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Serviceable
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      Not Serviceable
                    </span>
                  )}
                </div>

                {result.priority?.isDeliverable && (
                  <div className="space-y-2 mt-4 text-sm text-gray-700">
                    <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                      <span className="text-gray-500 font-medium">Estimated Delivery:</span>
                      <span className="font-bold text-emerald-800">{result.priority.estimatedDays} days</span>
                    </div>
                    <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                      <span className="text-gray-500 font-medium">Zone:</span>
                      <span className="font-bold text-emerald-800">{result.priority.zone || 'N/A'}</span>
                    </div>
                  </div>
                )}
                {!result.priority?.isDeliverable && (
                  <p className="text-xs text-red-700 mt-4 italic">
                    Priority delivery is not serviceable for this pincode.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PincodesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<PincodeInput[]>([]);
  const [duplicatePincodes, setDuplicatePincodes] = useState<{ pincode: string, product: string, rows: number[] }[]>([]);

  const [bulkUpsert, { loading }] = useMutation<{ bulkUpsertPincodes: number }>(BULK_UPSERT_PINCODES);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(sheet);

        const mappedData: PincodeInput[] = [];
        const uniqueKeys = new Map<string, number>();
        const duplicatesMap = new Map<string, number[]>();

        jsonData.forEach((row, index) => {
          const pincodeStr = row['DESTINATION PINCODE']?.toString();
          const product = row['PRODUCT']?.toString()?.trim() || '';
          if (!pincodeStr) return; // Skip empty rows

          const trimmedPincode = pincodeStr.trim();
          const key = `${trimmedPincode}-${product}`;

          if (uniqueKeys.has(key)) {
            // Track duplicate
            if (!duplicatesMap.has(key)) {
              duplicatesMap.set(key, [uniqueKeys.get(key)! + 2]); // +2 for 1-based index and header row
            }
            duplicatesMap.get(key)!.push(index + 2);
            return; // Skip duplicate
          }
          uniqueKeys.set(key, index);

          mappedData.push({
            pincode: trimmedPincode,
            product,
            city: row['CITY']?.toString().trim() || '',
            state: row['STATE']?.toString().trim() || '',
            zone: row['ZONE']?.toString().trim() || '',
            tat: parseInt(row['TAT']) || 3,
          });
        });

        const duplicatesArray = Array.from(duplicatesMap.entries()).map(([key, rows]) => {
          const [pincode, product] = key.split('-');
          return { pincode, product, rows };
        });
        setDuplicatePincodes(duplicatesArray);

        setParsedData(mappedData);
        if (duplicatesArray.length > 0) {
          toast.success(`Found ${mappedData.length} unique combinations. ${duplicatesArray.length} entries had duplicates.`);
        } else {
          toast.success(`Successfully parsed ${mappedData.length} entries from file.`);
        }
      } catch (err) {
        toast.error('Failed to parse Excel file. Please check the format.');
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) {
      toast.error('No data to upload');
      return;
    }

    try {
      const { data } = await bulkUpsert({
        variables: { pincodes: parsedData },
      });
      toast.success(`Successfully uploaded ${data?.bulkUpsertPincodes || 0} entries.`);
      setFile(null);
      setParsedData([]);
      const fileInput = document.getElementById('pincode-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      toast.error('Failed to upload pincodes to the server.');
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pincode Serviceability Manager</h1>

      <PincodeChecker />

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            Bulk Upload Pincodes
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload an Excel sheet containing the deliverable pincodes. The sheet must have the following columns:
            <br />
            <strong>PRODUCT, DESTINATION PINCODE, CITY, STATE, ZONE, TAT</strong>
          </p>
          <input
            id="pincode-upload"
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-[#0C5273] file:text-white
              hover:file:bg-[#0C5273]/90"
          />
        </div>

        {parsedData.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium mb-4">
              Ready to upload {parsedData.length} unique records.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleUpload}
                disabled={loading || isProcessing}
                className="bg-[#0C5273] text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload to Database'}
              </button>
            </div>

            {duplicatePincodes.length > 0 && (
              <div className="mt-8 border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <h3 className="text-sm font-bold text-yellow-800 mb-2">Duplicate Pincodes Found ({duplicatePincodes.length})</h3>
                <p className="text-xs text-yellow-700 mb-4">
                  These pincodes appeared multiple times in your Excel sheet. Only the first occurrence of each was kept for uploading.
                </p>
                <div className="max-h-[300px] overflow-y-auto bg-white border border-yellow-100 rounded">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Pincode</th>
                        <th className="px-4 py-2 font-semibold">Product</th>
                        <th className="px-4 py-2 font-semibold">Found on Rows</th>
                      </tr>
                    </thead>
                    <tbody>
                      {duplicatePincodes.map((dup, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-2 font-medium">{dup.pincode}</td>
                          <td className="px-4 py-2">{dup.product}</td>
                          <td className="px-4 py-2 text-gray-600">{dup.rows.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
