const fs = require('fs');

let cssPath = 'd:\\Projects\\link-office\\app\\globals.css';
let content = fs.readFileSync(cssPath, 'utf8');

const inputRegex = /\/\* ── Inputs — Premium upgrade ─────────────────────────────────────────────── \*\/(.*?)\/\* ── Layout ──────────────────────────────────────────────────────────────── \*\//s;

const newInputs = `/* ── Inputs (Link Office Design System) ──────────────────────────────────── */
.input-field {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  padding: var(--space-12) var(--space-16);
  color: var(--text-1);
  font-size: var(--font-sm);
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  box-shadow: 0 1px 2px rgba(18,61,70,0.02);
}
.input-field::placeholder { color: var(--text-3); font-weight: 400; }
.input-field:hover:not(:disabled) { border-color: rgba(18,61,70,0.3); }
.input-field:focus { border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-glow); }
.input-field:disabled { background: rgba(18,61,70,0.02); cursor: not-allowed; opacity: 0.7; }
.input-field.has-icon { padding-left: 44px; }

/* States */
.input-field.is-error {
  border-color: var(--error);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}
.input-field.is-success {
  border-color: var(--success);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

select.input-field {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 16px center; padding-right: 40px;
}
select.input-field option { background-color: var(--surface); color: var(--text-1); }

/* ── Layout ──────────────────────────────────────────────────────────────── */`;

content = content.replace(inputRegex, newInputs);
fs.writeFileSync(cssPath, content);
console.log('Successfully updated input variants in globals.css');
