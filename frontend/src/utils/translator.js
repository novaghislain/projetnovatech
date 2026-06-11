export const translateCategory = (cat, lang) => {
  if (lang !== 'en' || !cat) return cat;
  const map = {
    'Développement': 'Development',
    'Bureautique': 'Office Automation',
    'Intelligence Artificielle': 'Artificial Intelligence',
    'Sécurité': 'Security',
    'Design': 'Design',
    'Marketing': 'Marketing'
  };
  return map[cat] || cat;
};

export const translateDuration = (dur, lang) => {
  if (lang !== 'en' || !dur) return dur;
  return dur.replace('semaines', 'weeks')
            .replace('semaine', 'week')
            .replace('mois', 'months')
            .replace('jours', 'days')
            .replace('jour', 'day');
};

export const translateAgeGroup = (age, lang) => {
  if (lang !== 'en' || !age) return age;
  return age.replace('ans', 'years');
};

export const translateLevel = (lvl, lang) => {
  if (lang !== 'en' || !lvl) return lvl;
  const map = {
    'Débutant': 'Beginner',
    'Intermédiaire': 'Intermediate',
    'Avancé': 'Advanced',
    'Tous niveaux': 'All levels'
  };
  return map[lvl] || lvl;
};

export const translateTitle = (title, lang) => {
  if (lang !== 'en' || !title) return title;
  const map = {
    'IA': 'AI',
    'Intelligence Artificielle': 'Artificial Intelligence',
    'Développement Web': 'Web Development',
    'Bureautique': 'Office Applications'
  };
  return map[title] || title;
};

export const translateDescription = (desc, lang) => {
  if (lang !== 'en' || !desc) return desc;
  return desc.replace(/PROGRAMME IA/gi, 'AI PROGRAM')
             .replace(/Cette formation est spécialement/gi, 'This course is specially');
};
