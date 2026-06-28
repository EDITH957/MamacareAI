'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  children: (activeTabId: string) => ReactNode;
  variant?: 'underline' | 'pills';
}

export function Tabs({
  tabs,
  activeTab: controlledTab,
  onChange,
  children,
  variant = 'underline',
}: TabsProps) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id || '');
  const activeTabId = controlledTab ?? internalTab;

  const handleChange = (tabId: string) => {
    if (!controlledTab) setInternalTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          'flex overflow-x-auto',
          variant === 'underline'
            ? 'border-b border-zinc-200 dark:border-zinc-700'
            : 'gap-1'
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors',
              variant === 'underline'
                ? cn(
                    'border-b-2 px-4 py-3',
                    activeTabId === tab.id
                      ? 'border-pink-600 text-pink-600 dark:border-pink-400 dark:text-pink-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                  )
                : cn(
                    'rounded-lg px-4 py-2',
                    activeTabId === tab.id
                      ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
                      : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                  )
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium dark:bg-zinc-700">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <div>{children(activeTabId)}</div>
    </div>
  );
}
