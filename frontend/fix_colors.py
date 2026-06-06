import re
import os

def process_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        content = re.sub(old, new, content, flags=re.IGNORECASE)
        
    with open(filepath, 'w') as f:
        f.write(content)

# AnnonceurDashboard replacements
# #ef4444 (red) -> #0F3460 (blue)
# #dc2626 (dark red) -> #1A1A2E (dark blue)
# #7f1d1d (darkest red) -> #0a2240 (darker blue)
annonceur_replacements = [
    (r'#ef4444', '#0F3460'),
    (r'#dc2626', '#1A1A2E'),
    (r'#7f1d1d', '#0a2240'),
    (r'rgba\(239,\s*68,\s*68', 'rgba(15, 52, 96'),
    (r'#fef2f2', '#eff6ff'), # red light background to blue light background
    (r'rgba\(233,\s*69,\s*96', 'rgba(15, 52, 96')
]
process_file('/Users/gottinsogbossi/projetnovatech/frontend/src/pages/AnnonceurDashboard.jsx', annonceur_replacements)

# FormateurDashboard replacements
# Formateur uses #4285f4, #3b82f6 for blue.
# Replace those with #0F3460
formateur_replacements = [
    (r'#4285f4', '#0F3460'),
    (r'#3b82f6', '#0F3460'),
    (r'#6366f1', '#1A1A2E'), # indigo to dark blue
    (r'rgba\(99,102,241', 'rgba(15,52,96'),
    (r'#eff6ff', '#f0f4f8'), # keep light blue but maybe slightly different
]
process_file('/Users/gottinsogbossi/projetnovatech/frontend/src/pages/FormateurDashboard.jsx', formateur_replacements)

print("Colors replaced successfully")
