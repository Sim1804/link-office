const fs = require('fs');

const targetPath = 'd:\\Projects\\link-office\\app\\dashboard\\superadmin\\leads\\page.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

// Colors
content = content.replaceAll('color: "#f8fafc"', 'color: "var(--text-1)"');
content = content.replaceAll('color: "#94a3b8"', 'color: "var(--text-3)"');
content = content.replaceAll('color: "#cbd5e1"', 'color: "var(--text-2)"');
content = content.replaceAll('background: "rgba(15,23,42,0.6)"', 'background: "var(--surface)"');
content = content.replaceAll('border: "1px solid rgba(255,255,255,0.05)"', 'border: "1px solid var(--border)"');
content = content.replaceAll('background: "rgba(30,41,59,0.8)"', 'background: "var(--bg)"');
content = content.replaceAll('borderBottom: "1px solid rgba(255,255,255,0.05)"', 'borderBottom: "1px solid var(--border)"');
content = content.replaceAll('borderBottom: "1px solid rgba(255,255,255,0.03)"', 'borderBottom: "1px solid var(--border)", transition: "background 0.2s"');

// Pagination
if (!content.includes('const [currentPage')) {
  content = content.replace(
    'const [leads, setLeads] = useState<Lead[]>([]);',
    'const [leads, setLeads] = useState<Lead[]>([]);\n  const [currentPage, setCurrentPage] = useState(1);\n  const ITEMS_PER_PAGE = 20;'
  );
}

content = content.replace(
  'onClick={() => setActiveTab(key)}',
  'onClick={() => { setActiveTab(key); setCurrentPage(1); }}'
);

if (!content.includes('const currentLeads =')) {
  content = content.replace(
    'const convertedLeads = leads.filter(l => l.status === "CONVERTED");',
    `const convertedLeads = leads.filter(l => l.status === "CONVERTED");\n\n  const currentLeads = activeTab === "pending" ? pendingLeads : convertedLeads;\n  const totalPages = Math.ceil(currentLeads.length / ITEMS_PER_PAGE);\n  const paginatedLeads = currentLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);`
  );
}

content = content.replace(
  '{pendingLeads.map(lead => (',
  '{paginatedLeads.map(lead => ('
);

content = content.replace(
  '{convertedLeads.map(lead => (',
  '{paginatedLeads.map(lead => ('
);

// Pagination Component
const paginationComponent = `
          {totalPages > 1 && (
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, background: "var(--surface)" }}>
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? "white" : "var(--text-2)",
                      background: isActive ? "var(--primary)" : "transparent",
                      border: isActive ? "none" : "1px solid var(--border)",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = "var(--bg)"; }}
                    onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          )}
        </div>
`;

if (!content.includes('const page = i + 1;')) {
  // pending table closing tag
  content = content.replace(
    '          </table>\n        )}\n      </div>',
    '          </table>\n        )}\n' + paginationComponent
  );

  // converted table closing tag
  content = content.replace(
    '            </table>\n          )}\n        </div>',
    '            </table>\n          )}\n' + paginationComponent.replace('        </div>', '      </div>') // slight indentation fix
  );
}

fs.writeFileSync(targetPath, content);
console.log("Fixed everything!");
