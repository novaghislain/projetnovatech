async function translateText(text, targetLang = 'en') {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch (err) {
    console.error(err);
    return text;
  }
}
translateText("Bonjour le monde. C'est génial.").then(console.log);
