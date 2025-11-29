import React, { useState } from 'react';

interface Props {
  onLookup: (ip: string) => void;
  loading: boolean;
}

const ipPattern = /^(?:\d{1,3}\.){3}\d{1,3}$|^[a-fA-F0-9:]+$/;

const LookupForm: React.FC<Props> = ({ onLookup, loading }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipPattern.test(input.trim())) {
      setError('Please enter a valid IPv4 or IPv6 address.');
      return;
    }
    setError('');
    onLookup(input.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter IPv4 or IPv6 address"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          className="min-w-[140px] rounded-md bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:bg-green-300"
          disabled={loading}
        >
          {loading ? 'Looking up...' : 'Lookup IP'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
};

export default LookupForm;
