const fs = require('fs');

function replaceSelect(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add import if not exists
  if (!content.includes('import { Select } from "@/components/ui/Select";')) {
    // Find the last import
    const lastImportIndex = content.lastIndexOf('import ');
    const newlineAfterImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, newlineAfterImport + 1) + 'import { Select } from "@/components/ui/Select";\n' + content.slice(newlineAfterImport + 1);
  }

  for (const rep of replacements) {
    content = content.replace(rep.old, rep.new);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log("Updated", filePath);
  } else {
    console.log("No changes for", filePath);
  }
}

// 1. users/page.tsx
replaceSelect('d:\\Projects\\link-office\\app\\dashboard\\superadmin\\users\\page.tsx', [
  {
    old: `<select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="input-field" style={{ width: 200 }}>
            <option value="ALL">Tous les statuts</option>
            <option value="B2C">Clients Individuels (B2C)</option>
            <option value="ADMINS">Administrateurs (RH/Mutuelle)</option>
          </select>`,
    new: `<Select 
            value={filterRole} 
            onChange={setFilterRole} 
            options={[
              { value: "ALL", label: "Tous les statuts" },
              { value: "B2C", label: "Clients Individuels (B2C)" },
              { value: "ADMINS", label: "Administrateurs (RH/Mutuelle)" }
            ]}
            style={{ width: 200 }} 
          />`
  },
  {
    old: `<select 
                    value={manageUser.subscription} 
                    onChange={(e) => setManageUser({...manageUser, subscription: e.target.value})}
                    className="input-field" style={{ width: "100%" }}
                  >
                    <option value="FREEMIUM">FREEMIUM</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="PREMIUM_PLUS">PREMIUM+</option>
                  </select>`,
    new: `<Select 
                    value={manageUser.subscription} 
                    onChange={(val) => setManageUser({...manageUser, subscription: val})}
                    options={[
                      { value: "FREEMIUM", label: "FREEMIUM" },
                      { value: "PREMIUM", label: "PREMIUM" },
                      { value: "PREMIUM_PLUS", label: "PREMIUM+" }
                    ]}
                    style={{ width: "100%" }}
                  />`
  },
  {
    old: `<select 
                    value={manageUser.role} 
                    onChange={(e) => setManageUser({...manageUser, role: e.target.value})}
                    className="input-field" style={{ width: "100%" }}
                  >
                    <option value="EMPLOYEE">Employé B2B</option>
                    <option value="MEMBER">Adhérent B2B2C</option>
                    <option value="CITIZEN">Citoyen B2G</option>
                    <option value="FREELANCE">Freelance B2C</option>
                    <option value="ADMIN_B2B">Admin RH (B2B)</option>
                    <option value="ADMIN_B2B2C">Admin Mutuelle (B2B2C)</option>
                  </select>`,
    new: `<Select 
                    value={manageUser.role} 
                    onChange={(val) => setManageUser({...manageUser, role: val})}
                    options={[
                      { value: "EMPLOYEE", label: "Employé B2B" },
                      { value: "MEMBER", label: "Adhérent B2B2C" },
                      { value: "CITIZEN", label: "Citoyen B2G" },
                      { value: "FREELANCE", label: "Freelance B2C" },
                      { value: "ADMIN_B2B", label: "Admin RH (B2B)" },
                      { value: "ADMIN_B2B2C", label: "Admin Mutuelle (B2B2C)" }
                    ]}
                    style={{ width: "100%" }}
                  />`
  }
]);

