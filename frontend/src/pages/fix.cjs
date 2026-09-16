const fs = require('fs');
let code = fs.readFileSync('Inscription.jsx', 'utf8');

// 1. Remove the Steps UI
code = code.replace(/<div className="inscription-steps">[\s\S]*?<\/div>\s*\{step === 1 && \(\s*<div className="fade-in">/, '<div className="fade-in">');

// 2. Change the header text from "Pay before registering" to "Détails de l'inscription"
const titleRegex = /<h2 style=\{\{\s*fontSize:\s*'1\.8rem',\s*color:\s*'var\(--color-primary\)',\s*marginBottom:\s*'1rem',\s*textAlign:\s*'center'\s*\}\}\>[\s\S]*?<\/p>/;
const newTitle = `<h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '1rem', textAlign: 'center' }}>\n                    {language === 'en' ? 'Enrollment Details' : 'Détails de l\\'inscription'}\n                  </h2>`;
code = code.replace(titleRegex, newTitle);

// 3. Extract the Child Info block from Step 2
const childInfoRegex = /<div className="form-section">\s*<h3 style=\{\{ display: 'flex', alignItems: 'center', gap: '0\.5rem', marginBottom: '1rem', color: 'var\(--color-primary\)' \}\}>\s*<User size=\{20\} \/> \{t\('ins_child_info'\)\}[\s\S]*?<\/div>/;
const childInfoMatch = code.match(childInfoRegex);

if (childInfoMatch) {
  let childInfoBlock = childInfoMatch[0];
  
  // Replace the translation keys directly
  childInfoBlock = childInfoBlock.replace(/\{t\('ins_child_info'\)\}/g, `{language === 'en' ? 'Student Information' : 'Informations de l\\'apprenant'}`);
  childInfoBlock = childInfoBlock.replace(/\{t\('ins_child_firstname'\)\}/g, `{language === 'en' ? 'First Name' : 'Prénom'}`);
  childInfoBlock = childInfoBlock.replace(/\{t\('ins_child_lastname'\)\}/g, `{language === 'en' ? 'Last Name' : 'Nom'}`);
  childInfoBlock = childInfoBlock.replace(/\{t\('ins_child_age'\)\}/g, `{language === 'en' ? 'Age' : 'Âge'}`);

  // Inject Child Info block before the payment buttons in Step 1
  const injectionPointRegex = /\{\(!auth\.user && \(\!formData\.guestFirstName \|\| \!formData\.guestEmail \|\| \!formData\.guestPhone\)\) \? \(/;
  code = code.replace(injectionPointRegex, childInfoBlock + '\n                          {(!auth.user && (!formData.guestFirstName || !formData.guestEmail || !formData.guestPhone)) || !formData.childFirstName || !formData.childLastName || !formData.childAge ? (\n                            <button className="btn btn-primary" disabled style={{ width: \'100%\', padding: \'1rem\', fontSize: \'1.1rem\', opacity: 0.5, cursor: \'not-allowed\' }}>\n                              {language === \'en\' ? \'Fill all details first\' : "Remplissez toutes les informations d\'abord"}\n                            </button>\n                          ) : (!course.registrationFee || course.registrationFee === 0) ? (');

  // Fix FedaPay onSuccess to just call processEnrollment (remove step 2)
  code = code.replace(/if \(isPhysicalCourse\) \{\s*await processEnrollment\('FedaPay', txId\);\s*\} else \{\s*setStep\(2\);\s*\}/g, 'await processEnrollment(\'FedaPay\', txId);');

  // Fix waitlist / Gratuit callbacks (remove step 2 transition)
  code = code.replace(/if \(isPhysicalCourse\) \{\s*await processEnrollment\('waitlist'\);\s*\} else \{\s*setStep\(2\);\s*\}/g, 'await processEnrollment(\'waitlist\');');
  code = code.replace(/if \(isPhysicalCourse\) \{\s*await processEnrollment\('Gratuit'\);\s*\} else \{\s*setStep\(2\);\s*\}/g, 'await processEnrollment(\'Gratuit\');');
  
  // Now we must completely remove the Step 2 block from the DOM.
  // We can do this by using a custom function to find the exact end of step 2 based on `{step === 2`.
  let step2Index = code.indexOf('{step === 2 && course && (');
  if (step2Index !== -1) {
    let sidebarIndex = code.indexOf('{/* SIDEBAR */}');
    // Remove everything from the end of step 1 to the sidebar, and close step 1 correctly.
    // Let's reconstruct the end of the main section.
    // Instead of regex, we'll slice.
    let beforeStep2 = code.substring(0, step2Index);
    let afterStep2 = code.substring(sidebarIndex);
    
    // We need to make sure beforeStep2 closes correctly.
    // Because we removed the `{step === 1 && (` wrapper, we must also remove its matching `)}` that was at the end of the `fade-in` div.
    // The structure before was:
    // {step === 1 && (
    //   <div className="fade-in">
    //     ...
    //   </div>
    // )}
    //
    // So beforeStep2 ends with:
    //                   )}
    //                 </div>
    //             </div>
    //           )}
    // Let's just remove the last `)}` before step2Index.
    let lastParenIndex = beforeStep2.lastIndexOf(')}');
    if (lastParenIndex !== -1) {
      beforeStep2 = beforeStep2.substring(0, lastParenIndex) + beforeStep2.substring(lastParenIndex + 2);
    }
    
    code = beforeStep2 + afterStep2;
  }
}

fs.writeFileSync('Inscription.jsx', code, 'utf8');
