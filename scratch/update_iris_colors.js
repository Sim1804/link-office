const fs = require('fs');

let filePath = 'd:\\Projects\\link-office\\src\\components\\iris\\IrisWidget.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Window Background: "var(--surface)" -> "var(--bg)" ONLY for the main widget sidebar container (line ~182)
content = content.replace(/background: "var\(--surface\)", backdropFilter: "blur\(24px\)",/, 'background: "var(--bg)", backdropFilter: "blur(24px)",');

// Floating Button
content = content.replace(/background: "linear-gradient\(135deg, var\(--primary\) 0%, var\(--primary\) 100%\)",/g, 'background: "linear-gradient(135deg, var(--action) 0%, var(--action) 100%)",');
content = content.replace(/boxShadow: "0 8px 32px rgba\(0,169,157, 0\.3\)",/, 'boxShadow: "0 8px 32px rgba(89, 101, 232, 0.3)",');

// Header background
content = content.replace(/background: "rgba\(0,169,157, 0\.03\)",/, 'background: "rgba(89, 101, 232, 0.03)",');

// Logo icon background
content = content.replace(/background: "rgba\(0,169,157, 0\.1\)",/g, 'background: "rgba(89, 101, 232, 0.1)",');
// Logo text & icon colors
content = content.replace(/<Brain size=\{20\} color="var\(--primary\)" \/>/g, '<Brain size={20} color="var(--action)" />');
content = content.replace(/<p style=\{\{ fontSize: 12, color: "var\(--primary\)",/g, '<p style={{ fontSize: 12, color: "var(--action)",');

// Tabs active color
content = content.replace(/color: activeTab === "coach" \? "var\(--primary\)" : "var\(--text-3\)",/g, 'color: activeTab === "coach" ? "var(--action)" : "var(--text-3)",');
content = content.replace(/color: activeTab === "explication" \? "var\(--primary\)" : "var\(--text-3\)",/g, 'color: activeTab === "explication" ? "var(--action)" : "var(--text-3)",');

// Coach chat messages
content = content.replace(/background: msg.sender === "iris" \? "linear-gradient\(135deg, var\(--primary\) 0%, var\(--primary\) 100%\)"/g, 'background: msg.sender === "iris" ? "linear-gradient(135deg, var(--action) 0%, var(--action) 100%)"');
content = content.replace(/background: msg.sender === "user" \? "var\(--surface\)" : "rgba\(0,169,157, 0\.08\)",/g, 'background: msg.sender === "user" ? "var(--surface)" : "rgba(89, 101, 232, 0.08)",');

// Premium CTA & Analyse CTA
content = content.replace(/className="btn btn-primary"/g, 'className="btn btn-action"');

// Loading state in coach
content = content.replace(/background: "rgba\(0,169,157, 0\.08\)", padding: "12px 16px"/g, 'background: "rgba(89, 101, 232, 0.08)", padding: "12px 16px"');
content = content.replace(/background: "var\(--primary\)", borderRadius: "50%", animation: "pulse/g, 'background: "var(--action)", borderRadius: "50%", animation: "pulse');

// Input Area
content = content.replace(/e\.target\.style\.borderColor = "var\(--primary\)"/g, 'e.target.style.borderColor = "var(--action)"');
content = content.replace(/background: input\.trim\(\) && !loading \? "var\(--primary\)" : "var\(--border\)",/g, 'background: input.trim() && !loading ? "var(--action)" : "var(--border)",');


fs.writeFileSync(filePath, content);
console.log('Successfully updated IrisWidget.tsx colors');
