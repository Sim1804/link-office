const fs = require('fs');

const targetPath = 'd:\\Projects\\link-office\\app\\dashboard\\superadmin\\leads\\page.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add Pagination State
content = content.replace(
  'const [leads, setLeads] = useState<Lead[]>([]);',
  'const [leads, setLeads] = useState<Lead[]>([]);\n  const [currentPage, setCurrentPage] = useState(1);\n  const ITEMS_PER_PAGE = 20;'
);

// 2. Reset Pagination when Tab changes
content = content.replace(
  'onClick={() => setActiveTab(key)}',
  'onClick={() => { setActiveTab(key); setCurrentPage(1); }}'
);

// 3. Setup Paginated Array right before return
content = content.replace(
  'const convertedLeads = leads.filter(l => l.status === "CONVERTED");',
  `const convertedLeads = leads.filter(l => l.status === "CONVERTED");\n\n  const currentLeads = activeTab === "pending" ? pendingLeads : convertedLeads;\n  const totalPages = Math.ceil(currentLeads.length / ITEMS_PER_PAGE);\n  const paginatedLeads = currentLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);`
);

// 4. Create standard pagination component
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

// 5. Replace pending table style
content = content.replace(
  '<div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 16, border: "1px solid var(--surface)", overflow: "hidden" }}>',
  '<div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>'
);
content = content.replace(
  '<tr style={{ background: "rgba(30,41,59,0.8)", borderBottom: "1px solid var(--surface)" }}>',
  '<tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>'
);
content = content.replaceAll(
  'color: "var(--text-2)", fontWeight: 600, fontSize: 13, textTransform: "uppercase"',
  'color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em"'
);

// Map over paginatedLeads instead of pendingLeads
content = content.replace(
  '{pendingLeads.map(lead => (',
  '{paginatedLeads.map(lead => ('
);

// Tr styling
content = content.replace(
  '<tr key={lead.id} style={{ borderBottom: "1px solid var(--surface)" }}>',
  '<tr key={lead.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="table-row-hover">'
);

// Table 2 (converted)
content = content.replace(
  '<div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 16, border: "1px solid var(--surface)", overflow: "hidden" }}>',
  '<div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>'
);
content = content.replace(
  '<tr style={{ background: "rgba(30,41,59,0.8)", borderBottom: "1px solid var(--surface)" }}>',
  '<tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>'
);

// Map over paginatedLeads instead of convertedLeads
content = content.replace(
  '{convertedLeads.map(lead => (',
  '{paginatedLeads.map(lead => ('
);

// Tr styling 2
content = content.replace(
  '<tr key={lead.id} style={{ borderBottom: "1px solid var(--surface)" }}>',
  '<tr key={lead.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="table-row-hover">'
);

// Append pagination after table closing tags
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

fs.writeFileSync(targetPath, content);
console.log("Success");
