import React from 'react';

interface Props {
  onToggle: () => void;
  theme: 'light' | 'dark';
}

const ThemeToggle: React.FC<Props> = ({ onToggle, theme }) => {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
    </button>
  );
};

export default ThemeToggle;
