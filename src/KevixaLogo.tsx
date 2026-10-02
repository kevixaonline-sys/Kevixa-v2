import React from 'react';

interface KevixaEmblemProps {
  className?: string;
  size?: number | string;
  color?: string;
}

/**
 * Official Kevixa Favicon & Emblem Icon
 * Accurate representation of the uploaded Kevixa favicon mark (Arrow, Seed/Leaf, Fluid Ribbon K)
 */
export const KevixaEmblem: React.FC<KevixaEmblemProps> = ({
  className = 'w-8 h-8',
  size,
  color = '#0a7268',
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Kevixa Emblem"
    >
      {/* Top Leaf / Seed Droplet */}
      <path
        d="M 256 32 C 280 68 280 102 256 138 C 232 102 232 68 256 32 Z"
        fill={color}
      />

      {/* Left Arrow with Vertical Stem */}
      <path
        d="M 148 54 L 62 186 L 118 186 L 118 316 L 178 316 L 178 186 L 234 186 Z"
        fill={color}
      />

      {/* Dynamic Looping 'K' Ribbon */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 226 218 C 248 162 292 98 376 98 C 442 98 474 138 442 198 C 400 274 300 326 216 358 L 292 464 L 372 464 L 468 464 L 332 308 C 392 268 464 212 488 152 C 516 84 466 48 376 48 C 268 48 214 136 186 206 C 172 240 160 278 140 316 C 122 350 96 384 126 428 C 152 464 200 464 246 432 C 284 406 312 374 340 338 L 296 294 C 274 322 252 346 226 364 C 198 382 176 386 166 366 C 158 350 168 328 184 298 C 200 270 214 242 226 218 Z M 382 142 C 342 142 308 180 276 236 C 330 206 388 174 416 156 C 418 150 412 142 382 142 Z"
        fill={color}
      />

      {/* Lower Leg Depth Accent */}
      <path
        d="M 238 352 L 298 440 L 262 440 L 210 368 C 220 362 228 358 238 352 Z"
        fill={color}
      />
    </svg>
  );
};

interface KevixaLogoProps {
  className?: string;
  variant?: 'horizontal' | 'stacked' | 'emblem-only';
  showSubtitle?: boolean;
  subtitleType?: 'online' | 'cdsco';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Official Kevixa Brand Logo Component
 * Matches the uploaded "Kevixa Logo.png" (Emblem + KEVIXA + .online / CDSCO B2B)
 */
export const KevixaLogo: React.FC<KevixaLogoProps> = ({
  className = '',
  variant = 'horizontal',
  showSubtitle = true,
  subtitleType = 'cdsco',
  size = 'md',
}) => {
  const sizeMap = {
    sm: { emblem: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { emblem: 36, text: 'text-lg', sub: 'text-[10px]' },
    lg: { emblem: 48, text: 'text-2xl', sub: 'text-xs' },
    xl: { emblem: 64, text: 'text-3xl', sub: 'text-sm' },
  };

  const { emblem: emblemSize, text: textClass, sub: subClass } = sizeMap[size];

  if (variant === 'emblem-only') {
    return <KevixaEmblem size={emblemSize} className={className} />;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <KevixaEmblem size={emblemSize * 1.5} className="mb-2" />
        <span
          className={`font-['Plus_Jakarta_Sans'] font-extrabold tracking-widest text-[#0a7268] leading-none ${
            size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl' : 'text-xl'
          }`}
        >
          KEVIXA
        </span>
        {showSubtitle && (
          <span
            className={`font-['Plus_Jakarta_Sans'] font-semibold tracking-wide mt-0.5 ${
              subtitleType === 'online'
                ? 'text-[#ab7b2c] font-medium'
                : 'text-[#006c4a] font-bold uppercase tracking-wider'
            } ${subClass}`}
          >
            {subtitleType === 'online' ? '.online' : 'CDSCO B2B'}
          </span>
        )}
      </div>
    );
  }

  // Horizontal variant (default for Header and navbars)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <KevixaEmblem size={emblemSize} className="shrink-0 transition-transform group-hover:scale-105" />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-['Plus_Jakarta_Sans'] font-extrabold tracking-tight text-[#0a7268] ${textClass}`}>
            KEVIXA
          </span>
          {showSubtitle && subtitleType === 'online' && (
            <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[#ab7b2c] text-xs">
              .online
            </span>
          )}
        </div>
        {showSubtitle && subtitleType === 'cdsco' && (
          <span className={`font-['Inter'] font-bold text-[#006c4a] uppercase tracking-wider mt-0.5 ${subClass}`}>
            CDSCO B2B
          </span>
        )}
      </div>
    </div>
  );
};
