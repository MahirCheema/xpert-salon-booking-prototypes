import fs from 'fs';
import path from 'path';

function updateFile(relativePath, transformer) {
  const filePath = path.resolve(relativePath);
  const oldContent = fs.readFileSync(filePath, 'utf8');
  const newContent = transformer(oldContent);
  if (oldContent !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${relativePath}`);
  } else {
    console.log(`No changes for ${relativePath}`);
  }
}

// 1. Card.tsx: add dark mode support
updateFile('src/components/ui/Card/Card.tsx', (c) => {
  return c.replace(
    `'rounded-2xl border border-secondary-200 bg-white p-6 shadow-xs transition-all'`,
    `'rounded-2xl border border-secondary-200 bg-white p-6 shadow-xs transition-all dark:bg-[#181820] dark:border-[#272733] dark:text-white'`
  ).replace(
    `'text-xl font-bold text-secondary-900'`,
    `'text-xl font-bold text-secondary-900 dark:text-white'`
  ).replace(
    `'text-sm text-secondary-500'`,
    `'text-sm text-secondary-500 dark:text-slate-400'`
  );
});

// 2. PageHeader.tsx: add dark mode support
updateFile('src/components/layout/PageHeader.tsx', (c) => {
  return c.replace(
    `'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-secondary-200'`,
    `'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-secondary-200 dark:border-[#272733]'`
  ).replace(
    `'text-2xl font-bold tracking-tight text-secondary-900 sm:text-3xl'`,
    `'text-2xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-3xl'`
  ).replace(
    `'mt-1 max-w-2xl text-sm text-secondary-500'`,
    `'mt-1 max-w-2xl text-sm text-secondary-500 dark:text-slate-400'`
  ).replace(
    `'mb-1 text-xs font-semibold uppercase tracking-wider text-primary-600'`,
    `'mb-1 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-purple-400'`
  );
});

// 3. ResponsiveAppShell.tsx: Global isDark state and toggle
updateFile('src/components/layout/ResponsiveAppShell.tsx', (c) => {
  let updated = c;
  updated = updated.replace(
    `export function ResponsiveAppShell({
  store,
  currentSlug,
  onSelectClient,
  activeTab,
  onSelectTab,
  children,
  isStandalone = false,
}: ResponsiveAppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDashboard = activeTab === 'dashboard';

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-200 selection:bg-purple-500 selection:text-white",
      isDashboard ? "bg-[#0e0e13] text-slate-100" : "bg-slate-50 text-secondary-900"
    )}>`,
    `export function ResponsiveAppShell({
  store,
  currentSlug,
  onSelectClient,
  activeTab,
  onSelectTab,
  children,
  isStandalone = false,
}: ResponsiveAppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true); // GLOWBOARD dark executive theme by default

  const handleToggleDark = () => setIsDark((prev) => !prev);

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-200 selection:bg-purple-500 selection:text-white",
      isDark ? "dark bg-[#0e0e13] text-slate-100" : "bg-slate-50 text-secondary-900"
    )}>`
  );

  updated = updated.replace(
    `isDark={isDashboard}`,
    `isDark={isDark}`
  );
  updated = updated.replace(
    `isDark={isDashboard}`,
    `isDark={isDark}`
  );
  updated = updated.replace(
    `isDark={isDashboard}`,
    `isDark={isDark}\n          onToggleDark={handleToggleDark}`
  );

  return updated;
});

// 4. Topbar.tsx: Support onToggleDark and dark/light button
updateFile('src/components/layout/Topbar.tsx', (c) => {
  let updated = c;
  if (!updated.includes('onToggleDark?: () => void;')) {
    updated = updated.replace(
      `isDark?: boolean;\n}`,
      `isDark?: boolean;\n  onToggleDark?: () => void;\n}`
    );
  }
  if (!updated.includes('onToggleDark,')) {
    updated = updated.replace(
      `isDark = false,\n}: TopbarProps) {`,
      `isDark = false,\n  onToggleDark,\n}: TopbarProps) {`
    );
  }

  // Ensure Moon and Sun are imported
  if (!updated.includes('Moon,')) {
    updated = updated.replace(
      `import {\n  Menu,`,
      `import {\n  Menu,\n  Moon,\n  Sun,`
    );
  }

  // Add theme toggle button in Topbar
  const targetBtn = `{/* Notification Button */}`;
  const themeToggleCode = `{/* Theme Toggle: Dark / Light */}
          {onToggleDark && (
            <button
              type="button"
              onClick={onToggleDark}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold shadow-2xs transition-colors cursor-pointer",
                isDark
                  ? "border-[#323244] bg-[#1a1a24] text-purple-300 hover:bg-[#232330]"
                  : "border-secondary-300 bg-white text-secondary-800 hover:bg-secondary-50"
              )}
              title="Toggle theme (Dark / Light)"
            >
              {isDark ? (
                <>
                  <Moon className="h-3.5 w-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>
          )}

          {/* Notification Button */}`;

  if (!updated.includes('onToggleDark && (')) {
    updated = updated.replace(targetBtn, themeToggleCode);
  }

  return updated;
});

// 5. AppointmentsView.tsx: add dark table & filter styles
updateFile('src/components/views/AppointmentsView.tsx', (c) => {
  let updated = c;
  // Dark styles for filter buttons
  updated = updated.replace(
    `'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 border-transparent'`,
    `'text-secondary-600 dark:text-slate-400 hover:bg-secondary-50 dark:hover:bg-[#222230] hover:text-secondary-900 dark:hover:text-white border-transparent'`
  );
  // Dark styles for search input
  updated = updated.replace(
    `className="w-full pl-9 pr-4 py-2 border border-secondary-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"`,
    `className="w-full pl-9 pr-4 py-2 border border-secondary-300 dark:border-[#323244] dark:bg-[#1a1a24] dark:text-white rounded-xl text-xs focus:ring-2 focus:ring-primary-500"`
  );
  // Dark styles for table
  updated = updated.replace(
    `className="bg-secondary-50 border-b border-secondary-200 text-secondary-600 font-semibold uppercase tracking-wider text-[11px]"`,
    `className="bg-secondary-50 dark:bg-[#1c1c28] border-b border-secondary-200 dark:border-[#272733] text-secondary-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]"`
  );
  updated = updated.replace(
    `className="divide-y divide-secondary-100"`,
    `className="divide-y divide-secondary-100 dark:divide-[#272733]"`
  );
  updated = updated.replace(
    `className="hover:bg-secondary-50/60 transition-colors"`,
    `className="hover:bg-secondary-50/60 dark:hover:bg-[#20202d] transition-colors"`
  );
  return updated;
});

// 6. ClientsView.tsx: add dark table & search styles
updateFile('src/components/views/ClientsView.tsx', (c) => {
  let updated = c;
  updated = updated.replace(
    `className="w-full pl-9 pr-4 py-2 border border-secondary-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"`,
    `className="w-full pl-9 pr-4 py-2 border border-secondary-300 dark:border-[#323244] dark:bg-[#1a1a24] dark:text-white rounded-xl text-xs focus:ring-2 focus:ring-primary-500"`
  );
  updated = updated.replace(
    `className="bg-secondary-50 border-b border-secondary-200 text-secondary-600 font-semibold uppercase tracking-wider text-[11px]"`,
    `className="bg-secondary-50 dark:bg-[#1c1c28] border-b border-secondary-200 dark:border-[#272733] text-secondary-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]"`
  );
  updated = updated.replace(
    `className="divide-y divide-secondary-100"`,
    `className="divide-y divide-secondary-100 dark:divide-[#272733]"`
  );
  return updated;
});

// 7. WalkInView.tsx: add dark table styles
updateFile('src/components/views/WalkInView.tsx', (c) => {
  let updated = c;
  updated = updated.replace(
    `className="bg-secondary-50 border-b border-secondary-200 text-secondary-600 font-semibold uppercase tracking-wider text-[11px]"`,
    `className="bg-secondary-50 dark:bg-[#1c1c28] border-b border-secondary-200 dark:border-[#272733] text-secondary-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]"`
  );
  updated = updated.replace(
    `className="divide-y divide-secondary-100"`,
    `className="divide-y divide-secondary-100 dark:divide-[#272733]"`
  );
  return updated;
});

