import React from 'react';
import { LookupResult } from '../types';

interface Props {
  result: LookupResult | null;
  loading: boolean;
}

const ResultsPanel: React.FC<Props> = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <p>Loading...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Results will appear here after a lookup.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <h3 className="text-xl font-semibold">Lookup Results</h3>
      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">IP</h4>
          <p className="font-mono text-lg">{result.ip}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Version {result.version}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Reverse DNS</h4>
          <p>{result.reverse || 'N/A'}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Geo</h4>
          <p>
            {result.geo.city || 'Unknown'}, {result.geo.region || 'Unknown'}
          </p>
          <p>{result.geo.country || 'Unknown'}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Network</h4>
          <p>ASN: {result.asn || 'Unknown'}</p>
          <p>ISP: {result.isp || 'Unknown'}</p>
        </div>
        <div className="md:col-span-2">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Flags</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {['datacenter', 'proxy', 'vpn', 'tor'].map((key) => {
              const enabled = (result.flags as any)[key];
              return (
                <span
                  key={key}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    enabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                >
                  {key.toUpperCase()}: {enabled ? 'Yes' : 'No'}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;
