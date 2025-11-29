import React from 'react';

interface Props {
  ip: string;
  onLookup: (ip: string) => void;
}

const CurrentIpCard: React.FC<Props> = ({ ip, onLookup }) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
      <h2 className="text-lg font-semibold">Your current IP</h2>
      <p className="mt-2 text-2xl font-mono">{ip || 'Detecting...'}</p>
      <button
        className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
        onClick={() => ip && onLookup(ip)}
        disabled={!ip}
      >
        Lookup this IP
      </button>
    </div>
  );
};

export default CurrentIpCard;
