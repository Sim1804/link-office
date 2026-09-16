const fs = require('fs');

const targetPath = 'd:\\Projects\\link-office\\app\\dashboard\\superadmin\\leads\\page.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

const oldCode = `      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "rgba(17,24,39,0.5)", padding: 4, borderRadius: 12, width: "fit-content" }}>
        {([
          { key: "pending",   label: \`En attente (\${pendingLeads.length})\` },
          { key: "converted", label: \`Convertis (\${convertedLeads.length})\` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setCurrentPage(1); }}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "none",
              fontSize: 13, fontWeight: 500, fontFamily: "inherit",
              cursor: "pointer", transition: "all 0.2s",
              background: activeTab === key ? "var(--primary, #7c3aed)" : "transparent",
              color: activeTab === key ? "white" : "#94a3b8",
              boxShadow: activeTab === key ? "0 0 16px rgba(124,58,237,0.3)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>`;

const newCode = `      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--surface)", padding: 6, borderRadius: 12, border: "1px solid var(--border)", width: "fit-content" }}>
        {([
          { key: "pending",   label: \`En attente (\${pendingLeads.length})\` },
          { key: "converted", label: \`Convertis (\${convertedLeads.length})\` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setCurrentPage(1); }}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "none",
              fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              cursor: "pointer", transition: "all 0.2s",
              background: activeTab === key ? "var(--primary)" : "transparent",
              color: activeTab === key ? "white" : "var(--text-2)",
              boxShadow: activeTab === key ? "var(--shadow-glow-cyan)" : "none",
            }}
            onMouseOver={(e) => { if (activeTab !== key) e.currentTarget.style.color = "var(--text-1)"; }}
            onMouseOut={(e) => { if (activeTab !== key) e.currentTarget.style.color = "var(--text-2)"; }}
          >
            {label}
          </button>
        ))}
      </div>`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(targetPath, content);
console.log("Tabs fixed");
