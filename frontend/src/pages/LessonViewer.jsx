import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronDown, ChevronRight, ChevronLeft, ChevronLast, BookOpen,
  Play, FileText, CheckCircle, Circle, Menu, X, ArrowLeft
} from 'lucide-react';
import AdBanner from '../components/AdBanner';

const LessonViewer = () => {
  const { courseId } = useParams();

  const [structure, setStructure] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [progress, setProgress] = useState({ total: 0, completed: 0, percent: 0 });
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('nv_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [courseRes, structRes, progRes] = await Promise.all([
          fetch(`${API_URL}/api/public/formations/${courseId}`),
          fetch(`${API_URL}/api/courses/${courseId}/structure`, { headers }),
          fetch(`${API_URL}/api/progress/courses/${courseId}`, { headers }),
        ]);

        if (courseRes.ok) setCourse(await courseRes.json());
        if (structRes.ok) {
          const data = await structRes.json();
          setStructure(data);
          const firstLesson = findFirstLesson(data);
          if (firstLesson) {
            setCurrentLesson(firstLesson);
            expandToLesson(data, firstLesson, setExpandedModules, setExpandedChapters);
          }
        }
        if (progRes.ok) {
          const progData = await progRes.json();
          setCompletedIds(new Set(progData.completedIds));
          setProgress({ total: progData.total, completed: progData.completed, percent: progData.progress });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  useEffect(() => {
    if (!currentLesson) return;
    setQuizQuestions([]);
    setQuizAnswers({});
    setQuizResult(null);
    const fetchQuiz = async () => {
      setQuizLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/quiz/${currentLesson.id}`);
        if (res.ok) {
          const data = await res.json();
          setQuizQuestions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setQuizLoading(false);
      }
    };
    fetchQuiz();
  }, [currentLesson]);

  const findFirstLesson = (modules) => {
    for (const m of modules)
      for (const c of m.chapters)
        if (c.lessons.length > 0) return c.lessons[0];
    return null;
  };

  const expandToLesson = (modules, lesson, setMod, setCh) => {
    for (const m of modules)
      for (const c of m.chapters)
        if (c.lessons.some(l => l.id === lesson.id)) {
          setMod(prev => new Set([...prev, m.id]));
          setCh(prev => new Set([...prev, c.id]));
          return;
        }
  };

  const getAllLessons = () => {
    const lessons = [];
    for (const m of structure)
      for (const c of m.chapters)
        for (const l of c.lessons) lessons.push(l);
    return lessons;
  };

  const navigateLesson = (direction) => {
    const lessonsList = getAllLessons();
    const idx = lessonsList.findIndex(l => l.id === currentLesson?.id);
    if (idx === -1) return;
    const target = direction === 'prev' && idx > 0
      ? lessonsList[idx - 1]
      : direction === 'next' && idx < lessonsList.length - 1
        ? lessonsList[idx + 1] : null;
    if (target) {
      setCurrentLesson(target);
      expandToLesson(structure, target, setExpandedModules, setExpandedChapters);
    }
  };

  const toggleComplete = async () => {
    if (!currentLesson) return;
    const token = localStorage.getItem('nv_token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    try {
      if (completedIds.has(currentLesson.id)) {
        setCompletedIds(prev => { const n = new Set(prev); n.delete(currentLesson.id); return n; });
        setProgress(p => ({ ...p, completed: p.completed - 1, percent: p.total > 0 ? Math.round(((p.completed - 1) / p.total) * 100) : 0 }));
      } else {
        await fetch(`${API_URL}/api/progress/lessons/${currentLesson.id}/complete`, {
          method: 'POST', headers,
          body: JSON.stringify({ courseId: parseInt(courseId) }),
        });
        setCompletedIds(prev => new Set([...prev, currentLesson.id]));
        setProgress(p => ({ ...p, completed: p.completed + 1, percent: p.total > 0 ? Math.round(((p.completed + 1) / p.total) * 100) : 0 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitQuiz = async () => {
    if (!currentLesson || quizQuestions.length === 0) return;
    setQuizSubmitting(true);
    const token = localStorage.getItem('nv_token');
    try {
      const answers = quizQuestions.map(q => ({
        questionId: q.id,
        answer: quizAnswers[q.id] ?? -1
      }));
      const res = await fetch(`${API_URL}/api/quiz/${currentLesson.id}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) {
        const result = await res.json();
        setQuizResult(result);
        if (result.passed && !completedIds.has(currentLesson.id)) {
          await fetch(`${API_URL}/api/progress/lessons/${currentLesson.id}/complete`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId: parseInt(courseId) }),
          });
          setCompletedIds(prev => new Set([...prev, currentLesson.id]));
          setProgress(p => ({ ...p, completed: p.completed + 1, percent: p.total > 0 ? Math.round(((p.completed + 1) / p.total) * 100) : 0 }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuizSubmitting(false);
    }
  };

  const toggleModule = (id) => {
    setExpandedModules(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleChapter = (id) => {
    setExpandedChapters(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const selectLesson = (lesson) => {
    setCurrentLesson(lesson);
    expandToLesson(structure, lesson, setExpandedModules, setExpandedChapters);
    if (window.innerWidth < 900) setSidebarOpen(false);
  };

  const lessonsList = getAllLessons();
  const currentIdx = lessonsList.findIndex(l => l.id === currentLesson?.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < lessonsList.length - 1;
  const isCurrentCompleted = currentLesson && completedIds.has(currentLesson.id);
  const isVideo = currentLesson?.type === 'video';
  const isPdf = currentLesson?.type === 'pdf';
  const contentUrl = currentLesson?.contentUrl;

  const lessonIcon = (type, completed) => {
    if (completed) return <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />;
    if (type === 'video') return <Play size={16} style={{ flexShrink: 0 }} />;
    if (type === 'pdf') return <FileText size={16} style={{ flexShrink: 0 }} />;
    return <BookOpen size={16} style={{ flexShrink: 0 }} />;
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Chargement du cours...</div>
    </div>
  );

  if (!course) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <h2 style={{ color: 'var(--color-primary)' }}>Cours introuvable</h2>
      <Link to="/mon-espace" className="btn btn-primary" style={{ marginTop: '1rem' }}>Retour à mon espace</Link>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', backgroundColor: '#f8fafc' }}>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed', bottom: '1.5rem', left: '1.5rem', zIndex: 50,
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'var(--grad-accent)', color: 'white', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', boxShadow: 'var(--shadow-lg)',
        }}
      >
        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* SIDEBAR */}
      <div style={{
        width: sidebarOpen ? '340px' : '0px',
        minWidth: sidebarOpen ? '340px' : '0px',
        overflow: 'hidden', transition: 'width 0.3s, min-width 0.3s',
        backgroundColor: 'white', borderRight: '1px solid #e5e7eb',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} /> {course.title}
          </h3>
          <div style={{ marginTop: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
              <span>{progress.completed}/{progress.total} leçons</span>
              <span>{progress.percent}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: '#10b981', borderRadius: '3px', transition: 'width 0.4s', width: `${progress.percent}%` }} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {structure.map(mod => (
            <div key={mod.id}>
              <button
                onClick={() => toggleModule(mod.id)}
                style={{
                  width: '100%', textAlign: 'left', padding: '0.8rem 1.2rem',
                  border: 'none', background: expandedModules.has(mod.id) ? '#f1f5f9' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)',
                }}
              >
                {expandedModules.has(mod.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {mod.title}
              </button>

              {expandedModules.has(mod.id) && mod.chapters.map(ch => (
                <div key={ch.id}>
                  <button
                    onClick={() => toggleChapter(ch.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '0.5rem 1.2rem 0.5rem 2.5rem',
                      border: 'none', background: expandedChapters.has(ch.id) ? '#f8fafc' : 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-muted)',
                    }}
                  >
                    {expandedChapters.has(ch.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {ch.title}
                  </button>

                  {expandedChapters.has(ch.id) && ch.lessons.map(lesson => {
                    const completed = completedIds.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '0.6rem 1.2rem 0.6rem 3.8rem',
                          border: 'none',
                          background: currentLesson?.id === lesson.id ? '#eff6ff' : 'transparent',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          gap: '0.6rem', fontSize: '0.85rem',
                          color: completed ? '#10b981' : (currentLesson?.id === lesson.id ? '#0F3460' : 'var(--color-text-muted)'),
                          fontWeight: currentLesson?.id === lesson.id ? 700 : 400,
                          borderLeft: currentLesson?.id === lesson.id ? '3px solid #0F3460' : '3px solid transparent',
                        }}
                      >
                        {lessonIcon(lesson.type, completed)}
                        <span style={{ flex: 1 }}>{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <AdBanner placement="sidebar" />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', minWidth: 0 }}>
        <AdBanner placement="header" />
        <Link to="/mon-espace" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          color: 'var(--color-text-muted)', textDecoration: 'none',
          fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600
        }}>
          <ArrowLeft size={16} /> Retour à mon espace
        </Link>

        {currentLesson ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '0.3rem' }}>
                  {isCurrentCompleted && <CheckCircle size={22} style={{ color: '#10b981', display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />}
                  {currentLesson.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  {lessonIcon(currentLesson.type, false)}
                  <span>{currentLesson.type === 'video' ? 'Vidéo' : currentLesson.type === 'pdf' ? 'PDF' : 'Leçon'}</span>
                  <span>·</span>
                  <span>Leçon {currentIdx + 1} / {lessonsList.length}</span>
                </div>
              </div>
              <button
                onClick={toggleComplete}
                className="btn"
                style={{
                  padding: '0.6rem 1.2rem', fontSize: '0.85rem', whiteSpace: 'nowrap',
                  background: isCurrentCompleted ? '#ecfdf5' : '#f1f5f9',
                  color: isCurrentCompleted ? '#10b981' : 'var(--color-text-muted)',
                  border: isCurrentCompleted ? '1px solid #10b981' : '1px solid #e5e7eb',
                }}
              >
                {isCurrentCompleted ? <><CheckCircle size={16} /> Terminée</> : <><Circle size={16} /> Marquer comme terminée</>}
              </button>
            </div>

            <div style={{
              backgroundColor: 'white', borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)',
              overflow: 'hidden', marginBottom: '1.5rem',
            }}>
              {isVideo && contentUrl && (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={contentUrl}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen allow="autoplay; encrypted-media"
                    title={currentLesson.title}
                  />
                </div>
              )}
              {isPdf && contentUrl && (
                <div style={{ position: 'relative', paddingBottom: '75%', height: 0 }}>
                  <iframe
                    src={contentUrl}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    title={currentLesson.title}
                  />
                </div>
              )}
              {!isVideo && !isPdf && (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                  <p>Cette leçon n'a pas encore de contenu multimédia.</p>
                </div>
              )}
            </div>

            {/* QUIZ */}
            {quizQuestions.length > 0 && (
              <div style={{
                backgroundColor: 'white', borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)',
                padding: '2rem', marginBottom: '1.5rem',
              }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary)', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={20} /> Quiz d'évaluation
                </h3>

                {quizResult ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '80px', height: '80px', borderRadius: '50%',
                      background: quizResult.passed ? '#dcfce7' : '#fef2f2',
                      marginBottom: '1rem',
                    }}>
                      <span style={{ fontSize: '2rem', fontWeight: 800, color: quizResult.passed ? '#15803d' : '#dc2626' }}>
                        {quizResult.score}%
                      </span>
                    </div>
                    <h4 style={{ color: quizResult.passed ? '#15803d' : '#dc2626', margin: '0 0 0.5rem 0' }}>
                      {quizResult.passed ? '✅ Quiz réussi !' : '❌ Quiz échoué'}
                    </h4>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>
                      {quizResult.correctCount}/{quizResult.total} bonnes réponses
                      {quizResult.passed ? ' — Leçon marquée comme terminée.' : ' — Minimum 70% requis, réessaye.'}
                    </p>
                    {!quizResult.passed && (
                      <button onClick={() => { setQuizResult(null); setQuizAnswers({}); }} className="btn btn-outline" style={{ marginTop: '1rem' }}>
                        Réessayer le quiz
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {quizQuestions.map((q, qi) => (
                      <div key={q.id} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: qi < quizQuestions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <p style={{ fontWeight: 700, color: '#1A1A2E', marginBottom: '0.8rem', fontSize: '0.95rem' }}>
                          {qi + 1}. {q.question}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {q.options.map((opt, oi) => (
                            <label key={oi} style={{
                              display: 'flex', alignItems: 'center', gap: '0.7rem',
                              padding: '0.7rem 1rem', borderRadius: '8px',
                              background: quizAnswers[q.id] === oi ? '#eff6ff' : '#f8fafc',
                              border: quizAnswers[q.id] === oi ? '2px solid #3b82f6' : '2px solid transparent',
                              cursor: 'pointer', transition: 'all 0.15s', fontSize: '0.9rem', fontWeight: 500,
                            }}>
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                checked={quizAnswers[q.id] === oi}
                                onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: oi }))}
                                style={{ accentColor: '#3b82f6' }}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={submitQuiz}
                      disabled={quizSubmitting || Object.keys(quizAnswers).length < quizQuestions.length}
                      className="btn btn-primary"
                      style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
                    >
                      {quizSubmitting ? 'Correction...' : 'Soumettre mes réponses'}
                    </button>
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => navigateLesson('prev')}
                disabled={!hasPrev}
                className="btn btn-outline"
                style={{ visibility: hasPrev ? 'visible' : 'hidden', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <ChevronLeft size={18} /> Leçon précédente
              </button>

              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                {currentIdx + 1} / {lessonsList.length}
              </div>

              <button
                onClick={() => navigateLesson('next')}
                disabled={!hasNext}
                className="btn btn-primary"
                style={{ visibility: hasNext ? 'visible' : 'hidden', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Leçon suivante <ChevronLast size={18} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <BookOpen size={64} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <h2 style={{ color: 'var(--color-primary)' }}>Ce cours n'a pas encore de contenu</h2>
            <p>Aucune leçon n'a été ajoutée pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonViewer;
