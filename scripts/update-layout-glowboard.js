import fs from 'fs';
import path from 'path';

// 1. Update ResponsiveAppShell.tsx to pass isDark based on activeTab === 'dashboard'
const appShellPath = path.resolve('src/components/layout/ResponsiveAppShell.tsx');
let appShell = fs.readFileSync(appShellPath, 'utf8');

appShell = appShell.replace(
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

  return (
    <div className="min-h-screen bg-slate-50 text-secondary-900 flex flex-col selection:bg-primary-500 selection:text-white">`,
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
    )}>`
);

appShell = appShell.replace(
  `<Sidebar
          store={store}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
        />`,
  `<Sidebar
          store={store}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          isDark={isDashboard}
        />`
);

appShell = appShell.replace(
  `<Sidebar
                store={store}
                activeTab={activeTab}
                onSelectTab={onSelectTab}
                onCloseMobile={() => setMobileOpen(false)}
                className="w-full"
              />`,
  `<Sidebar
                store={store}
                activeTab={activeTab}
                onSelectTab={onSelectTab}
                onCloseMobile={() => setMobileOpen(false)}
                className="w-full"
                isDark={isDashboard}
              />`
);

appShell = appShell.replace(
  `<Topbar
          store={store}
          currentSlug={currentSlug}
          onSelectClient={onSelectClient}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onToggleMobileMenu={() => setMobileOpen(true)}
          isStandalone={isStandalone}
        />`,
  `<Topbar
          store={store}
          currentSlug={currentSlug}
          onSelectClient={onSelectClient}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onToggleMobileMenu={() => setMobileOpen(true)}
          isStandalone={isStandalone}
          isDark={isDashboard}
        />`
);

fs.writeFileSync(appShellPath, appShell, 'utf8');
console.log('Updated ResponsiveAppShell.tsx');

// 2. Update Topbar.tsx to accept isDark
const topbarPath = path.resolve('src/components/layout/Topbar.tsx');
let topbar = fs.readFileSync(topbarPath, 'utf8');

topbar = topbar.replace(
  `export interface TopbarProps {
  store: SalonDataStore;
  currentSlug: string;
  onSelectClient: (slug: string) => void;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onToggleMobileMenu: () => void;
  isStandalone?: boolean;
}`,
  `export interface TopbarProps {
  store: SalonDataStore;
  currentSlug: string;
  onSelectClient: (slug: string) => void;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onToggleMobileMenu: () => void;
  isStandalone?: boolean;
  isDark?: boolean;
}`
);

topbar = topbar.replace(
  `export function Topbar({
  store,
  currentSlug,
  onSelectClient,
  activeTab,
  onSelectTab,
  onToggleMobileMenu,
  isStandalone = false,
}: TopbarProps) {`,
  `export function Topbar({
  store,
  currentSlug,
  onSelectClient,
  activeTab,
  onSelectTab,
  onToggleMobileMenu,
  isStandalone = false,
  isDark = false,
}: TopbarProps) {`
);

topbar = topbar.replace(
  `<header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-secondary-200 bg-white/95 backdrop-blur-md px-4 sm:px-6">`,
  `<header className={cn(
      "sticky top-0 z-30 flex h-16 shrink-0 items-center border-b backdrop-blur-md px-4 sm:px-6 transition-colors duration-200",
      isDark
        ? "border-[#22222d] bg-[#121217]/95 text-white"
        : "border-secondary-200 bg-white/95 text-secondary-900"
    )}>`
);

topbar = topbar.replace(
  `className="rounded-lg border border-secondary-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-secondary-900 shadow-2xs hover:border-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 max-w-[220px] sm:max-w-[280px] truncate"`,
  `className={cn(
                "rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-2xs focus:outline-none max-w-[220px] sm:max-w-[280px] truncate",
                isDark
                  ? "border-[#323244] bg-[#1a1a24] text-white hover:border-[#424258]"
                  : "border-secondary-300 bg-white text-secondary-900 hover:border-secondary-400"
              )}`
);

topbar = topbar.replace(
  `className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-300 bg-white px-2.5 py-1 text-xs font-bold text-secondary-800 shadow-2xs hover:bg-secondary-50 transition-colors"`,
  `className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold shadow-2xs transition-colors",
              isDark
                ? "border-[#323244] bg-[#1a1a24] text-slate-200 hover:bg-[#232330]"
                : "border-secondary-300 bg-white text-secondary-800 hover:bg-secondary-50"
            )}`
);

topbar = topbar.replace(
  `className="shadow-xs font-semibold text-xs py-1.5 px-3"`,
  `className={cn(
              "shadow-xs font-semibold text-xs py-1.5 px-3",
              isDark ? "bg-[#7c3aed] hover:bg-[#6d28d9] text-white" : ""
            )}`
);

fs.writeFileSync(topbarPath, topbar, 'utf8');
console.log('Updated Topbar.tsx');

// 3. Update Sidebar.tsx to accept isDark and style accordingly
const sidebarPath = path.resolve('src/components/layout/Sidebar.tsx');
let sidebar = fs.readFileSync(sidebarPath, 'utf8');

sidebar = sidebar.replace(
  `export interface SidebarProps {
  store: SalonDataStore;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  className?: string;
  onCloseMobile?: () => void;
}`,
  `export interface SidebarProps {
  store: SalonDataStore;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  className?: string;
  onCloseMobile?: () => void;
  isDark?: boolean;
}`
);

sidebar = sidebar.replace(
  `export function Sidebar({
  store,
  activeTab,
  onSelectTab,
  className,
  onCloseMobile,
}: SidebarProps) {`,
  `export function Sidebar({
  store,
  activeTab,
  onSelectTab,
  className,
  onCloseMobile,
  isDark = false,
}: SidebarProps) {`
);

sidebar = sidebar.replace(
  `  const navItemClass = (tab: NavTabId) => {
    const isActive = activeTab === tab;
    return cn(
      'group flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 text-left w-full cursor-pointer',
      isActive
        ? 'bg-primary-50 text-primary-700 font-bold shadow-2xs'
        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
    );
  };`,
  `  const navItemClass = (tab: NavTabId) => {
    const isActive = activeTab === tab;
    if (isDark) {
      return cn(
        'group flex items-center justify-between gap-2.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all duration-150 text-left w-full cursor-pointer',
        isActive
          ? 'bg-[#7c3aed] text-white font-bold shadow-md shadow-purple-900/30'
          : 'text-slate-400 hover:bg-[#1a1a24] hover:text-white'
      );
    }
    return cn(
      'group flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150 text-left w-full cursor-pointer',
      isActive
        ? 'bg-primary-50 text-primary-700 font-bold shadow-2xs'
        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
    );
  };`
);

sidebar = sidebar.replace(
  `    <aside
      className={cn(
        'flex flex-col h-screen max-h-screen bg-white border-r border-secondary-200 select-none overflow-hidden',
        className
      )}
    >`,
  `    <aside
      className={cn(
        'flex flex-col h-full max-h-screen select-none overflow-hidden transition-colors duration-200',
        isDark ? 'bg-[#121217] border-r border-[#22222d]' : 'bg-white border-r border-secondary-200',
        className
      )}
    >`
);

sidebar = sidebar.replace(
  `<div className="shrink-0 border-b border-secondary-200 px-3.5 py-3 bg-secondary-50/40">`,
  `<div className={cn(
        "shrink-0 border-b px-3.5 py-3 transition-colors",
        isDark ? "bg-[#181822] border-[#252535] text-white" : "border-secondary-200 bg-secondary-50/40 text-secondary-900"
      )}>`
);

sidebar = sidebar.replace(
  `<h2 className="truncate text-sm font-bold text-secondary-900 leading-tight">`,
  `<h2 className={cn("truncate text-sm font-bold leading-tight", isDark ? "text-white" : "text-secondary-900")}>`
);

sidebar = sidebar.replace(
  `<div className="shrink-0 border-t border-secondary-200 bg-secondary-50/60 px-3 py-2 text-[11px] text-secondary-500 flex items-center justify-between">`,
  `<div className={cn(
        "shrink-0 border-t px-3 py-2 text-[11px] flex items-center justify-between transition-colors",
        isDark ? "border-[#252535] bg-[#181822] text-slate-400" : "border-secondary-200 bg-secondary-50/60 text-secondary-500"
      )}>`
);

// Add GLOWBOARD feature unlock card inside sidebar
sidebar = sidebar.replace(
  `      </nav>`,
  `        {/* Bottom Feature Card matching GLOWBOARD */}
        <div className={cn(
          "mt-auto p-3 rounded-xl border text-left",
          isDark
            ? "bg-gradient-to-br from-purple-950/40 via-[#181825] to-[#12121c] border-purple-500/20 text-white"
            : "bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-100 text-secondary-900"
        )}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="p-1 rounded-md bg-purple-500/20 text-purple-400">
              <ShieldCheck className="h-3 w-3" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
              {locale === 'nl' ? 'Pro Functies' : 'Pro Suite'}
            </span>
          </div>
          <p className="text-[11px] font-bold leading-tight">
            {locale === 'nl' ? 'Nieuwe functies ontgrendelen' : 'Unlock New Features'}
          </p>
          <p className="text-[9px] opacity-75 mt-0.5 leading-tight">
            {locale === 'nl' ? 'Maximaliseer salon efficiëntie' : '& Maximize Salon Efficiency'}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[9px] opacity-60 underline cursor-pointer">
              {locale === 'nl' ? 'Wat is nieuw?' : "What's New?"}
            </span>
            <button
              type="button"
              onClick={() => handleNavClick('services')}
              className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-600 text-white shadow-xs hover:bg-purple-500 transition-colors cursor-pointer"
            >
              {locale === 'nl' ? 'Upgraden' : 'Upgrade'}
            </button>
          </div>
        </div>
      </nav>`
);

fs.writeFileSync(sidebarPath, sidebar, 'utf8');
console.log('Updated Sidebar.tsx');

