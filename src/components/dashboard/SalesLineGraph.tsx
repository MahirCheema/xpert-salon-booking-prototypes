import { useState, useId } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SalesPoint {
  month: string;
  monthNl: string;
  value: number; // e.g. 16847
  formatted: string;
}

const DEFAULT_SALES_DATA: SalesPoint[] = [
  { month: 'Jan', monthNl: 'Jan', value: 9800, formatted: '9,800' },
  { month: 'Feb', monthNl: 'Feb', value: 9200, formatted: '9,200' },
  { month: 'Mar', monthNl: 'Mrt', value: 10400, formatted: '10,400' },
  { month: 'Apr', monthNl: 'Apr', value: 8900, formatted: '8,900' },
  { month: 'May', monthNl: 'Mei', value: 12500, formatted: '12,500' },
  { month: 'Jun', monthNl: 'Jun', value: 16847, formatted: '16,847' }, // Exact match from GLOWBOARD reference!
  { month: 'Jul', monthNl: 'Jul', value: 14200, formatted: '14,200' },
  { month: 'Aug', monthNl: 'Aug', value: 18900, formatted: '18,900' },
  { month: 'Sep', monthNl: 'Sep', value: 13400, formatted: '13,400' },
  { month: 'Oct', monthNl: 'Okt', value: 19100, formatted: '19,100' },
  { month: 'Nov', monthNl: 'Nov', value: 14600, formatted: '14,600' },
  { month: 'Dec', monthNl: 'Dec', value: 15300, formatted: '15,300' },
];

export interface SalesLineGraphProps {
  className?: string;
  data?: SalesPoint[];
  isDark?: boolean;
  title?: string;
  growthBadge?: string;
  maxY?: number;
  gridLevels?: { label: string; yVal: number }[];
  valuePrefix?: string;
  valueSuffix?: string;
}

