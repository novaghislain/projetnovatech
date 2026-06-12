import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, Star, MessageCircle, LogOut, Video, FileText, CheckCircle, Clock, ChevronRight, Plus, Trash2, Edit2, X, Menu, Calendar, PlayCircle, FolderOpen, ChevronDown, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_URL, getImageUrl } from '../config';
import './Home.css';
import './FormateurDashboard.css';
import './Admin/AdminDashboard.css';
import Parametres from './Parametres';

const EMPTY_FORM = { title: '', description: '', category: 'Développement', ageGroup: '10-14 ans', level: 'Tous niveaux', duration: '4 semaines', price: '', registrationFee: '', maxParticipants: 20, startDate: '', endDate: '', enrollmentEndDate: '', location: '', format: 'en_ligne', locationMode: 'en_ligne', meetLink: '', whatsappLink: '', imageUrl: '', imageUrls: [], sessionsPerWeek: 2, sessionDuration: '2h', status: 'published' };

const localT = {
  fr: {
    loading: "Chargement des données...",
    sidebar_title: "Espace Formateur",
    nav_overview: "Vue d'ensemble",
    nav_my_courses: "Mes Cours",
    nav_students: "Apprenants",
    nav_manage: "Mes Formations",
    nav_questions: "Questions",
    nav_group_msg: "Messagerie Groupée",
    nav_schedule: "Emploi du Temps",
    nav_settings: "Paramètres",
    logout: "Déconnexion",
    role_trainer: "Formateur Expert",
    welcome_greeting: "Bonjour, {name} 👋",
    welcome_desc: "Voici l'activité de vos classes aujourd'hui.",
    btn_start_live: "Lancer un Live",
    btn_stop_live: "Terminer le Live",
    active_courses: "Cours actifs",
    total_students: "Apprenants totaux",
    avg_rating: "Note moyenne",
    recent_questions: "Questions Récentes",
    no_questions: "Aucune question en attente.",
    btn_reply: "Répondre",
    btn_replied: "Répondu",
    you: "Vous",
    student: "Apprenant",
    type_reply_here: "Tapez votre réponse ici...",
    btn_send: "Envoyer",
    btn_cancel: "Annuler",
    students_title: "Mes Apprenants",
    th_name: "Nom",
    th_email: "Email",
    th_course: "Formation",
    th_enroll_date: "Date d'inscription",
    th_amount_paid: "Montant Payé",
    th_actions: "Actions",
    btn_remove: "Retirer",
    no_students: "Aucun apprenant pour le moment.",
    confirm_remove_student: "Voulez-vous vraiment retirer cet apprenant de la formation ?",
    all_questions: "Toutes les questions",
    group_messaging_desc: "Envoyez un message par email à tous les apprenants inscrits à l'un de vos cours.",
    msg_success: "Message envoyé avec succès !",
    select_course: "Sélectionner la formation *",
    choose_course_opt: "-- Choisir une formation --",
    msg_subject: "Sujet du Message *",
    msg_subject_placeholder: "ex: Rappel : Session de programmation de samedi",
    msg_body: "Contenu du Message *",
    msg_body_placeholder: "Écrivez votre message ici...",
    btn_sending: "Envoi en cours...",
    btn_send_message: "Envoyer le message",
    schedule_title: "Emploi du Temps & Sessions",
    schedule_desc: "Consultez et planifiez le calendrier hebdomadaire de vos classes et cours.",
    session_duration: "Durée de session :",
    total: "Total :",
    period: "Période :",
    from: "Du",
    to: "au",
    not_defined: "Non définie",
    online_meet_link: "Lien Visioconférence",
    location_label: "Lieu :",
    students_enrolled_badge: "{count} Élèves inscrits",
    btn_start_live_badge: "Démarrer Live",
    no_classes: "Aucune classe planifiée pour le moment.",
    add_course: "Ajouter une formation",
    no_courses_title: "Aucune formation",
    no_courses_desc: "Cliquez sur \"Ajouter une formation\" pour créer votre premier cours.",
    btn_modify: "Modifier",
    btn_delete: "Supprimer",
    confirm_delete_course: "Supprimer \"{title}\" ? Cette action est irréversible.",
    modal_edit_course: "Modifier la formation",
    modal_create_course: "Créer une nouvelle formation",
    online_course_check: "Cours en ligne (visioconférence)",
    btn_saving: "Enregistrement...",
    btn_create_course_submit: "Créer la formation",
    btn_save_changes_submit: "Enregistrer les modifications",
    live_selection_title: "Sélectionnez un cours pour le live",
    live_enrolled_count: "{count} apprenants inscrits",
    btn_start: "Démarrer",
    live_in_progress: "Live en cours",
    btn_close: "Fermer",
    nav_content: "Contenu des Cours",
    content_title: "Gestion du Contenu",
    content_select_course: "Choisissez un cours pour gérer son contenu :",
    content_no_courses: "Aucun cours disponible. Créez d'abord un cours.",
    content_modules: "Modules",
    content_add_module: "Ajouter un module",
    content_module_name: "Nom du module",
    content_add_chapter: "+ Chapitre",
    content_chapter_name: "Nom du chapitre",
    content_add_lesson: "+ Leçon",
    content_lesson_title: "Titre de la leçon",
    content_lesson_type: "Type",
    content_lesson_url: "URL du contenu (lien vidéo YouTube, etc.)",
    content_lesson_type_video: "Vidéo",
    content_lesson_type_text: "Texte",
    content_lesson_type_quiz: "Quiz",
    content_save: "Enregistrer",
    content_no_modules: "Aucun module pour ce cours. Ajoutez-en un !",
    content_loading: "Chargement du contenu...",
    specialty: "Spécialité",
    bio: "Biographie",
    photo_url: "Photo d'identité (URL)",
    alert_reply_error: "Erreur lors de l'envoi de la réponse.",
    alert_delete_course_error: "Erreur lors de la suppression du cours.",
    alert_network_error: "Erreur réseau",
    alert_fill_all_fields: "Veuillez remplir tous les champs.",
    alert_live_start_error: "Erreur lors du démarrage du live",
    alert_live_stop_error: "Erreur lors de la fermeture du live",
    
    online_badge: "En ligne",
    in_person_badge: "Présentiel",
    per_week: "x / sem",
    view_all: "Voir tout",
    students_count: "élèves",
    next_session_label: "Prochaine session :",
    average_progress: "Progression moyenne",
  },
  en: {
    loading: "Loading data...",
    sidebar_title: "Trainer Space",
    nav_overview: "Overview",
    nav_my_courses: "My Classes",
    nav_students: "Students",
    nav_manage: "My Courses",
    nav_questions: "Questions",
    nav_group_msg: "Group Messaging",
    nav_schedule: "Schedule",
    nav_settings: "Settings",
    logout: "Logout",
    role_trainer: "Expert Trainer",
    welcome_greeting: "Hello, {name} 👋",
    welcome_desc: "Here is your classes activity today.",
    btn_start_live: "Start Live",
    btn_stop_live: "Stop Live",
    active_courses: "Active courses",
    total_students: "Total students",
    avg_rating: "Average rating",
    recent_questions: "Recent Questions",
    no_questions: "No pending questions.",
    btn_reply: "Reply",
    btn_replied: "Replied",
    you: "You",
    student: "Student",
    type_reply_here: "Type your reply here...",
    btn_send: "Send",
    btn_cancel: "Cancel",
    students_title: "My Students",
    th_name: "Name",
    th_email: "Email",
    th_course: "Course",
    th_enroll_date: "Enroll Date",
    th_amount_paid: "Amount Paid",
    th_actions: "Actions",
    btn_remove: "Remove",
    no_students: "No students at the moment.",
    confirm_remove_student: "Are you sure you want to remove this student from the course?",
    all_questions: "All questions",
    group_messaging_desc: "Send an email message to all enrolled students in one of your courses.",
    msg_success: "Message sent successfully!",
    select_course: "Select course *",
    choose_course_opt: "-- Choose a course --",
    msg_subject: "Message Subject *",
    msg_subject_placeholder: "e.g., Reminder: Saturday programming session",
    msg_body: "Message Body *",
    msg_body_placeholder: "Write your message here...",
    btn_sending: "Sending...",
    btn_send_message: "Send message",
    schedule_title: "Schedule & Sessions",
    schedule_desc: "View and plan your classes weekly calendar.",
    session_duration: "Session duration:",
    total: "Total:",
    period: "Period:",
    from: "From",
    to: "to",
    not_defined: "Not defined",
    online_meet_link: "Video Meeting Link",
    location_label: "Location:",
    students_enrolled_badge: "{count} Students enrolled",
    btn_start_live_badge: "Start Live",
    no_classes: "No classes scheduled at the moment.",
    add_course: "Add course",
    no_courses_title: "No courses",
    no_courses_desc: "Click on \"Add course\" to create your first class.",
    btn_modify: "Modify",
    btn_delete: "Delete",
    confirm_delete_course: "Delete \"{title}\"? This action is irreversible.",
    modal_edit_course: "Edit course details",
    modal_create_course: "Create new course",
    online_course_check: "Online course (video conference)",
    btn_saving: "Saving...",
    btn_create_course_submit: "Create Course",
    btn_save_changes_submit: "Save changes",
    live_selection_title: "Select a class to go live",
    live_enrolled_count: "{count} students enrolled",
    btn_start: "Start",
    live_in_progress: "Live in progress",
    btn_close: "Close",
    nav_content: "Course Content",
    content_title: "Content Management",
    content_select_course: "Choose a course to manage its content:",
    content_no_courses: "No courses available. Create a course first.",
    content_modules: "Modules",
    content_add_module: "Add module",
    content_module_name: "Module name",
    content_add_chapter: "+ Chapter",
    content_chapter_name: "Chapter name",
    content_add_lesson: "+ Lesson",
    content_lesson_title: "Lesson title",
    content_lesson_type: "Type",
    content_lesson_url: "Content URL (YouTube video link, etc.)",
    content_lesson_type_video: "Video",
    content_lesson_type_text: "Text",
    content_lesson_type_quiz: "Quiz",
    content_save: "Save",
    content_no_modules: "No modules for this course. Add one!",
    content_loading: "Loading content...",
    specialty: "Specialty",
    bio: "Biography",
    photo_url: "ID Photo (URL)",
    alert_reply_error: "Error sending reply.",
    alert_delete_course_error: "Error deleting course.",
    alert_network_error: "Network error",
    alert_fill_all_fields: "Please fill all fields.",
    alert_live_start_error: "Error starting live session",
    alert_live_stop_error: "Error stopping live session",
    
    online_badge: "Online",
    in_person_badge: "In-person",
    per_week: "x / week",
    view_all: "View all",
    students_count: "students",
    next_session_label: "Next session:",
    average_progress: "Average progress",
  }
};

