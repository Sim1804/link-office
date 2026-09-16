const fs = require('fs');

const path = 'd:\\Projects\\link-office\\app\\dashboard\\superadmin\\leads\\page.tsx';
let content = fs.readFileSync(path, 'utf8');

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
`;

if (!content.includes('const page = i + 1;')) {
  // We need to inject this right after </table> for both pending and converted
  // Find pending table end
  let pendingTableEnd = content.indexOf('</table>');
  if (pendingTableEnd !== -1) {
    let pendingTableEndClose = content.indexOf(')}', pendingTableEnd) + ')}'.length;
    content = content.substring(0, pendingTableEndClose) + paginationComponent + content.substring(pendingTableEndClose);
  }

  // Find converted table end
  let convertedTableEnd = content.lastIndexOf('</table>');
  if (convertedTableEnd !== -1 && convertedTableEnd !== pendingTableEnd) {
    let convertedTableEndClose = content.indexOf(')}', convertedTableEnd) + ')}'.length;
    content = content.substring(0, convertedTableEndClose) + paginationComponent + content.substring(convertedTableEndClose);
  }
  
  fs.writeFileSync(path, content);
  console.log('Injected pagination successfully!');
} else {
  console.log('Pagination already exists.');
}
