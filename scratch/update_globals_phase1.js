const fs = require('fs');

let cssPath = 'd:\\Projects\\link-office\\app\\globals.css';
let content = fs.readFileSync(cssPath, 'utf8');

// 1. Inject design tokens into :root
let rootContent = `:root {
  color-scheme: light;
  
  /* Colors - Core */
  --bg:           #F4F1E8;
  --surface:      #FFFFFF;
  --surface-2:    #E3EBE6;
  --surface-3:    #4DBDB2;
  
  /* Colors - Semantic */
  --primary:      #00A99D;
  --primary-hover:#199E9A;
  --primary-light:#4DBDB2;
  --action:       #5965E8;
  --action-hover: #4a54c4;
  --energy:       #FFC629;
  --deep:         #123D46;
  --success:      #10b981;
  --warning:      #f59e0b;
  --error:        #ef4444;
  --info:         #3b82f6;

  /* Legacy Colors (Keep for backward compatibility) */
  --cyan:         #00A99D;
  --amber:        #FFC629;
  --indigo:       #5965E8;
  
  /* Text */
  --text-1:       #123D46;
  --text-2:       #475569;
  --text-3:       #94a3b8;
  --text-muted:   #cbd5e1;

  /* Borders */
  --border:       rgba(18,61,70,0.1);
  --border-strong:rgba(18,61,70,0.2);

  /* Spacing */
  --space-2:  2px;
  --space-4:  4px;
  --space-6:  6px;
  --space-8:  8px;
  --space-12: 12px;
  --space-16: 16px;
  --space-20: 20px;
  --space-24: 24px;
  --space-32: 32px;
  --space-40: 40px;
  --space-48: 48px;
  --space-64: 64px;
  --space-80: 80px;

  /* Border Radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  24px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(18,61,70,0.05);
  --shadow-md: 0 4px 6px -1px rgba(18,61,70,0.08), 0 2px 4px -1px rgba(18,61,70,0.04);
  --shadow-lg: 0 10px 15px -3px rgba(18,61,70,0.08), 0 4px 6px -2px rgba(18,61,70,0.04);
  --shadow-card: 0 2px 8px rgba(18,61,70,0.06), 0 0 0 1px rgba(18,61,70,0.04);

  /* Typography Sizes */
  --font-xs:  0.75rem;
  --font-sm:  0.875rem;
  --font-md:  1rem;
  --font-lg:  1.125rem;
  --font-xl:  1.25rem;
  --font-2xl: 1.5rem;
  --font-3xl: 1.875rem;
  --font-4xl: 2.25rem;

  /* Typography Weights */
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;
}`;

content = content.replace(/:root\s*\{[^}]+\}/m, rootContent);

// 2. Add loading states and skeleton classes
const skeletonCSS = `
/* ── Skeletons & Loading States ───────────────────────────────────────────── */
.skeleton {
  background: var(--surface-2);
  border-radius: var(--radius-md);
  animation: pulse-skeleton 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse-skeleton {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-48) var(--space-24);
  text-align: center;
  color: var(--text-2);
}
.empty-state-icon {
  color: var(--primary-light);
  margin-bottom: var(--space-16);
}
`;

if (!content.includes('.skeleton {')) {
  content += skeletonCSS;
}

// Write the file
fs.writeFileSync(cssPath, content);
console.log('Successfully injected Design Tokens into globals.css');
