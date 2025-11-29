import React from 'react';

interface Props {
  history: string[];
  onSelect: (ip: string) => void;
}

const HistoryPane: React.FC<Props> = ({ history, onSelect }) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <h3 className="text-lg font-semibold">History</h3>
      {history.length === 0 ? (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          No lookups yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {history.map((ip) => (
            <li key={ip}>
              <button
                onClick={() => onSelect(ip)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-left font-mono text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
              >
                {ip}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPane;