const FormateurDashboard = () => {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const t = (key) => localT[language]?.[key] || key;

  const fieldLabels = {
    title: language === 'en' ? 'Title *' : 'Titre *',
    description: language === 'en' ? 'Description' : 'Description',
    imageUrl: language === 'en' ? 'Image URL' : 'Image URL',
    meetLink: language === 'en' ? 'Meet Link (if online)' : 'Lien Meet (si en ligne)',
    whatsappLink: language === 'en' ? 'WhatsApp Link' : 'Lien WhatsApp',
    startDate: language === 'en' ? 'Start Date' : 'Date de début',
    endDate: language === 'en' ? 'End Date' : 'Date de fin',
    location: language === 'en' ? 'Location (if in-person)' : 'Lieu (si présentiel)'
  };

  const categoryDisplay = {
    'Développement': language === 'en' ? 'Development' : 'Développement',
    'Intelligence Artificielle': language === 'en' ? 'Artificial Intelligence' : 'Intelligence Artificielle',
    'Bureautique': language === 'en' ? 'Office Applications' : 'Bureautique',
    'Cybersécurité': language === 'en' ? 'Cybersecurity' : 'Cybersécurité',
    'Design': language === 'en' ? 'Design' : 'Design',
    'Robotique': language === 'en' ? 'Robotics' : 'Robotique',
    'Autre': language === 'en' ? 'Other' : 'Autre'
  };

  const ageGroupDisplay = {
    '8-10 ans': language === 'en' ? '8-10 years' : '8-10 ans',
    '10-12 ans': language === 'en' ? '10-12 years' : '10-12 ans',
    '12-14 ans': language === 'en' ? '12-14 years' : '12-14 ans',
    '14-16 ans': language === 'en' ? '14-16 years' : '14-16 ans',
    '16-18 ans': language === 'en' ? '16-18 years' : '16-18 ans',
    'Tous âges': language === 'en' ? 'All ages' : 'Tous âges'
  };

  // Nouveaux états pour la progression
  const [selectedStudentForProgress, setSelectedStudentForProgress] = useState(null);
  const [studentProgress, setStudentProgress] = useState(0);
  const [studentExercises, setStudentExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');
  const [updatingProgress, setUpdatingProgress] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);

  // ── Sliding indicator sidebar ──
  const navRef = useRef(null);
  const itemRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 50 });

  const updateIndicator = useCallback((tab) => {
    const el = itemRefs.current[tab];
    const wrap = navRef.current;
    if (el && wrap) {
      const wrapRect = wrap.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      setIndicatorStyle({
        top: el.offsetTop,
        height: el.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    updateIndicator(activeTab);
  }, [activeTab, updateIndicator]);

  useEffect(() => {
    const handleResize = () => updateIndicator(activeTab);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, updateIndicator]);

  const setActiveTabAndSlide = (tab) => {
    setActiveTab(tab);
    requestAnimationFrame(() => updateIndicator(tab));
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [selectedLiveCourse, setSelectedLiveCourse] = useState('');
  const [activeLiveRoom, setActiveLiveRoom] = useState(null);
  const [liveCourseId, setLiveCourseId] = useState(null);

  // Course management state
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null); // null = create, object = edit
  const [courseForm, setCourseForm] = useState(EMPTY_FORM);
  const [courseFormLoading, setCourseFormLoading] = useState(false);

  // Content management state
  const [selectedContentCourse, setSelectedContentCourse] = useState(null);
  const [contentTree, setContentTree] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedChapters, setExpandedChapters] = useState({});
  const [newModuleName, setNewModuleName] = useState('');
  const [addingModuleInline, setAddingModuleInline] = useState(false);
  const [addingChapterFor, setAddingChapterFor] = useState(null); // moduleId
  const [newChapterName, setNewChapterName] = useState('');
  const [addingLessonFor, setAddingLessonFor] = useState(null); // chapterId
  const [newLesson, setNewLesson] = useState({ title: '', type: 'video', contentUrl: '' });

  const fetchContentTree = useCallback(async (courseId) => {
    setContentLoading(true);
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/courses/${courseId}/structure`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tree = await res.json();
      setContentTree(Array.isArray(tree) ? tree : []);
    } catch(e) { setContentTree([]); }
    finally { setContentLoading(false); }
  }, []);

  const handleSelectContentCourse = (courseId) => {
    setSelectedContentCourse(courseId);
    setExpandedModules({});
    setExpandedChapters({});
    fetchContentTree(courseId);
  };

  const handleAddModule = async () => {
    if (!newModuleName.trim()) return;
    const token = localStorage.getItem('nv_token');
    const res = await fetch(`${API_URL}/api/modules`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ formationId: selectedContentCourse, title: newModuleName.trim(), orderIndex: contentTree.length })
    });
    const module = await res.json();
    if (module.id) {
      setContentTree(prev => [...prev, { ...module, chapters: [] }]);
      setNewModuleName('');
      setAddingModuleInline(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Supprimer ce module et tout son contenu ?')) return;
    const token = localStorage.getItem('nv_token');
    await fetch(`${API_URL}/api/modules/${moduleId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setContentTree(prev => prev.filter(m => m.id !== moduleId));
  };

  const handleAddChapter = async (moduleId) => {
    if (!newChapterName.trim()) return;
    const token = localStorage.getItem('nv_token');
    const res = await fetch(`${API_URL}/api/chapters`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId, title: newChapterName.trim(), orderIndex: 0 })
    });
    const chapter = await res.json();
    if (chapter.id) {
      setContentTree(prev => prev.map(m => m.id === moduleId ? { ...m, chapters: [...m.chapters, { ...chapter, lessons: [] }] } : m));
      setNewChapterName('');
      setAddingChapterFor(null);
    }
  };

  const handleDeleteChapter = async (moduleId, chapterId) => {
    if (!window.confirm('Supprimer ce chapitre ?')) return;
    const token = localStorage.getItem('nv_token');
    await fetch(`${API_URL}/api/chapters/${chapterId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setContentTree(prev => prev.map(m => m.id === moduleId ? { ...m, chapters: m.chapters.filter(c => c.id !== chapterId) } : m));
  };

  const handleAddLesson = async (moduleId, chapterId) => {
    if (!newLesson.title.trim()) return;
    const token = localStorage.getItem('nv_token');
    const res = await fetch(`${API_URL}/api/lessons`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId, title: newLesson.title.trim(), type: newLesson.type, contentUrl: newLesson.contentUrl, orderIndex: 0 })
    });
    const lesson = await res.json();
    if (lesson.id) {
      setContentTree(prev => prev.map(m => m.id === moduleId ? {
        ...m,
        chapters: m.chapters.map(c => c.id === chapterId ? { ...c, lessons: [...c.lessons, lesson] } : c)
      } : m));
      setNewLesson({ title: '', type: 'video', contentUrl: '' });
      setAddingLessonFor(null);
    }
  };

  const handleDeleteLesson = async (moduleId, chapterId, lessonId) => {
    if (!window.confirm('Supprimer cette leçon ?')) return;
    const token = localStorage.getItem('nv_token');
    await fetch(`${API_URL}/api/lessons/${lessonId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setContentTree(prev => prev.map(m => m.id === moduleId ? {
      ...m,
      chapters: m.chapters.map(c => c.id === chapterId ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) } : c)
    } : m));
  };

  // Group messaging & Schedule state
  const [selectedCourseForMessage, setSelectedCourseForMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState('');

  const handleSendMessageGroup = async (e) => {
    e.preventDefault();
    if (!selectedCourseForMessage || !messageSubject || !messageBody) {
      alert(language === 'en' ? 'Please fill all fields.' : "Veuillez remplir tous les champs.");
      return;
    }
    setSendingMessage(true);
    setMessageSuccess('');
    try {
      const token = localStorage.getItem('nv_token');
      const response = await fetch(`${API_URL}/api/formateur/courses/${selectedCourseForMessage}/message-group`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: messageSubject,
          body: messageBody
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setMessageSuccess(result.message || (language === 'en' ? "Message sent successfully!" : "Message envoyé avec succès !"));
        setMessageSubject('');
        setMessageBody('');
      } else {
        alert(result.error || (language === 'en' ? "Error sending message." : "Erreur lors de l'envoi du message."));
      }
    } catch (err) {
      alert((language === 'en' ? "Connection error: " : "Erreur de connexion : ") + err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    if (!selectedStudentForProgress) return;
    setUpdatingProgress(true);
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/formateur/enrollments/${selectedStudentForProgress.id}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          progress: studentProgress,
          exercises: studentExercises
        })
      });
      if (res.ok) {
        alert(language === 'en' ? 'Progress updated successfully' : 'Progression mise à jour avec succès');
        setSelectedStudentForProgress(null);
        window.location.reload();
      } else {
        const errorData = await res.json();
        alert(errorData.error || (language === 'en' ? 'Error updating progress' : 'Erreur de mise à jour'));
      }
    } catch (err) {
      alert(language === 'en' ? 'Network error' : 'Erreur réseau');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const addExercise = () => {
    if (!newExercise.trim()) return;
    setStudentExercises([...studentExercises, { id: Date.now(), title: newExercise, completed: false }]);
    setNewExercise('');
  };

  const toggleExercise = (id) => {
    setStudentExercises(studentExercises.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex));
  };

  const removeExercise = (id) => {
    setStudentExercises(studentExercises.filter(ex => ex.id !== id));
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('nv_token');
        const res = await fetch(`${API_URL}/api/formateur/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await res.json();
        setData(result);
        
        // Check if any course is already live
        const liveCourse = result.courses?.find(c => c.isLive);
        if (liveCourse) {
          setActiveLiveRoom(liveCourse.liveRoomName);
          setLiveCourseId(liveCourse.id);
        }
      } catch (err) {
        console.error('Erreur de chargement:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const startLive = async (courseId) => {
    try {
      const token = localStorage.getItem('nv_token');
      const res = await fetch(`${API_URL}/api/formateur/courses/${courseId}/live/start`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setActiveLiveRoom(result.liveRoomName);
        setLiveCourseId(courseId);
        setShowLiveModal(false);
      }
    } catch (err) { alert(language === 'en' ? 'Error starting live session' : 'Erreur lors du démarrage du live'); }
  };

  const stopLive = async () => {
    try {
      const token = localStorage.getItem('nv_token');
      await fetch(`${API_URL}/api/formateur/courses/${liveCourseId}/live/stop`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setActiveLiveRoom(null);
      setLiveCourseId(null);
      window.location.reload();
    } catch (err) { alert(language === 'en' ? 'Error stopping live session' : 'Erreur lors de la fermeture du live'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7fe' }}>{t('loading')}</div>;

  const stats = data?.stats || { courses: 0, students: 0, rating: 0 };
  const courses = data?.courses || [];
  const rawCourses = data?.rawCourses || [];
  const questions = data?.questions || [];

  try {
    return (
      <div className="formateur-layout">
      
      {/* MOBILE HEADER */}
      <div className="mobile-header">
        <h2 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 800, margin: 0, cursor: 'pointer' }} onClick={() => window.location.href = '/'}>{t('sidebar_title')}</h2>
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* OVERLAY */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <img src="/4x.png" alt="Novatech Vision" onClick={() => window.location.href = '/'} />
        </div>
        <div className="sidebar-nav-wrap" ref={navRef}>
          <div className="sidebar-indicator" style={{
            top: `${indicatorStyle.top}px`,
            height: `${indicatorStyle.height}px`,
          }} />
          {[
            { id: 'overview', icon: BookOpen, label: t('nav_overview') },
            { id: 'courses', icon: Video, label: t('nav_my_courses') },
            { id: 'students', icon: Users, label: t('nav_students') },
            { id: 'manage', icon: Plus, label: t('nav_manage') },
            { id: 'content', icon: PlayCircle, label: t('nav_content') },
            { id: 'messages', icon: MessageCircle, label: t('nav_questions') },
            { id: 'groupMessage', icon: MessageCircle, label: t('nav_group_msg') },
            { id: 'schedule', icon: Calendar, label: t('nav_schedule') },
            { id: 'settings', icon: Settings, label: t('nav_settings') },
          ].map(item => (
            <div
              key={item.id}
              ref={el => { if (el) itemRefs.current[item.id] = el; }}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => { setActiveTabAndSlide(item.id); setIsSidebarOpen(false); }}
              title={item.label}
            >
              <item.icon size={22} />
              <span className="menu-text">{item.label}</span>
              {item.id === 'messages' && questions.filter(q => q.status === 'pending').length > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem', padding: '1px 7px', borderRadius: '50px', marginLeft: 'auto' }}>
                  {questions.filter(q => q.status === 'pending').length}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="sidebar-logout" onClick={logout} title={t('logout')}>
          <LogOut size={20} />
          <span className="menu-text">{t('logout')}</span>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="formateur-main">
        
        {/* HEADER */}
        <header className="formateur-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#0f172a', margin: '0 0 0.5rem 0' }}>{t('welcome_greeting').replace('{name}', user?.firstName || '')}</h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>{t('welcome_desc')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '50px', height: '50px', borderRadius: '50%', 
              backgroundColor: 'var(--color-primary)', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontSize: '1.2rem', fontWeight: 'bold'
            }}>
              {user?.avatar ? (
                <img src={getImageUrl(user.avatar)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.firstName ? user.firstName.charAt(0).toUpperCase() : <User size={24} />
              )}
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="fade-in">
            {/* STATS GRID */}
            <div className="formateur-stats-grid">
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ background: '#f0f4f8', padding: '1.2rem', borderRadius: '16px', color: '#0F3460' }}><BookOpen size={28} /></div>
                <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.courses}</div><div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>{t('active_courses')}</div></div>
              </div>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ background: '#f0fdf4', padding: '1.2rem', borderRadius: '16px', color: '#22c55e' }}><Users size={28} /></div>
                <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.students}</div><div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>{t('total_students')}</div></div>
              </div>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1.2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ background: '#fef3c7', padding: '1.2rem', borderRadius: '16px', color: '#f59e0b' }}><Star size={28} /></div>
                <div><div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.rating}</div><div style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.2rem' }}>{t('avg_rating')}</div></div>
              </div>
            </div>

            <div className="formateur-content-grid">
              {/* MES COURS */}
              <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#0f172a' }}>{t('nav_my_courses')}</h3>
                  <button onClick={() => setActiveTab('courses')} style={{ background: 'none', border: 'none', color: '#0F3460', fontWeight: 600, cursor: 'pointer' }}>{t('view_all')}</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {courses.map(course => (
                    <div key={course.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem', border: '1px solid #f1f5f9', borderRadius: '16px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#0F3460'} onMouseLeave={e => e.currentTarget.style.borderColor = '#f1f5f9'}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '50px', height: '50px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F3460' }}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 0.3rem 0', color: '#0f172a', fontSize: '1.05rem' }}>{course.title}</h4>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={14} /> {course.students} {t('students_count')}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b' }}><Star size={14} /> {course.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <Clock size={14} /> {course.nextSession}
                        </div>
                        <div style={{ width: '120px', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${course.progress}%`, height: '100%', background: '#0F3460', borderRadius: '10px' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUESTIONS RÉCENTES */}
              <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.3rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {t('recent_questions')} 
                  {questions.filter(q => q.status === 'pending').length > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.8rem', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                      {questions.filter(q => q.status === 'pending').length}
                    </span>
                  )}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {questions.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', margin: '2rem 0' }}>{t('no_questions')}</p>
                  ) : questions.map(q => (
                    <div key={q.id} style={{ paddingBottom: '1.2rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{q.student}</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{q.time}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#0F3460', fontWeight: 600, marginBottom: '0.5rem' }}>{q.course}</div>
                      <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.4 }}>"{q.text}"</p>
                      
                      {/* Threaded replies */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                        {q.answerText && (!q.replies || q.replies.length === 0) && (
                          <div style={{ padding: '0.8rem', background: '#ecfdf5', borderRadius: '8px', alignSelf: 'flex-start', maxWidth: '90%' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: '0.2rem' }}>{t('you')}</div>
                            <p style={{ margin: 0, color: '#065f46', fontSize: '0.85rem' }}>{q.answerText}</p>
                          </div>
                        )}
                        {q.replies && q.replies.map(reply => (
                          <div key={reply.id} style={{ 
                            padding: '0.8rem', 
                            borderRadius: '8px', 
                            maxWidth: '90%',
                            alignSelf: reply.senderRole === 'formateur' ? 'flex-start' : 'flex-end',
                            background: reply.senderRole === 'formateur' ? '#ecfdf5' : '#f1f5f9',
                          }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: reply.senderRole === 'formateur' ? '#10b981' : '#0F3460', marginBottom: '0.2rem', textAlign: reply.senderRole === 'formateur' ? 'left' : 'right' }}>
                              {reply.senderRole === 'formateur' ? t('you') : t('student')}
                              <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginLeft: '0.4rem', fontWeight: 400 }}>{new Date(reply.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p style={{ margin: 0, color: reply.senderRole === 'formateur' ? '#065f46' : '#334155', fontSize: '0.85rem' }}>{reply.text}</p>
                          </div>
                        ))}
                      </div>
                      
                      {replyingTo === q.id ? (
                        <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                          <textarea 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={t('type_reply_here')}
                            style={{ width: '100%', minHeight: '80px', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '0.8rem', outline: 'none', resize: 'vertical' }}
                          />
                          <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <button 
                              onClick={async () => {
                                if (!replyText) return;
                                try {
                                  const token = localStorage.getItem('nv_token');
                                  await fetch(`${API_URL}/api/formateur/questions/${q.id}/reply`, {
                                    method: 'PUT',
                                    headers: { 
                                      'Authorization': `Bearer ${token}`,
                                      'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ answerText: replyText })
                                  });
                                  window.location.reload();
                                } catch(e) { alert(t('alert_reply_error')); }
                              }} 
                              style={{ padding: '0.5rem 1rem', background: '#0F3460', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                              {t('btn_send')}
                            </button>
                            <button 
                              onClick={() => { setReplyingTo(null); setReplyText(''); }} 
                              style={{ padding: '0.5rem 1rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                              {t('btn_cancel')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => { setReplyingTo(q.id); setReplyText(''); }} 
                          style={{ padding: '0.5rem 1rem', background: '#f0f4f8', color: '#0F3460', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {t('btn_reply')} <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>{t('nav_my_courses')}</h3>
            <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {courses.map(course => (
                <div key={course.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{course.title}</h4>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={16} /> {course.students} {t('students_count')}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b' }}><Star size={16} /> {course.rating}</span>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}>
                        <span>{t('average_progress')}</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${course.progress}%`, height: '100%', background: '#0F3460', borderRadius: '10px' }}></div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Clock size={14} /> {t('next_session_label')} {course.nextSession}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>{t('students_title')}</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#94a3b8', fontSize: '0.9rem' }}>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{t('th_name')}</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{t('th_email')}</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{t('th_course')}</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{t('th_enroll_date')}</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{language === 'en' ? 'Progress' : 'Progression'}</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{t('th_amount_paid')}</th>
                    <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{t('th_actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.studentsList || []).map((student, i) => (
                    <tr key={student.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: '#0f172a' }}>{student.name}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>{student.email}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#0F3460', fontWeight: 500 }}>{student.course}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>{new Date(student.date).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#0F3460', fontWeight: 600 }}>{student.progress || 0}%</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#10b981', fontWeight: 600 }}>{student.amount ? `${student.amount} FCFA` : (language === 'en' ? 'Free' : 'Gratuit')}</td>
                      <td style={{ padding: '1rem 0.5rem', display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => {
                            setSelectedStudentForProgress(student);
                            setStudentProgress(student.progress || 0);
                            try {
                              setStudentExercises(typeof student.exercises === 'string' ? JSON.parse(student.exercises) : (student.exercises || []));
                            } catch (e) {
                              setStudentExercises([]);
                            }
                          }}
                          style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                          {language === 'en' ? 'Progress' : 'Progression'}
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm(t('confirm_remove_student'))) {
                              try {
                                const token = localStorage.getItem('nv_token');
                                await fetch(`${API_URL}/api/formateur/enrollments/${student.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                window.location.reload();
                              } catch(e) { alert(t('alert_network_error')); }
                            }
                          }}
                          style={{ background: '#fef2f2', color: '#ef4444', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                          {t('btn_remove')}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(data?.studentsList?.length === 0) && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{t('no_students')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>{t('all_questions')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {questions.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', margin: '2rem 0' }}>{t('no_questions')}</p>
              ) : questions.map(q => (
                <div key={q.id} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '1.05rem' }}>{q.student}</span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{q.time}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#0F3460', fontWeight: 600, marginBottom: '0.8rem' }}>{language === 'en' ? 'Course:' : 'Formation :'} {q.course}</div>
                  <p style={{ margin: '0 0 1.2rem 0', fontSize: '0.95rem', color: '#475569', lineHeight: 1.5 }}>"{q.text}"</p>
                  
                  {/* Threaded replies */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                    {q.answerText && (!q.replies || q.replies.length === 0) && (
                      <div style={{ padding: '1rem', background: '#ecfdf5', borderRadius: '8px', alignSelf: 'flex-start', maxWidth: '90%' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '0.3rem' }}>{t('you')}</div>
                        <p style={{ margin: 0, color: '#065f46', fontSize: '0.95rem' }}>{q.answerText}</p>
                      </div>
                    )}
                    {q.replies && q.replies.map(reply => (
                      <div key={reply.id} style={{ 
                        padding: '1rem', 
                        borderRadius: '8px', 
                        maxWidth: '90%',
                        alignSelf: reply.senderRole === 'formateur' ? 'flex-start' : 'flex-end',
                        background: reply.senderRole === 'formateur' ? '#ecfdf5' : '#f1f5f9',
                      }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: reply.senderRole === 'formateur' ? '#10b981' : '#0F3460', marginBottom: '0.3rem', textAlign: reply.senderRole === 'formateur' ? 'left' : 'right' }}>
                          {reply.senderRole === 'formateur' ? t('you') : t('student')}
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '0.5rem', fontWeight: 400 }}>{new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ margin: 0, color: reply.senderRole === 'formateur' ? '#065f46' : '#334155', fontSize: '0.95rem' }}>{reply.text}</p>
                      </div>
                    ))}
                  </div>

                  {replyingTo === q.id ? (
                    <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={t('type_reply_here')}
                        style={{ width: '100%', minHeight: '100px', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem', outline: 'none', resize: 'vertical' }}
                      />
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                          onClick={async () => {
                            if (!replyText) return;
                            try {
                              const token = localStorage.getItem('nv_token');
                              await fetch(`${API_URL}/api/formateur/questions/${q.id}/reply`, {
                                method: 'PUT',
                                headers: { 
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ answerText: replyText })
                              });
                              window.location.reload();
                            } catch(e) { alert(t('alert_reply_error')); }
                          }} 
                          style={{ padding: '0.6rem 1.2rem', background: '#0F3460', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                          {t('btn_send')}
                        </button>
                        <button 
                          onClick={() => { setReplyingTo(null); setReplyText(''); }} 
                          style={{ padding: '0.6rem 1.2rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                          {t('btn_cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setReplyingTo(q.id); setReplyText(''); }} 
                      style={{ padding: '0.6rem 1.2rem', background: '#0F3460', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {t('btn_reply')} <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TAB: MESSAGERIE GROUPÉE ===== */}
        {activeTab === 'groupMessage' && (
          <div className="fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', maxWidth: '800px' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageCircle size={24} color="#0F3460" /> {t('nav_group_msg')}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>{t('group_messaging_desc')}</p>
            
            {messageSuccess && (
              <div style={{ background: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '12px', border: '1px solid #a7f3d0', marginBottom: '1.5rem', fontWeight: 600 }}>
                {messageSuccess}
              </div>
            )}

            <form onSubmit={handleSendMessageGroup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>{t('select_course')}</label>
                <select 
                  className="form-control" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                  value={selectedCourseForMessage}
                  onChange={(e) => setSelectedCourseForMessage(e.target.value)}
                  required
                >
                  <option value="">{t('choose_course_opt')}</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.title} ({course.students} {t('students_count')})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>{t('msg_subject')}</label>
                <input 
                  type="text" 
                  className="form-control" 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                  placeholder={t('msg_subject_placeholder')}
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.5rem' }}>{t('msg_body')}</label>
                <textarea 
                  className="form-control" 
                  style={{ width: '100%', minHeight: '150px', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', lineHeight: '1.5' }}
                  placeholder={t('msg_body_placeholder')}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  type="submit" 
                  disabled={sendingMessage} 
                  style={{ padding: '0.9rem 2rem', background: sendingMessage ? '#94a3b8' : 'linear-gradient(135deg, #0F3460, #1A1A2E)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: sendingMessage ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(15,52,96,0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {sendingMessage ? t('btn_sending') : t('btn_send_message')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===== TAB: EMPLOI DU TEMPS ===== */}
        {activeTab === 'schedule' && (
          <div className="fade-in" style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={24} color="#0F3460" /> {t('schedule_title')}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>{t('schedule_desc')}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {courses.map(course => {
                const raw = rawCourses.find(c => c.id === course.id) || {};
                return (
                  <div key={course.id} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
                      <div style={{ background: raw.isOnline ? '#eff6ff' : '#f0fdf4', color: raw.isOnline ? '#3b82f6' : '#22c55e', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 700, width: '90px', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{raw.isOnline ? t('online_badge') : t('in_person_badge')}</span>
                        <span style={{ fontSize: '1.1rem', marginTop: '0.2rem' }}>{raw.sessionsPerWeek || 1}{t('per_week')}</span>
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', color: '#0f172a' }}>{course.title}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: '#475569' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={16} color="#64748b" />
                            <span>{t('session_duration')} <strong>{raw.sessionDuration || '2h'}</strong> &bull; {t('total')} <strong>{raw.duration}</strong></span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={16} color="#64748b" />
                            <span>{t('period')} {t('from')} {raw.startDate ? new Date(raw.startDate).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR') : t('not_defined')} {t('to')} {raw.endDate ? new Date(raw.endDate).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR') : t('not_defined')}</span>
                          </div>
                          {raw.isOnline ? (
                            raw.meetLink && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Video size={16} color="#3b82f6" />
                                <a href={raw.meetLink} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline', fontWeight: 600 }}>{t('online_meet_link')}</a>
                              </div>
                            )
                          ) : (
                            raw.location && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
                                <span>{t('location_label')} <strong>{raw.location}</strong></span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <span className="status-badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '30px', fontWeight: 600 }}>
                        {t('students_enrolled_badge').replace('{count}', course.students)}
                      </span>
                      {raw.isOnline && (
                        <button 
                          onClick={() => startLive(course.id)} 
                          style={{
                            background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe',
                            padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                            fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem'
                          }}
                        >
                          <Video size={14} /> {t('btn_start_live_badge')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {courses.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>{t('no_classes')}</div>
              )}
            </div>
          </div>
        )}

        {/* ===== GÉRER LES FORMATIONS ===== */}
        {/* ===== TAB: CONTENU DES COURS ===== */}
        {activeTab === 'content' && (
          <div className="fade-in">
            <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', color: '#0f172a' }}>{t('content_title')}</h2>

            {courses.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '20px', padding: '3rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <PlayCircle size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                <p style={{ color: '#64748b' }}>{t('content_no_courses')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Course selector */}
                <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <p style={{ color: '#64748b', marginBottom: '1rem', fontWeight: 500 }}>{t('content_select_course')}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {courses.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectContentCourse(c.id)}
                        style={{
                          padding: '0.6rem 1.2rem',
                          borderRadius: '10px',
                          border: selectedContentCourse === c.id ? '2px solid #0F3460' : '2px solid #e2e8f0',
                          background: selectedContentCourse === c.id ? '#0F3460' : '#f8fafc',
                          color: selectedContentCourse === c.id ? '#fff' : '#374151',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                      >{c.title}</button>
                    ))}
                  </div>
                </div>

                {/* Content tree */}
                {selectedContentCourse && (
                  <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    {contentLoading ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>{t('content_loading')}</div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.1rem' }}>{t('content_modules')}</h3>
                          <button
                            onClick={() => setAddingModuleInline(true)}
                            style={{ padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #0F3460, #1A1A2E)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
                          ><Plus size={16} /> {t('content_add_module')}</button>
                        </div>

                        {/* Add module inline */}
                        {addingModuleInline && (
                          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                            <input
                              autoFocus
                              value={newModuleName}
                              onChange={e => setNewModuleName(e.target.value)}
                              placeholder={t('content_module_name')}
                              onKeyDown={e => { if (e.key === 'Enter') handleAddModule(); if (e.key === 'Escape') { setAddingModuleInline(false); setNewModuleName(''); } }}
                              style={{ flex: 1, padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid #bae6fd', outline: 'none', fontSize: '0.95rem' }}
                            />
                            <button onClick={handleAddModule} style={{ padding: '0.7rem 1.2rem', background: '#0F3460', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>{t('content_save')}</button>
                            <button onClick={() => { setAddingModuleInline(false); setNewModuleName(''); }} style={{ padding: '0.7rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><X size={16} /></button>
                          </div>
                        )}

                        {contentTree.length === 0 && !addingModuleInline && (
                          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{t('content_no_modules')}</div>
                        )}

                        {/* Modules list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {contentTree.map((module, mi) => (
                            <div key={module.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', overflow: 'hidden' }}>
                              {/* Module header */}
                              <div
                                style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', background: '#f8fafc', cursor: 'pointer', gap: '0.75rem' }}
                                onClick={() => setExpandedModules(p => ({ ...p, [module.id]: !p[module.id] }))}
                              >
                                <ChevronDown size={18} color="#64748b" style={{ transform: expandedModules[module.id] ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }} />
                                <FolderOpen size={18} color="#0F3460" style={{ flexShrink: 0 }} />
                                <span style={{ fontWeight: 700, color: '#0f172a', flex: 1 }}>Module {mi + 1} : {module.title}</span>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginRight: '0.5rem' }}>{module.chapters?.length || 0} chapitre(s)</span>
                                <button
                                  onClick={e => { e.stopPropagation(); handleDeleteModule(module.id); }}
                                  style={{ padding: '0.3rem 0.6rem', background: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                ><Trash2 size={12} /></button>
                              </div>

                              {/* Chapters */}
                              {expandedModules[module.id] && (
                                <div style={{ padding: '1rem 1.25rem 1.25rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  {module.chapters?.map((chapter, ci) => (
                                    <div key={chapter.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                      {/* Chapter header */}
                                      <div
                                        style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', background: '#fff', cursor: 'pointer', gap: '0.75rem' }}
                                        onClick={() => setExpandedChapters(p => ({ ...p, [chapter.id]: !p[chapter.id] }))}
                                      >
                                        <ChevronDown size={15} color="#94a3b8" style={{ transform: expandedChapters[chapter.id] ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s', flexShrink: 0 }} />
                                        <BookOpen size={15} color="#7c3aed" style={{ flexShrink: 0 }} />
                                        <span style={{ fontWeight: 600, color: '#374151', flex: 1 }}>Ch.{ci + 1} : {chapter.title}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginRight: '0.5rem' }}>{chapter.lessons?.length || 0} leçon(s)</span>
                                        <button
                                          onClick={e => { e.stopPropagation(); handleDeleteChapter(module.id, chapter.id); }}
                                          style={{ padding: '0.25rem 0.5rem', background: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        ><Trash2 size={11} /></button>
                                      </div>

                                      {/* Lessons */}
                                      {expandedChapters[chapter.id] && (
                                        <div style={{ padding: '0.75rem 1rem 1rem 2rem', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                          {chapter.lessons?.map(lesson => (
                                            <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                              {lesson.type === 'video' ? <PlayCircle size={16} color="#0ea5e9" style={{ flexShrink: 0 }} /> : <FileText size={16} color="#8b5cf6" style={{ flexShrink: 0 }} />}
                                              <span style={{ flex: 1, fontSize: '0.9rem', color: '#374151', fontWeight: 500 }}>{lesson.title}</span>
                                              <span style={{ fontSize: '0.75rem', background: lesson.type === 'video' ? '#e0f2fe' : '#ede9fe', color: lesson.type === 'video' ? '#0369a1' : '#6d28d9', padding: '2px 8px', borderRadius: '20px' }}>{lesson.type}</span>
                                              {lesson.contentUrl && (
                                                <a href={lesson.contentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#0F3460', textDecoration: 'underline' }}>Voir</a>
                                              )}
                                              <button
                                                onClick={() => handleDeleteLesson(module.id, chapter.id, lesson.id)}
                                                style={{ padding: '0.2rem 0.4rem', background: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                              ><Trash2 size={11} /></button>
                                            </div>
                                          ))}

                                          {/* Add lesson inline */}
                                          {addingLessonFor === chapter.id ? (
                                            <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '0.75rem', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                              <input
                                                autoFocus
                                                value={newLesson.title}
                                                onChange={e => setNewLesson(p => ({ ...p, title: e.target.value }))}
                                                placeholder={t('content_lesson_title')}
                                                style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0', outline: 'none', fontSize: '0.9rem' }}
                                              />
                                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <select
                                                  value={newLesson.type}
                                                  onChange={e => setNewLesson(p => ({ ...p, type: e.target.value }))}
                                                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #bbf7d0', outline: 'none', fontSize: '0.85rem', flex: '0 0 auto' }}
                                                >
                                                  <option value="video">{t('content_lesson_type_video')}</option>
                                                  <option value="text">{t('content_lesson_type_text')}</option>
                                                  <option value="quiz">{t('content_lesson_type_quiz')}</option>
                                                </select>
                                                <input
                                                  value={newLesson.contentUrl}
                                                  onChange={e => setNewLesson(p => ({ ...p, contentUrl: e.target.value }))}
                                                  placeholder={t('content_lesson_url')}
                                                  style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #bbf7d0', outline: 'none', fontSize: '0.85rem' }}
                                                />
                                              </div>
                                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button onClick={() => { setAddingLessonFor(null); setNewLesson({ title: '', type: 'video', contentUrl: '' }); }} style={{ padding: '0.4rem 0.8rem', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>{t('btn_cancel')}</button>
                                                <button onClick={() => handleAddLesson(module.id, chapter.id)} style={{ padding: '0.4rem 0.8rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>{t('content_save')}</button>
                                              </div>
                                            </div>
                                          ) : (
                                            <button
                                              onClick={() => { setAddingLessonFor(chapter.id); setNewLesson({ title: '', type: 'video', contentUrl: '' }); }}
                                              style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem', background: 'none', border: '1px dashed #94a3b8', borderRadius: '6px', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                                            >{t('content_add_lesson')}</button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}

                                  {/* Add chapter inline */}
                                  {addingChapterFor === module.id ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', background: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                                      <input
                                        autoFocus
                                        value={newChapterName}
                                        onChange={e => setNewChapterName(e.target.value)}
                                        placeholder={t('content_chapter_name')}
                                        onKeyDown={e => { if (e.key === 'Enter') handleAddChapter(module.id); if (e.key === 'Escape') { setAddingChapterFor(null); setNewChapterName(''); } }}
                                        style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e9d5ff', outline: 'none', fontSize: '0.9rem' }}
                                      />
                                      <button onClick={() => handleAddChapter(module.id)} style={{ padding: '0.5rem 0.9rem', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>{t('content_save')}</button>
                                      <button onClick={() => { setAddingChapterFor(null); setNewChapterName(''); }} style={{ padding: '0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><X size={14} /></button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => { setAddingChapterFor(module.id); setExpandedModules(p => ({ ...p, [module.id]: true })); }}
                                      style={{ alignSelf: 'flex-start', padding: '0.4rem 0.8rem', background: 'none', border: '1px dashed #a78bfa', borderRadius: '6px', color: '#7c3aed', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                                    >{t('content_add_chapter')}</button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>{t('nav_my_courses')}</h2>
              <button
                onClick={() => { setCourseForm(EMPTY_FORM); setEditingCourse(null); setShowCourseForm(true); }}
                style={{ padding: '0.8rem 1.5rem', background: 'linear-gradient(135deg, #0F3460, #1A1A2E)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(15,52,96,0.3)' }}
              >
                <Plus size={18} /> {t('add_course')}
              </button>
            </div>

            {courses.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '20px', padding: '4rem', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <BookOpen size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: '#64748b', marginBottom: '0.5rem' }}>{t('no_courses_title')}</h3>
                <p style={{ color: '#94a3b8' }}>{t('no_courses_desc')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {courses.map(course => (
                  <div key={course.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '200px' }}>
                      <div style={{ width: '54px', height: '54px', background: '#f0f4f8', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F3460', flexShrink: 0 }}>
                        <FileText size={26} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{course.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                          {categoryDisplay[course.category] || course.category} &bull; {course.students || 0} {t('students_count')} &bull; {course.nextSession}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        onClick={() => {
                          const raw = rawCourses.find(c => c.id === course.id) || course;
                          setCourseForm({
                            title: raw.title || '', description: raw.description || '', category: raw.category || 'Développement',
                            ageGroup: raw.ageGroup || '', level: raw.level || '', duration: raw.duration || '',
                            price: raw.price || '', registrationFee: raw.registrationFee || '', maxParticipants: raw.maxParticipants || 20,
                            startDate: raw.startDate || '', endDate: raw.endDate || '', location: raw.location || '',
                            format: raw.format || 'en_ligne', locationMode: raw.locationMode || 'en_ligne', meetLink: raw.meetLink || '', whatsappLink: raw.whatsappLink || '', 
                            imageUrl: raw.imageUrl || '', imageUrls: raw.imageUrls ? JSON.parse(raw.imageUrls) : [], sessionsPerWeek: raw.sessionsPerWeek || 2, sessionDuration: raw.sessionDuration || '',
                            status: raw.status || 'published'
                          });
                          setEditingCourse(course.id);
                          setShowCourseForm(true);
                        }}
                        style={{ padding: '0.6rem 1.2rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Edit2 size={15} /> {t('btn_modify')}
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm(t('confirm_delete_course').replace('{title}', course.title))) return;
                          const token = localStorage.getItem('nv_token');
                          const res = await fetch(`${API_URL}/api/formateur/courses/${course.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (res.ok) window.location.reload();
                          else alert(t('alert_delete_course_error'));
                        }}
                        style={{ padding: '0.6rem 1.2rem', background: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Trash2 size={15} /> {t('btn_delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && <Parametres />}
      </main>

      {/* ===== MODALE CRÉATION / MODIFICATION FORMATION ===== */}
      {showCourseForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem', overflowY: 'auto' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '680px', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowCourseForm(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={18} /></button>
            <h2 style={{ margin: '0 0 2rem 0', color: '#0f172a', fontSize: '1.5rem' }}>{editingCourse ? t('modal_edit_course') : t('modal_create_course')}</h2>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setCourseFormLoading(true);
              try {
                const token = localStorage.getItem('nv_token');
                const url = editingCourse
                  ? `${API_URL}/api/formateur/courses/${editingCourse}`
                  : `${API_URL}/api/formateur/courses`;
                const method = editingCourse ? 'PUT' : 'POST';
                const res = await fetch(url, {
                  method,
                  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({...courseForm, imageUrls: JSON.stringify(courseForm.imageUrls || [])})
                });
                const result = await res.json();
                if (result.success || result.id) {
                  setShowCourseForm(false);
                  window.location.reload();
                } else {
                  alert(result.error || t('alert_network_error'));
                }
              } catch(err) { alert(t('alert_network_error')); }
              finally { setCourseFormLoading(false); }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

              {[['Titre *', 'title', 'text', true], ['Description', 'description', 'text', false], ['Lien Meet (si en ligne)', 'meetLink', 'text', false], ['Lien WhatsApp', 'whatsappLink', 'text', false], ['Date de début', 'startDate', 'date', false], ['Date de fin', 'endDate', 'date', false], ['Fin des inscriptions', 'enrollmentEndDate', 'date', false]].filter(([frLabel, key]) => {
                if (courseForm.format === 'physique' && (key === 'meetLink' || key === 'whatsappLink')) return false;
                return true;
              }).map(([frLabel, key, type, required]) => (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{fieldLabels[key] || frLabel}</label>
                  <input
                    type={type}
                    required={required}
                    value={courseForm[key]}
                    onChange={e => setCourseForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{language === 'en' ? 'Course Images (Select multiple)' : 'Images de la formation (Plusieurs possibles)'}</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      if (files.length === 0) return;
                      
                      const token = localStorage.getItem('nv_token');
                      const uploadedUrls = [];
                      
                      for (const file of files) {
                        const formData = new FormData();
                        formData.append('image', file);
                        try {
                          const res = await fetch(`${API_URL}/api/upload`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: formData
                          });
                          const data = await res.json();
                          if (data.imageUrl) {
                            uploadedUrls.push(data.imageUrl);
                          }
                        } catch (err) {
                          console.error("Upload error", err);
                        }
                      }
                      
                      if (uploadedUrls.length > 0) {
                        setCourseForm(f => {
                          const newUrls = [...(f.imageUrls || []), ...uploadedUrls];
                          return { ...f, imageUrls: newUrls, imageUrl: newUrls[0] };
                        });
                      }
                    }}
                    style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box', background: '#f8fafc' }}
                  />
                  {courseForm.imageUrls && courseForm.imageUrls.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      {courseForm.imageUrls.map((url, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img src={url.startsWith('http') ? url : `${API_URL}${url}`} alt="Aperçu" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                          <button 
                            type="button"
                            onClick={() => setCourseForm(f => {
                              const newUrls = f.imageUrls.filter((_, i) => i !== idx);
                              return { ...f, imageUrls: newUrls, imageUrl: newUrls.length > 0 ? newUrls[0] : '' };
                            })}
                            style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', fontSize: '10px' }}>
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{language === 'en' ? 'Domain' : 'Domaine'}</label>
                  <select value={courseForm.category} onChange={e => setCourseForm(f => ({ ...f, category: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }}>
                    {['Développement', 'Intelligence Artificielle', 'Bureautique', 'Cybersécurité', 'Design', 'Robotique', 'Autre'].map(c => <option key={c} value={c}>{categoryDisplay[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{language === 'en' ? 'Category' : 'Catégorie'}</label>
                  <select value={courseForm.format} onChange={e => setCourseForm(f => ({ ...f, format: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }}>
                    <option value="en_ligne">En ligne</option>
                    <option value="physique">Présentiel</option>
                    <option value="masse">En masse</option>
                  </select>
                </div>
                {courseForm.format === 'masse' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{language === 'en' ? 'Location Mode' : 'Lieu (Masse)'}</label>
                    <select value={courseForm.locationMode} onChange={e => setCourseForm(f => ({ ...f, locationMode: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }}>
                      <option value="en_ligne">En Ligne</option>
                      <option value="physique">Présentiel</option>
                    </select>
                  </div>
                )}
                {(courseForm.format === 'physique' || (courseForm.format === 'masse' && courseForm.locationMode === 'physique')) && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{language === 'en' ? 'Location (if in-person)' : 'Lieu (si présentiel)'}</label>
                    <input
                      type="text"
                      value={courseForm.location}
                      onChange={e => setCourseForm(f => ({ ...f, location: e.target.value }))}
                      style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }}
                    />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{language === 'en' ? 'Age Group' : "Tranche d'âge"}</label>
                  <select value={courseForm.ageGroup} onChange={e => setCourseForm(f => ({ ...f, ageGroup: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }}>
                    {['8-10 ans', '10-12 ans', '12-14 ans', '14-16 ans', '16-18 ans', 'Tous âges'].map(c => <option key={c} value={c}>{ageGroupDisplay[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{language === 'en' ? 'Level' : "Niveau"}</label>
                  <select value={courseForm.level || 'Tous niveaux'} onChange={e => setCourseForm(f => ({ ...f, level: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem' }}>
                    <option value="Tous niveaux">{language === 'en' ? 'All levels' : 'Tous niveaux'}</option>
                    <option value="Débutant">{language === 'en' ? 'Beginner' : 'Débutant'}</option>
                    <option value="Intermédiaire">{language === 'en' ? 'Intermediate' : 'Intermédiaire'}</option>
                    <option value="Avancé">{language === 'en' ? 'Advanced' : 'Avancé'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{language === 'en' ? 'Price (FCFA)' : 'Prix (FCFA)'}</label>
                  <input type="number" value={courseForm.price} onChange={e => setCourseForm(f => ({ ...f, price: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'none' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{language === 'en' ? 'Registration fee (FCFA)' : 'Frais inscription (FCFA)'}</label>
                  <input type="number" value={courseForm.registrationFee} onChange={e => setCourseForm(f => ({ ...f, registrationFee: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{language === 'en' ? 'Max participants' : 'Places max'}</label>
                  <input type="number" value={courseForm.maxParticipants} onChange={e => setCourseForm(f => ({ ...f, maxParticipants: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>{language === 'en' ? 'Total duration' : 'Durée totale'}</label>
                  <input type="text" placeholder={language === 'en' ? 'e.g., 4 weeks' : 'ex: 4 semaines'} value={courseForm.duration} onChange={e => setCourseForm(f => ({ ...f, duration: e.target.value }))} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowCourseForm(false)} style={{ padding: '0.9rem 1.8rem', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>{t('btn_cancel')}</button>
                <button type="submit" disabled={courseFormLoading} style={{ padding: '0.9rem 1.8rem', background: courseFormLoading ? '#94a3b8' : 'linear-gradient(135deg, #0F3460, #1A1A2E)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: courseFormLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(15,52,96,0.3)' }}>
                  {courseFormLoading ? t('btn_saving') : (editingCourse ? t('btn_save_changes_submit') : t('btn_create_course_submit'))}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Course Selection Modal */}
      {showLiveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '2rem', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.3rem' }}>{t('live_selection_title')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {courses.map(course => (
                <button 
                  key={course.id}
                  onClick={() => setSelectedLiveCourse(course.id)}
                  style={{ padding: '1rem', background: selectedLiveCourse === course.id ? '#f0f4f8' : '#f8fafc', border: selectedLiveCourse === course.id ? '2px solid #0F3460' : '1px solid #e2e8f0', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{course.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>{t('live_enrolled_count').replace('{count}', course.enrolled || 0)}</div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setShowLiveModal(false)} style={{ padding: '0.8rem 1.5rem', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>{t('btn_cancel')}</button>
              <button onClick={() => { if(selectedLiveCourse) startLive(selectedLiveCourse); }} disabled={!selectedLiveCourse} style={{ padding: '0.8rem 1.5rem', background: selectedLiveCourse ? '#0F3460' : '#94a3b8', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: selectedLiveCourse ? 'pointer' : 'not-allowed' }}>{t('btn_start')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Jitsi Meet Live Iframe */}
      {activeLiveRoom && (
        <div style={{ position: 'fixed', top: '2rem', right: '2rem', width: '800px', maxWidth: '90%', height: '500px', background: '#000', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', zIndex: 1000, border: '4px solid #0F3460', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: '#0F3460', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 5px #ef4444' }}></span>
              {t('live_in_progress')}
            </div>
            <button onClick={stopLive} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>{t('btn_close')}</button>
          </div>
          <iframe 
            src={`https://meet.jit.si/${activeLiveRoom}`} 
            allow="camera; microphone; display-capture; autoplay; clipboard-write" 
            style={{ width: '100%', height: '100%', border: 'none' }} 
          />
        </div>
      )}

      {/* Modal: Gérer Progression */}
      {selectedStudentForProgress && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="fade-in" style={{ background: '#fff', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0F3460' }}>{language === 'en' ? 'Manage Progress for' : 'Progression de'} {selectedStudentForProgress.name}</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{selectedStudentForProgress.course}</p>
            
            <form onSubmit={handleUpdateProgress}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>{language === 'en' ? 'Global Progress (%)' : 'Progression globale (%)'}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={studentProgress} 
                    onChange={e => setStudentProgress(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#0F3460' }}
                  />
                  <span style={{ fontWeight: 700, color: '#0F3460', minWidth: '40px' }}>{studentProgress}%</span>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#374151' }}>{language === 'en' ? 'Exercises / Tasks' : 'Exercices / Tâches'}</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input 
                    type="text" 
                    value={newExercise} 
                    onChange={e => setNewExercise(e.target.value)} 
                    placeholder={language === 'en' ? 'New exercise title...' : 'Titre du nouvel exercice...'}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                  <button type="button" onClick={addExercise} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0 1rem', cursor: 'pointer', fontWeight: 600 }}>
                    {language === 'en' ? 'Add' : 'Ajouter'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {studentExercises.map(ex => (
                    <div key={ex.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                        <input 
                          type="checkbox" 
                          checked={ex.completed} 
                          onChange={() => toggleExercise(ex.id)}
                          style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                        />
                        <span style={{ textDecoration: ex.completed ? 'line-through' : 'none', color: ex.completed ? '#94a3b8' : '#374151' }}>{ex.title}</span>
                      </label>
                      <button type="button" onClick={() => removeExercise(ex.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '0.2rem' }}>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {studentExercises.length === 0 && (
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', margin: '1rem 0' }}>{language === 'en' ? 'No exercises assigned yet.' : 'Aucun exercice assigné.'}</p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setSelectedStudentForProgress(null)} style={{ padding: '0.8rem 1.5rem', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                  {t('btn_cancel')}
                </button>
                <button type="submit" disabled={updatingProgress} style={{ padding: '0.8rem 1.5rem', background: updatingProgress ? '#94a3b8' : '#0F3460', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: updatingProgress ? 'not-allowed' : 'pointer' }}>
                  {updatingProgress ? (language === 'en' ? 'Saving...' : 'Enregistrement...') : (language === 'en' ? 'Save' : 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
} catch (renderError) {
  return <div style={{ padding: '2rem', color: 'red' }}><h1>Runtime Error</h1><pre>{renderError.message}</pre><pre>{renderError.stack}</pre></div>;
}
};

export default FormateurDashboard;
