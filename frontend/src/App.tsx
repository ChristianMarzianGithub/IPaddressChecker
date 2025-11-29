import React, { useEffect, useMemo, useState } from 'react';
import CurrentIpCard from './components/CurrentIpCard';
import LookupForm from './components/LookupForm';
import HistoryPane from './components/HistoryPane';
import ResultsPanel from './components/ResultsPanel';
import ThemeToggle from './components/ThemeToggle';
import { LookupResult } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const App: React.FC = () => {
  const [currentIp, setCurrentIp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('ip-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  const headers = useMemo(
    () => ({ 'Content-Type': 'application/json' }),
    []
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    fetch(`${API_BASE}/ip`, { headers })
      .then((res) => res.json())
      .then((data) => setCurrentIp(data.ip))
      .catch(() => setError('Unable to detect current IP.'));
  }, [headers]);

  const handleLookup = async (ip: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/lookup?ip=${encodeURIComponent(ip)}`);
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || 'Lookup failed');
      }
      const data: LookupResult = await res.json();
      setResult(data);
      const updated = [data.ip, ...history.filter((entry) => entry !== data.ip)].slice(0, 10);
      setHistory(updated);
      localStorage.setItem('ip-history', JSON.stringify(updated));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (ip: string) => {
    handleLookup(ip);
  };

  const handleThemeToggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">IP Address Checker</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Detect your current IP, lookup any address, and view metadata.
            </p>
          </div>
          <ThemeToggle onToggle={handleThemeToggle} theme={theme} />
        </header>

        <CurrentIpCard ip={currentIp} onLookup={handleLookup} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <LookupForm onLookup={handleLookup} loading={loading} />
            {error && (
              <div className="rounded-md bg-red-100 p-3 text-red-800 dark:bg-red-900 dark:text-red-100">
                {error}
              </div>
            )}
            <ResultsPanel result={result} loading={loading} />
          </div>
          <HistoryPane history={history} onSelect={handleSelectHistory} />
        </div>
      </div>
    </div>
  );
};

export default App;
