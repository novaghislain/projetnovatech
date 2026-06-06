const fs = require('fs');
const path = require('path');

function extractComponents(filePath, componentNames, outDir, prefix) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // imports to add
  let imports = `import React, { useState, useEffect } from 'react';\nimport { API_URL } from '../../../config';\nimport { BookOpen, User, Clock, ChevronRight, X, PlayCircle, MessageSquare, Video, Award, AlertCircle, FileText, CheckCircle, Download, Trash2, Edit, Check, Eye } from 'lucide-react';\nimport { useAuth } from '../../../contexts/AuthContext';\n`;

  // We find the starting position of each component
  for (let compName of componentNames) {
    const startStr = `const ${compName} = `;
    const startIdx = content.indexOf(startStr);
    if (startIdx === -1) {
      console.log(`Could not find ${compName} in ${filePath}`);
      continue;
    }

    // Find the end of the component (we assume they end with `};\n` or similar, but the safest way is to find the next component or the default export)
    // Actually, since they are at the bottom, we can just split by `const ` and find the one that matches.

    const parts = content.substring(startIdx).split(/^const /m);
    let compCode = "const " + parts[0]; // parts[0] is the current component

    // Special case for the last one which might have `export default` attached
    let exportIdx = compCode.indexOf('export default');
    if (exportIdx !== -1) {
      compCode = compCode.substring(0, exportIdx).trim();
    }

    // Write the new file
    const newCompName = prefix + compName.replace('Tab', '');
    // Replace the component name in the code
    compCode = compCode.replace(`const ${compName} =`, `const ${newCompName} =`);

    const newFileContent = `${imports}\n${compCode}\n\nexport default ${newCompName};\n`;
    const newFilePath = path.join(outDir, `${newCompName}.jsx`);
    fs.writeFileSync(newFilePath, newFileContent);
    console.log(`Created ${newFilePath}`);

    // Remove from main content
    // Actually, we don't remove here because it's messy. We will just rewrite the main file completely.
  }
}

// 1. Apprenant
// We already did Apprenant manually, but MonEspace.jsx wasn't successfully updated.
let monEspaceContent = fs.readFileSync('/Users/gottinsogbossi/projetnovatech/frontend/src/pages/MonEspace.jsx', 'utf8');
// remove everything from // --- TABS --- downwards
const tabsIdx = monEspaceContent.indexOf('// --- TABS ---');
if (tabsIdx !== -1) {
  let topPart = monEspaceContent.substring(0, tabsIdx);
  // add imports
  const importsToAdd = `
import ApprenantOverview from './Apprenant/ApprenantOverview';
import ApprenantCourses from './Apprenant/ApprenantCourses';
import ApprenantResources from './Apprenant/ApprenantResources';
import ApprenantCertificates from './Apprenant/ApprenantCertificates';
import ApprenantPayments from './Apprenant/ApprenantPayments';
import ApprenantMessages from './Apprenant/ApprenantMessages';
import ApprenantAccount from './Apprenant/ApprenantAccount';
`;
  topPart = topPart.replace("import './Admin/AdminDashboard.css';", "import './Admin/AdminDashboard.css';\n" + importsToAdd);

  // rename components in switch
  topPart = topPart.replace(/<OverviewTab/g, '<ApprenantOverview');
  topPart = topPart.replace(/<CoursesTab/g, '<ApprenantCourses');
  topPart = topPart.replace(/<ResourcesTab/g, '<ApprenantResources');
  topPart = topPart.replace(/<CertificatesTab/g, '<ApprenantCertificates');
  topPart = topPart.replace(/<PaymentsTab/g, '<ApprenantPayments');
  topPart = topPart.replace(/<MessagesTab/g, '<ApprenantMessages');
  topPart = topPart.replace(/<AccountTab/g, '<ApprenantAccount');

  topPart += `\nexport default MonEspace;\n`;
  fs.writeFileSync('/Users/gottinsogbossi/projetnovatech/frontend/src/pages/MonEspace.jsx', topPart);
  console.log("Updated MonEspace.jsx");
}