// 2. catalog/page.tsx
replaceSelect('d:\\Projects\\link-office\\app\\dashboard\\superadmin\\catalog\\page.tsx', [
  {
    old: `<select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="input-field"
            style={{ minWidth: 200 }}
          >
            <option value="ALL">Tous les catalogues</option>
            <option value="B2B">Catalogues Entreprises (B2B)</option>
            <option value="B2B2C">Catalogues Mutuelles (B2B2C)</option>
            <option value="B2G">Catalogues Collectivités (B2G)</option>
            <option value="B2C">Catalogues Individuels (B2C)</option>
          </select>`,
    new: `<Select 
            value={filter} 
            onChange={setFilter} 
            options={[
              { value: "ALL", label: "Tous les catalogues" },
              { value: "B2B", label: "Catalogues Entreprises (B2B)" },
              { value: "B2B2C", label: "Catalogues Mutuelles (B2B2C)" },
              { value: "B2G", label: "Catalogues Collectivités (B2G)" },
              { value: "B2C", label: "Catalogues Individuels (B2C)" }
            ]}
            style={{ width: 250 }} 
          />`
  }
]);

// 3. leads/page.tsx
replaceSelect('d:\\Projects\\link-office\\app\\dashboard\\superadmin\\leads\\page.tsx', [
  {
    old: `<select value={campaignOffer} onChange={e => setCampaignOffer(e.target.value as any)} className="input-field" style={{ maxWidth: 300 }}>
                    <option value="PREMIUM">PREMIUM - Parcours Premium classique</option>
                    <option value="PREMIUM_PLUS">PREMIUM+ - Inclut Module Binôme Relationnel</option>
                  </select>`,
    new: `<Select 
                    value={campaignOffer} 
                    onChange={(val) => setCampaignOffer(val as any)}
                    options={[
                      { value: "PREMIUM", label: "PREMIUM - Parcours Premium classique" },
                      { value: "PREMIUM_PLUS", label: "PREMIUM+ - Inclut Module Binôme Relationnel" }
                    ]}
                    style={{ width: 350 }} 
                  />`
  }
]);

// 4. media/page.tsx (the public media page has selects)
replaceSelect('d:\\Projects\\link-office\\app\\media\\page.tsx', [
  {
    old: `<select name="type" defaultValue={typeFilter || ""} className="input-field" style={{ minWidth: 160 }}>
                  <option value="">Tous les formats</option>
                  <option value="ARTICLE">Articles</option>
                  <option value="VIDEO">Vidéos</option>
                  <option value="PODCAST">Podcasts</option>
                </select>`,
    new: `<Select 
                  value={typeFilter || ""} 
                  onChange={(val) => {
                    const url = new URL(window.location.href);
                    if (val) url.searchParams.set("type", val);
                    else url.searchParams.delete("type");
                    window.location.href = url.toString();
                  }}
                  options={[
                    { value: "", label: "Tous les formats" },
                    { value: "ARTICLE", label: "Articles" },
                    { value: "VIDEO", label: "Vidéos" },
                    { value: "PODCAST", label: "Podcasts" }
                  ]}
                  style={{ width: 160 }} 
                />`
  },
  {
    old: `<select name="cat" defaultValue={categoryFilter || ""} className="input-field" style={{ minWidth: 180 }}>
                  <option value="">Toutes les thématiques</option>
                  <option value="SANTE_MENTALE">Santé Mentale</option>
                  <option value="MANAGEMENT">Management & Leadership</option>
                  <option value="QVT">Qualité de Vie au Travail</option>
                  <option value="PREVENTION">Prévention Santé</option>
                </select>`,
    new: `<Select 
                  value={categoryFilter || ""} 
                  onChange={(val) => {
                    const url = new URL(window.location.href);
                    if (val) url.searchParams.set("cat", val);
                    else url.searchParams.delete("cat");
                    window.location.href = url.toString();
                  }}
                  options={[
                    { value: "", label: "Toutes les thématiques" },
                    { value: "SANTE_MENTALE", label: "Santé Mentale" },
                    { value: "MANAGEMENT", label: "Management & Leadership" },
                    { value: "QVT", label: "Qualité de Vie au Travail" },
                    { value: "PREVENTION", label: "Prévention Santé" }
                  ]}
                  style={{ width: 220 }} 
                />`
  }
]);

