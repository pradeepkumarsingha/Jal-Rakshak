import React from 'react'

/**
 * Jal Rakshak AI - Official Brand Logo Component
 * Supports multiple variants:
 * - 'horizontal': Emblem + Jal Rakshak Typography + Tagline (ideal for Navbar & Headers)
 * - 'icon': Emblem only (ideal for Avatars, Mobile view, Favicon)
 * - 'full' / 'stacked': Large emblem on top + Typography + Tagline (ideal for Hero, Login, Splash)
 * - 'app-icon': Rounded-square container with deep ocean gradient (ideal for App cards & App Icons)
 * - 'wordmark': Text typography only
 */
export default function JalRakshakLogo({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = true,
  theme = 'light', // 'light' | 'dark'
  onClick,
}) {
  // Size presets
  const sizeMap = {
    xs: { iconSize: 24, height: 28, textClass: 'text-sm', subTextClass: 'text-[8px]' },
    sm: { iconSize: 32, height: 36, textClass: 'text-base', subTextClass: 'text-[9px]' },
    md: { iconSize: 42, height: 46, textClass: 'text-xl', subTextClass: 'text-[10px]' },
    lg: { iconSize: 56, height: 60, textClass: 'text-2xl', subTextClass: 'text-xs' },
    xl: { iconSize: 76, height: 82, textClass: 'text-3xl', subTextClass: 'text-sm' },
    '2xl': { iconSize: 96, height: 104, textClass: 'text-4xl', subTextClass: 'text-base' },
  }

  const currentSize = sizeMap[size] || sizeMap.md
  const isDark = theme === 'dark'

  // Shield Emblem SVG
  const renderEmblem = (dim = currentSize.iconSize) => (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="Jal Rakshak Shield Emblem"
    >
      <defs>
        {/* Shield Border Gradient */}
        <linearGradient id="shieldBorderGrad" x1="15" y1="10" x2="105" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00a8ff" />
          <stop offset="50%" stopColor="#0066cc" />
          <stop offset="100%" stopColor="#003380" />
        </linearGradient>

        {/* Shield Inner Fill */}
        <linearGradient id="shieldInnerGrad" x1="60" y1="14" x2="60" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.4" />
        </linearGradient>

        {/* Water Droplet Gradient */}
        <linearGradient id="dropletGrad" x1="38" y1="36" x2="78" y2="82" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Droplet Highlight */}
        <linearGradient id="dropletHighlight" x1="45" y1="42" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        {/* Leaves Gradient */}
        <linearGradient id="leafGrad" x1="10" y1="45" x2="30" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Bottom Blue Wave Gradient */}
        <linearGradient id="waveBlueGrad" x1="10" y1="88" x2="110" y2="102" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        {/* Bottom Green Ribbon Gradient */}
        <linearGradient id="waveGreenGrad" x1="15" y1="96" x2="105" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Shadow Filter */}
        <filter id="emblemShadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0284c7" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Main Shield Outline */}
      <g filter="url(#emblemShadow)">
        {/* Outer Hexagonal Shield */}
        <path
          d="M60 8 L98 22 C98 22 102 60 98 72 C94 84 76 98 60 106 C44 98 26 84 22 72 C18 60 22 22 22 22 L60 8 Z"
          fill="url(#shieldInnerGrad)"
          stroke="url(#shieldBorderGrad)"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />

        {/* Inner Shield Accent Contour */}
        <path
          d="M60 15 L92 27 C92 27 95 58 92 68 C88 78 73 91 60 98 C47 91 32 78 28 68 C25 58 28 27 28 27 L60 15 Z"
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.2"
          strokeOpacity="0.35"
        />

        {/* Radar / Wireless Early Warning Waves (Top) */}
        <path
          d="M44 26 C49 22 71 22 76 26"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M49 32 C53 29 67 29 71 32"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M54 37 C56 35 64 35 66 37"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* IoT Circuit Sensor Lines (Left Side) */}
        <path
          d="M32 36 L38 36 L38 48 L32 48"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="36" r="2.2" fill="#0284c7" />
        <circle cx="32" cy="48" r="2.2" fill="#0284c7" />
        <path
          d="M26 42 L34 42"
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="26" cy="42" r="2" fill="#0284c7" />

        {/* IoT Circuit Sensor Lines (Right Side) */}
        <path
          d="M88 36 L82 36 L82 48 L88 48"
          fill="none"
          stroke="#0284c7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="88" cy="36" r="2.2" fill="#0284c7" />
        <circle cx="88" cy="48" r="2.2" fill="#0284c7" />
        <path
          d="M94 42 L86 42"
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="94" cy="42" r="2" fill="#0284c7" />

        {/* Central Water Droplet */}
        <path
          d="M60 38 C60 38 78 60 78 72 C78 82 70 90 60 90 C50 90 42 82 42 72 C42 60 60 38 60 38 Z"
          fill="url(#dropletGrad)"
          stroke="#ffffff"
          strokeWidth="1.8"
        />

        {/* Droplet Glossy Highlight */}
        <path
          d="M50 48 C50 48 46 56 46 64 C46 68 48 72 50 74 C47 71 45 66 45 62 C45 55 50 48 50 48 Z"
          fill="url(#dropletHighlight)"
        />

        {/* Location Pin inside Droplet */}
        <g>
          <path
            d="M60 56 C56 56 53 59 53 63 C53 67.5 60 75 60 75 C60 75 67 67.5 67 63 C67 59 64 56 60 56 Z"
            fill="#ffffff"
          />
          <circle cx="60" cy="62" r="2.6" fill="#0284c7" />
        </g>

        {/* Wave Ripples inside Droplet Base */}
        <path
          d="M46 76 C50 73 54 77 60 74 C66 71 70 75 74 74"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M48 81 C52 79 56 82 60 80 C64 78 68 81 72 80"
          fill="none"
          stroke="#bae6fd"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Green Laurel Leaves (Protection & Ecology - Left side) */}
        {/* Leaf 1 (Top) */}
        <path
          d="M16 48 C14 36 28 34 28 34 C28 34 30 46 16 48 Z"
          fill="url(#leafGrad)"
          stroke="#ffffff"
          strokeWidth="0.8"
        />
        {/* Leaf 2 (Middle) */}
        <path
          d="M10 60 C6 48 22 45 22 45 C22 45 26 58 10 60 Z"
          fill="url(#leafGrad)"
          stroke="#ffffff"
          strokeWidth="0.8"
        />
        {/* Leaf 3 (Bottom) */}
        <path
          d="M18 70 C10 60 26 56 26 56 C26 56 28 68 18 70 Z"
          fill="url(#leafGrad)"
          stroke="#ffffff"
          strokeWidth="0.8"
        />

        {/* Flowing Ocean Wave Ribbons (Bottom Blue) */}
        <path
          d="M12 82 C28 98 52 86 60 92 C68 98 92 88 108 82 C94 100 68 98 60 94 C52 90 28 102 12 82 Z"
          fill="url(#waveBlueGrad)"
        />

        {/* Flowing Green Ribbon (Bottom Accent) */}
        <path
          d="M20 92 C34 105 52 96 60 100 C68 104 86 98 100 92 C88 106 68 106 60 102 C52 98 34 108 20 92 Z"
          fill="url(#waveGreenGrad)"
        />
      </g>
    </svg>
  )

  // App Icon Style (Rounded Square with Ocean Glow)
  if (variant === 'app-icon') {
    return (
      <div
        onClick={onClick}
        className={`relative rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center p-3 transition-transform duration-300 hover:scale-105 ${className}`}
        style={{
          width: currentSize.iconSize * 1.5,
          height: currentSize.iconSize * 1.5,
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 45%, #0f172a 100%)',
          boxShadow: '0 10px 30px -5px rgba(2, 132, 199, 0.45)',
        }}
      >
        <div className="absolute inset-0 bg-radial from-cyan-400/20 via-transparent to-transparent opacity-60 pointer-events-none" />
        {renderEmblem(currentSize.iconSize * 1.1)}
      </div>
    )
  }

  // Icon Only Style
  if (variant === 'icon') {
    return (
      <div onClick={onClick} className={`inline-flex items-center justify-center ${className}`}>
        {renderEmblem(currentSize.iconSize)}
      </div>
    )
  }

  // Full Stacked / Hero Style
  if (variant === 'full' || variant === 'stacked') {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col items-center text-center group cursor-pointer select-none ${className}`}
      >
        <div className="mb-2 relative">
          {renderEmblem(currentSize.iconSize * 1.3)}
        </div>

        {/* Brand Typography */}
        <div className="flex flex-col items-center">
          <div className="flex items-baseline gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight ${
                isDark ? 'text-cyan-400' : 'text-sky-600'
              } ${currentSize.textClass}`}
              style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
            >
              Jal
            </span>
            <span
              className={`font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              } ${currentSize.textClass}`}
              style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
            >
              Rakshak
            </span>
            <span className="text-[10px] font-extrabold uppercase bg-brand-500/10 text-brand-600 dark:text-cyan-400 px-1.5 py-0.5 rounded border border-brand-500/20 ml-1">
              AI
            </span>
          </div>

          {showTagline && (
            <div className="mt-2 flex flex-col items-center">
              {/* Divider line with taglines */}
              <div className="flex items-center gap-2 w-full justify-center">
                <span className="h-[1.5px] w-6 bg-gradient-to-r from-transparent to-emerald-500 rounded" />
                <span
                  className={`font-extrabold tracking-widest uppercase ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  } ${currentSize.subTextClass}`}
                >
                  PREDICT. PROTECT. RESPOND.
                </span>
                <span className="h-[1.5px] w-6 bg-gradient-to-l from-transparent to-brand-500 rounded" />
              </div>
              <span
                className={`text-[9px] font-bold tracking-wider uppercase mt-0.5 ${
                  isDark ? 'text-cyan-400/80' : 'text-brand-600/80'
                }`}
              >
                AI-POWERED FLOOD INTELLIGENCE
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Wordmark Only
  if (variant === 'wordmark') {
    return (
      <div onClick={onClick} className={`inline-flex items-baseline gap-1.5 ${className}`}>
        <span
          className={`font-black tracking-tight ${
            isDark ? 'text-cyan-400' : 'text-sky-600'
          } ${currentSize.textClass}`}
          style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
        >
          Jal
        </span>
        <span
          className={`font-black tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          } ${currentSize.textClass}`}
          style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
        >
          Rakshak
        </span>
        <span className="text-[10px] font-extrabold uppercase bg-brand-500/10 text-brand-600 dark:text-cyan-400 px-1.5 py-0.5 rounded border border-brand-500/20 ml-1">
          AI
        </span>
      </div>
    )
  }

  // Default: Horizontal Variant (Logo Emblem + Jal Rakshak Typography)
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 group select-none ${className}`}
    >
      {/* Shield Emblem */}
      <div className="relative shrink-0 flex items-center justify-center">
        {renderEmblem(currentSize.iconSize)}
      </div>

      {/* Typography */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1 leading-tight">
          <span
            className={`font-black tracking-tight ${
              isDark ? 'text-cyan-400' : 'text-sky-600'
            } ${currentSize.textClass}`}
            style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
          >
            Jal
          </span>
          <span
            className={`font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            } ${currentSize.textClass}`}
            style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
          >
            Rakshak
          </span>
          <span className="text-[9px] font-black uppercase bg-gradient-to-r from-brand-600 to-cyan-500 text-white px-1.5 py-0.5 rounded shadow-xs ml-1">
            AI
          </span>
        </div>

        {showTagline && (
          <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
            <span
              className={`font-extrabold tracking-wider uppercase text-[9px] ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              PREDICT • PROTECT • RESPOND
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
