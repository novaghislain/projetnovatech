const fs = require('fs');
const path = require('path');

const files = [
  'administration/Alertes.jsx',
  'administration/Audit.jsx',
  'administration/Employes.jsx',
  'commercial/Clients.jsx',
  'commercial/Creances.jsx',
  'commercial/Facturation.jsx',
  'commercial/Ventes.jsx',
  'finances/Banque.jsx',
  'finances/Caisse.jsx',
  'operations/Commandes.jsx',
  'operations/Livraisons.jsx',
  'operations/Stock.jsx'
];

const basePath = 'c:/xampp/htdocs/Formation Nova/projetnovatech/frontend/src/pages/LFD';

files.forEach(f => {
  const filePath = path.join(basePath, f);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Matches {arrayName.map((varName) => (
  // Or {arrayName.map(varName => (
  // We need to exclude ActivityFeed, AlertZone, CashChart, SalesChart because they don't have searchTerm, but they are not in our files list anyway.
  
  const regex = /\{(\w+)\.map\(\((.*?)\) => \(/g;
  
  // Note: if arrayName is 'alertes', 'audit', 'employes', 'clients', 'creances', 'factures', 'ventes', 'banque', 'caisse', 'commandes', 'livraisons', 'stock'
  const validArrays = ['alertes', 'audit', 'employes', 'clients', 'creances', 'factures', 'ventes', 'banque', 'caisse', 'commandes', 'livraisons', 'stock'];
  
  content = content.replace(regex, (match, arrayName, varName) => {
    if (validArrays.includes(arrayName)) {
      return \{\.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes((searchTerm || '').toLowerCase()))).map((\) => (\;
    }
    return match;
  });

  // some files might not have parenthesis around the variable in .map(var => (
  const regex2 = /\{(\w+)\.map\((\w+) => \(/g;
  content = content.replace(regex2, (match, arrayName, varName) => {
    if (validArrays.includes(arrayName)) {
      return \{\.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes((searchTerm || '').toLowerCase()))).map((\) => (\;
    }
    return match;
  });

  fs.writeFileSync(filePath, content);
  console.log('Fixed', f);
});
