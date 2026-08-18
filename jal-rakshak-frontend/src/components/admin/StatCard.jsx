import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = 'up',
  trendValue = '+12%',
  color = 'red', // 'red' | 'orange' | 'brand' | 'purple' | 'emerald'
}) {
  const colorMap = {
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', glow: 'shadow-red-500/10' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'shadow-orange-500/10' },
    brand: { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20', glow: 'shadow-brand-500/10' },
    purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-purple-500/10' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-emerald-500/10' },
  }

  const theme = colorMap[color] || colorMap.brand

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border ${theme.border} shadow-lg ${theme.glow} flex flex-col justify-between`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{value}</div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-slate-400">{subtitle}</span>
          {trendValue && (
            <span
              className={`inline-flex items-center gap-0.5 font-bold ${
                trend === 'up'
                  ? 'text-red-400'
                  : trend === 'down'
                  ? 'text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              <span>{trendValue}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
