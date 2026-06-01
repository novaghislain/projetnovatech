// Simple localStorage-backed service for formations and reservations (mock)
const FORMATIONS_KEY = 'nv_formations';
const RESERVATIONS_KEY = 'nv_reservations';

const defaultFormations = [
  { id: 'f1', title: 'Initiation à la Programmation', category: 'Programmation', ageGroup: '10-14 ans', price: '25 000 FCFA', duration: '4 semaines', spots: 5, image: '/9x.jpeg' },
  { id: 'f2', title: "Découverte de l'Intelligence Artificielle", category: 'Intelligence Artificielle', ageGroup: '14-18 ans', price: '30 000 FCFA', duration: '6 semaines', spots: 0, image: '/8x.jpeg' },
  { id: 'f3', title: 'Maîtrise de la Bureautique', category: 'Bureautique', ageGroup: '8-12 ans', price: '20 000 FCFA', duration: '4 semaines', spots: 12, image: '/10x.jpg' },
];

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getFormations() {
  let list = read(FORMATIONS_KEY);
  if (!list) {
    list = defaultFormations;
    write(FORMATIONS_KEY, list);
  }
  return list;
}

export function getFormationById(id) {
  const list = getFormations();
  return list.find(f => f.id === id) || null;
}

export function reserveFormation(formationId, user) {
  if (!user || !user.email) throw new Error('Utilisateur requis');
  const formations = getFormations().slice();
  const idx = formations.findIndex(f => f.id === formationId);
  if (idx === -1) throw new Error('Formation introuvable');
  const formation = formations[idx];
  if (typeof formation.spots === 'number' && formation.spots <= 0) {
    throw new Error('Plus de places disponibles');
  }
  // decrement spots if numeric
  if (typeof formation.spots === 'number') formations[idx] = { ...formation, spots: formation.spots - 1 };
  write(FORMATIONS_KEY, formations);

  const reservations = read(RESERVATIONS_KEY) || [];
  const newRes = { id: `r_${Date.now()}`, formationId, userEmail: user.email, userName: user.firstName || user.email, createdAt: new Date().toISOString(), status: 'confirmed' };
  reservations.push(newRes);
  write(RESERVATIONS_KEY, reservations);
  return newRes;
}

export function getReservationsByUser(email) {
  if (!email) return [];
  const reservations = read(RESERVATIONS_KEY) || [];
  return reservations.filter(r => r.userEmail === email);
}

export function cancelReservation(reservationId) {
  const reservations = read(RESERVATIONS_KEY) || [];
  const idx = reservations.findIndex(r => r.id === reservationId);
  if (idx === -1) throw new Error('Réservation introuvable');
  const [removed] = reservations.splice(idx, 1);
  write(RESERVATIONS_KEY, reservations);

  // increment spot back
  const formations = getFormations().slice();
  const fidx = formations.findIndex(f => f.id === removed.formationId);
  if (fidx !== -1 && typeof formations[fidx].spots === 'number') {
    formations[fidx] = { ...formations[fidx], spots: formations[fidx].spots + 1 };
    write(FORMATIONS_KEY, formations);
  }
  return removed;
}