export function SalesLineGraph({
  className,
  data = DEFAULT_SALES_DATA,
  isDark = false,
  title,
  growthBadge,
  maxY: customMaxY,
  gridLevels: customGridLevels,
  valuePrefix,
  valueSuffix,
}: SalesLineGraphProps) {
  const { locale } = useI18n();
  const gradId = useId();
  const [activeIdx, setActiveIdx] = useState<number>(5); // Jun by default as in reference image!
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');

  // Chart dimensions in SVG user coordinates
  const svgWidth = 820;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 25;
  const padTop = 35;
  const padBottom = 35;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;
  const maxY = customMaxY ?? 20000;
  const minY = 0;

  // Convert data points to SVG coordinates
  const points = data.map((pt, i) => {
    const x = padLeft + (i / (data.length - 1)) * chartWidth;
    const y = padTop + chartHeight - ((pt.value - minY) / (maxY - minY)) * chartHeight;
    return { x, y, ...pt };
  });

  // Calculate smooth cubic Bezier path
  const getSmoothPath = (pts: { x: number; y: number }[]): string => {
    if (pts.length === 0) return '';
    let p = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      p += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return p;
  };

  const linePath = getSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`
    : '';

  const activePoint = points[activeIdx] || points[5];

  // Grid lines
  const defaultGridLevels = [
    { label: '20k', yVal: 20000 },
    { label: '15k', yVal: 15000 },
    { label: '10k', yVal: 10000 },
    { label: '5k', yVal: 5000 },
    { label: '0', yVal: 0 },
  ];
  const gridLevels = customGridLevels || defaultGridLevels;

  const chartColor = isDark ? '#8b5cf6' : 'var(--primary, #2563eb)';

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 sm:p-6 transition-colors',
        isDark
          ? 'bg-[#181820] border-[#272733] text-white'
          : 'bg-white border-secondary-200 text-secondary-900 shadow-xs',
        className
      )}
    >
      {/* Header with Title and Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h3 className={cn('text-base sm:text-lg font-bold', isDark ? 'text-white' : 'text-secondary-900')}>
            {title || (locale === 'nl' ? 'Recente Omzet' : 'Recent Sales')}
          </h3>
          <span className={cn(
            'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full',
            isDark ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30' : 'bg-primary-50 text-primary-700'
          )}>
            <TrendingUp className="h-3 w-3" />
            {growthBadge || '+18.4%'}
          </span>
        </div>

        {/* Timeframe Dropdown */}
        <div className="relative inline-block text-left">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'monthly' | 'weekly' | 'yearly')}
            className={cn(
              'appearance-none text-xs font-semibold rounded-lg px-3 py-1.5 pr-7 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500',
              isDark
                ? 'bg-[#22222d] text-slate-300 border border-[#323242] hover:bg-[#2b2b3a]'
                : 'bg-secondary-50 text-secondary-700 border border-secondary-200 hover:bg-secondary-100'
            )}
          >
            <option value="monthly">{locale === 'nl' ? 'Maandelijks' : 'Monthly'}</option>
            <option value="weekly">{locale === 'nl' ? 'Wekelijks' : 'Weekly'}</option>
            <option value="yearly">{locale === 'nl' ? 'Jaarlijks' : 'Yearly'}</option>
          </select>
          <ChevronDown className={cn(
            'pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5',
            isDark ? 'text-slate-400' : 'text-secondary-500'
          )} />
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id={`salesGlow-${gradId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={isDark ? 0.45 : 0.25} />
              <stop offset="60%" stopColor={chartColor} stopOpacity={isDark ? 0.15 : 0.05} />
              <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
            </linearGradient>
            <filter id={`glow-${gradId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={chartColor} floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {gridLevels.map((lvl) => {
            const y = padTop + chartHeight - ((lvl.yVal - minY) / (maxY - minY)) * chartHeight;
            return (
              <g key={lvl.label}>
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className={cn(
                    'text-[11px] font-mono select-none',
                    isDark ? 'fill-slate-500' : 'fill-secondary-400'
                  )}
                >
                  {lvl.label}
                </text>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke={isDark ? '#262635' : '#f1f5f9'}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Gradient Area Fill */}
          <path d={areaPath} fill={`url(#salesGlow-${gradId})`} />

          {/* Glowing Curved Spline Line */}
          <path
            d={linePath}
            fill="none"
            stroke={chartColor}
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#glow-${gradId})`}
          />

          {/* Vertical Active Guideline */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={padTop - 5}
              x2={activePoint.x}
              y2={padTop + chartHeight}
              stroke={chartColor}
              strokeDasharray="3 3"
              strokeWidth="1.5"
              strokeOpacity={isDark ? 0.8 : 0.6}
            />
          )}

          {/* Active Data Point with Glowing Ring */}
          {activePoint && (
            <g>
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="7"
                fill={chartColor}
                stroke={isDark ? '#181820' : '#ffffff'}
                strokeWidth="2.5"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="3"
                fill="#ffffff"
              />

              {/* Floating Tooltip Pill (16,847 as in reference!) */}
              <g transform={`translate(${activePoint.x}, ${Math.max(16, activePoint.y - 30)})`}>
                <rect
                  x="-32"
                  y="-12"
                  width="64"
                  height="24"
                  rx="7"
                  fill={chartColor}
                  className="shadow-md"
                />
                <polygon
                  points="-4,12 4,12 0,16"
                  fill={chartColor}
                />
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="Inter, sans-serif"
                >
                  {activePoint.formatted}
                </text>
              </g>
            </g>
          )}

          {/* X-Axis Month Labels and Click/Hover Targets */}
          {points.map((pt, idx) => {
            const isSelected = idx === activeIdx;
            const chartColor = isDark ? '#8b5cf6' : 'var(--primary, #2563eb)';

  return (
              <g
                key={pt.month}
                className="cursor-pointer group"
                onClick={() => setActiveIdx(idx)}
                onMouseEnter={() => setActiveIdx(idx)}
              >
                {/* Transparent hit target for easy mouse hover */}
                <rect
                  x={pt.x - chartWidth / (data.length * 2)}
                  y={padTop}
                  width={chartWidth / data.length}
                  height={chartHeight + padBottom}
                  fill="transparent"
                />
                <text
                  x={pt.x}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className={cn(
                    'text-[11px] font-semibold transition-colors duration-150',
                    isSelected
                      ? 'fill-purple-400 font-bold'
                      : isDark
                      ? 'fill-slate-400 group-hover:fill-slate-200'
                      : 'fill-secondary-500 group-hover:fill-secondary-800'
                  )}
                >
                  {locale === 'nl' ? pt.monthNl : pt.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

