import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'badge' | 'circle' | 'mark-only' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

/**
 * Pure Vector SVG Constellation/Knot Emblem of LINK OFFICE
 * Seamlessly adapts stroke colors to background for perfect blending
 */
export const ConstellationMark: React.FC<{ 
  size?: number; 
  variant?: 'light' | 'dark' | 'white'; 
  className?: string 
}> = ({
  size = 40,
  variant = 'light',
  className = ''
}) => {
  const strokeColor = (variant === 'dark' || variant === 'white') ? '#E3EBE6' : '#123D46';
  const dotColor = '#00A99D';
  const centerDotColor = '#FFC629';

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="340 115 585 510" 
      width={size} 
      height={(size * 510) / 585}
      className={`shrink-0 select-none overflow-visible ${className}`}
      aria-hidden="true"
    >
      <g fill="none" stroke={strokeColor} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        {/* Pétales extérieurs */}
        <path d="M 574 464 C 516 434 461 389 444 342 C 421 277 458 229 499 186 C 526 157 548 138 560 125 C 579 147 604 169 613 204 C 629 265 596 293 564 323 C 537 348 540 389 574 464 Z"/>
        <path d="M 690 464 C 748 434 803 389 820 342 C 843 277 806 229 765 186 C 738 157 716 138 704 125 C 685 147 660 169 651 204 C 635 265 668 293 700 323 C 727 348 724 389 690 464 Z"/>
        {/* Pétales intérieurs */}
        <path d="M 574 464 C 532 416 502 375 500 325 C 498 261 535 190 560 125 C 581 145 610 177 616 211 C 629 270 598 294 566 325 C 539 351 538 392 574 464 Z"/>
        <path d="M 690 464 C 732 416 762 375 764 325 C 766 261 729 190 704 125 C 683 145 654 177 648 211 C 635 270 666 294 698 325 C 725 351 726 392 690 464 Z"/>
        {/* Lignes organiques centrales */}
        <path d="M 547 337 C 552 385 579 420 606 441 C 595 399 603 355 625 318 C 644 286 670 267 700 254"/>
        <path d="M 547 337 C 566 309 592 291 606 265 C 626 228 612 173 560 125"/>
        <path d="M 700 254 C 674 280 656 300 649 326 C 637 371 660 407 690 464"/>
        <path d="M 547 337 C 535 377 555 422 574 464"/>
        {/* Feuilles inférieures gauche et droite */}
        <path d="M 574 464 C 522 447 472 416 425 424 C 372 433 350 492 350 616 C 405 620 450 606 474 575 C 498 544 479 501 511 480 C 529 468 551 464 574 464 Z"/>
        <path d="M 690 464 C 742 447 792 416 839 424 C 892 433 914 492 914 616 C 859 620 814 606 790 575 C 766 544 785 501 753 480 C 735 468 713 464 690 464 Z"/>
        <path d="M 399 553 C 425 512 461 486 502 473 C 544 460 588 462 632 470 C 675 462 719 460 761 473 C 802 486 838 512 865 553"/>
        <path d="M 574 464 C 611 483 632 520 632 564 C 632 520 653 483 690 464"/>
      </g>
      <g fill={dotColor}>
        <circle cx="547" cy="337" r="22"/>
        <circle cx="700" cy="254" r="22"/>
        <circle cx="414" cy="449" r="22"/>
        <circle cx="428" cy="514" r="22"/>
        <circle cx="850" cy="449" r="22"/>
        <circle cx="836" cy="514" r="22"/>
      </g>
      <circle cx="632" cy="453" r="29" fill={centerDotColor}/>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showTagline = false,
  className = ''
}) => {
  const isDark = variant === 'dark' || variant === 'badge';
  const isWhite = variant === 'white';
  const markVariant: 'light' | 'dark' | 'white' = isWhite ? 'white' : isDark ? 'dark' : 'light';

  const markSizes = {
    sm: 32,
    md: 42,
    lg: 54,
    xl: 68
  };

  const titleSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl'
  };

  const taglineSizes = {
    sm: 'text-[7.5px] sm:text-[8.5px] tracking-[0.22em]',
    md: 'text-[9px] sm:text-[10px] tracking-[0.26em]',
    lg: 'text-[11px] sm:text-[12px] tracking-[0.30em]',
    xl: 'text-[13px] sm:text-[14px] tracking-[0.34em]'
  };

  if (variant === 'circle') {
    return (
      <div className={`flex flex-col items-center justify-center p-4 rounded-full bg-[#123D46] shadow-md border border-[#199E9A]/30 aspect-square w-28 h-28 ${className}`}>
        <ConstellationMark size={36} variant="dark" />
        <div className="mt-1 text-center leading-tight">
          <span className="font-jakarta font-black text-white tracking-tight text-xs block">
            LINK <span className="text-[#00A99D]">OFFICE</span>
          </span>
          <span className="font-jakarta font-medium text-[#4DBDB2] text-[7px] tracking-[0.22em] block">
            LABORATOIRE DU LIEN
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'mark-only') {
    return <ConstellationMark size={markSizes[size]} variant={markVariant} className={className} />;
  }

  const textColor = isWhite ? 'text-white' : isDark ? 'text-[#F4F1E8]' : 'text-[#123D46]';
  const accentColor = isWhite ? 'text-[#4DBDB2]' : isDark ? 'text-[#4DBDB2]' : 'text-[#00A99D]';
  const taglineColor = isWhite ? 'text-[#E3EBE6]/80' : isDark ? 'text-[#FFC629]' : 'text-[#4DBDB2]';

  const content = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      <ConstellationMark size={markSizes[size]} variant={markVariant} />
      <div className="flex flex-col justify-center leading-none">
        <span className={`font-jakarta font-extrabold ${titleSizes[size]} tracking-tight ${textColor} whitespace-nowrap`}>
          LINK <span className={`font-bold ${accentColor}`}>OFFICE</span>
        </span>
        {showTagline && (
          <span className={`font-jakarta font-bold uppercase ${taglineSizes[size]} ${taglineColor} mt-0.5 whitespace-nowrap`}>
            Laboratoire du lien humain
          </span>
        )}
      </div>
    </div>
  );

  if (variant === 'badge') {
    return (
      <div className="px-5 py-3 rounded-2xl bg-[#123D46] text-white shadow-lg border border-[#199E9A]/20 inline-block">
        {content}
      </div>
    );
  }

  return content;
};