// 2. Annonceur
const annonceurTabs = ['OverviewTab', 'CoursesTab', 'RevenueTab', 'MarketingTab', 'MessagesTab', 'AccountTab'];
extractComponents('/Users/gottinsogbossi/projetnovatech/frontend/src/pages/AnnonceurDashboard.jsx', annonceurTabs, '/Users/gottinsogbossi/projetnovatech/frontend/src/pages/Annonceur', 'Annonceur');

let annonceurContent = fs.readFileSync('/Users/gottinsogbossi/projetnovatech/frontend/src/pages/AnnonceurDashboard.jsx', 'utf8');
const aTabsIdx = annonceurContent.indexOf('// --- TABS COMPONENTS ---');
if (aTabsIdx !== -1) {
  let topPart = annonceurContent.substring(0, aTabsIdx);
  const importsToAdd = `
import AnnonceurOverview from './Annonceur/AnnonceurOverview';
import AnnonceurCourses from './Annonceur/AnnonceurCourses';
import AnnonceurRevenue from './Annonceur/AnnonceurRevenue';
import AnnonceurMarketing from './Annonceur/AnnonceurMarketing';
import AnnonceurMessages from './Annonceur/AnnonceurMessages';
import AnnonceurAccount from './Annonceur/AnnonceurAccount';
`;
  topPart = topPart.replace("import './Admin/AdminDashboard.css';", "import './Admin/AdminDashboard.css';\n" + importsToAdd);

  topPart = topPart.replace(/<OverviewTab/g, '<AnnonceurOverview');
  topPart = topPart.replace(/<CoursesTab/g, '<AnnonceurCourses');
  topPart = topPart.replace(/<RevenueTab/g, '<AnnonceurRevenue');
  topPart = topPart.replace(/<MarketingTab/g, '<AnnonceurMarketing');
  topPart = topPart.replace(/<MessagesTab/g, '<AnnonceurMessages');
  topPart = topPart.replace(/<AccountTab/g, '<AnnonceurAccount');

  topPart += `\nexport default AnnonceurDashboard;\n`;
  fs.writeFileSync('/Users/gottinsogbossi/projetnovatech/frontend/src/pages/AnnonceurDashboard.jsx', topPart);
  console.log("Updated AnnonceurDashboard.jsx");
}

// 3. Formateur
const formateurTabs = ['OverviewTab', 'CoursesTab', 'StudentsTab', 'MessagesTab', 'AccountTab'];
extractComponents('/Users/gottinsogbossi/projetnovatech/frontend/src/pages/FormateurDashboard.jsx', formateurTabs, '/Users/gottinsogbossi/projetnovatech/frontend/src/pages/Formateur', 'Formateur');

let formateurContent = fs.readFileSync('/Users/gottinsogbossi/projetnovatech/frontend/src/pages/FormateurDashboard.jsx', 'utf8');
const fTabsIdx = formateurContent.indexOf('// --- TABS COMPONENTS ---');
if (fTabsIdx !== -1) {
  let topPart = formateurContent.substring(0, fTabsIdx);
  const importsToAdd = `
import FormateurOverview from './Formateur/FormateurOverview';
import FormateurCourses from './Formateur/FormateurCourses';
import FormateurStudents from './Formateur/FormateurStudents';
import FormateurMessages from './Formateur/FormateurMessages';
import FormateurAccount from './Formateur/FormateurAccount';
`;
  topPart = topPart.replace("import './Admin/AdminDashboard.css';", "import './Admin/AdminDashboard.css';\n" + importsToAdd);

  topPart = topPart.replace(/<OverviewTab/g, '<FormateurOverview');
  topPart = topPart.replace(/<CoursesTab/g, '<FormateurCourses');
  topPart = topPart.replace(/<StudentsTab/g, '<FormateurStudents');
  topPart = topPart.replace(/<MessagesTab/g, '<FormateurMessages');
  topPart = topPart.replace(/<AccountTab/g, '<FormateurAccount');

  topPart += `\nexport default FormateurDashboard;\n`;
  fs.writeFileSync('/Users/gottinsogbossi/projetnovatech/frontend/src/pages/FormateurDashboard.jsx', topPart);
  console.log("Updated FormateurDashboard.jsx");
}

console.log("Refactoring complete.");
