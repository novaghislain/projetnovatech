const db = require('./db');

async function translateText(text, targetLang = 'en') {
  if (!text) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch (err) {
    console.error("Translation error:", err);
    return '';
  }
}

async function migrate() {
  db.all("SELECT id, title, titleEn, category, categoryEn, description, descriptionEn FROM Formations", async (err, formations) => {
    if (err) {
      console.error(err);
      return;
    }
    
    for (let f of formations) {
      let updated = false;
      let finalTitleEn = f.titleEn;
      let finalCategoryEn = f.categoryEn;
      let finalDescriptionEn = f.descriptionEn;

      if (!finalTitleEn && f.title) {
        finalTitleEn = await translateText(f.title, 'en');
        updated = true;
      }
      if (!finalCategoryEn && f.category) {
        finalCategoryEn = await translateText(f.category, 'en');
        updated = true;
      }
      if (!finalDescriptionEn && f.description) {
        finalDescriptionEn = await translateText(f.description, 'en');
        updated = true;
      }

      if (updated) {
        console.log(`Translating formation ${f.id}...`);
        await new Promise((resolve, reject) => {
          db.run(
            "UPDATE Formations SET titleEn = ?, categoryEn = ?, descriptionEn = ? WHERE id = ?",
            [finalTitleEn, finalCategoryEn, finalDescriptionEn, f.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        console.log(`Formation ${f.id} updated!`);
      }
    }
    console.log("Migration complete!");
    process.exit(0);
  });
}

setTimeout(migrate, 2000);
