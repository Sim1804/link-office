const fs = require('fs');

let cssPath = 'd:\\Projects\\link-office\\app\\globals.css';
let content = fs.readFileSync(cssPath, 'utf8');

const buttonsRegex = /\/\* ── Buttons \(Premium SaaS UI Kit\) ───────────────────────────────────────── \*\/(.*?)\/\* ── Inputs — Premium upgrade ─────────────────────────────────────────────── \*\//s;

const newButtons = `/* ── Buttons (Link Office Design System) ─────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--space-8);
  font-weight: var(--weight-semibold); border-radius: var(--radius-pill);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer; border: 1px solid transparent; outline: none;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn:focus-visible { box-shadow: 0 0 0 3px rgba(0, 169, 157, 0.3); }

/* Primary (Teal) */
.btn-primary {
  background: var(--primary); color: #fff;
  border-color: var(--primary);
  box-shadow: 0 2px 4px rgba(0, 169, 157, 0.2);
}
.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover); border-color: var(--primary-hover);
  box-shadow: 0 4px 12px rgba(0, 169, 157, 0.3);
  transform: translateY(-1px);
}
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

/* Secondary (Transparent with Teal border/text) */
.btn-secondary {
  background: transparent; color: var(--primary);
  border-color: var(--primary);
}
.btn-secondary:hover:not(:disabled) {
  background: rgba(0, 169, 157, 0.05);
}

/* Tertiary (Soft Gray Border, used for standard actions where teal is too strong) */
.btn-tertiary {
  background: var(--surface); color: var(--text-1);
  border-color: var(--border-strong);
  box-shadow: 0 1px 2px rgba(18,61,70,0.05);
}
.btn-tertiary:hover:not(:disabled) {
  background: rgba(18,61,70,0.02); color: var(--text-1);
  border-color: var(--text-3);
}

/* Ghost (No border) */
.btn-ghost {
  background: transparent; color: var(--text-2);
}
.btn-ghost:hover:not(:disabled) {
  color: var(--primary); background: rgba(0, 169, 157, 0.05);
}

/* Danger */
.btn-danger {
  background: var(--error); color: #fff; border-color: var(--error);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}
.btn-danger:hover:not(:disabled) {
  background: #dc2626; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

/* Action (Violet / Transformation) */
.btn-action {
  background: var(--action); color: #fff; border-color: var(--action);
  box-shadow: 0 2px 4px rgba(89, 101, 232, 0.2);
}
.btn-action:hover:not(:disabled) {
  background: var(--action-hover); box-shadow: 0 4px 12px rgba(89, 101, 232, 0.3);
  transform: translateY(-1px);
}

/* Sizes */
.btn-sm  { padding: var(--space-6) var(--space-16); font-size: var(--font-sm); }
.btn-md  { padding: var(--space-8) var(--space-20); font-size: var(--font-sm); }
.btn-lg  { padding: var(--space-12) var(--space-24); font-size: var(--font-md); }

/* ── Inputs — Premium upgrade ─────────────────────────────────────────────── */`;

content = content.replace(buttonsRegex, newButtons);
fs.writeFileSync(cssPath, content);
console.log('Successfully updated button variants in globals.css');
