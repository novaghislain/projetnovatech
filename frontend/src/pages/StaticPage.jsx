import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useLanguage } from '../contexts/LanguageContext';
import './Home.css';

const StaticPage = ({ slug, defaultTitle }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState(defaultTitle);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/public/pages/${slug}${language === 'en' ? '_en' : ''}`);
        if (response.data) {
          setContent(response.data.content);
          setTitle(response.data.title);
        }
      } catch (err) {
        console.error(`Error fetching static page ${slug}:`, err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug, language]);

  const parseMarkdown = (markdown) => {
    if (!markdown) return '';
    let html = markdown;
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    const paragraphs = html.split(/\n{2,}/);
    return paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<li')) return p;
      return `<p style="margin-bottom: 1rem; line-height: 1.6; color: #444;">${p.replace(/\n/g, '<br/>')}</p>`;
    }).join('');
  };

  return (
    <div className="page-transition">
      <div className="page-top-bar">
        <div className="container">
          <h1>{title}</h1>
        </div>
      </div>
      <div className="container" style={{ padding: '4rem 2rem 5rem', maxWidth: '800px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Chargement...</div>
        ) : (
          <div 
            className="markdown-body"
            style={{
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '2.5rem',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.18)'
            }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
          />
        )}
      </div>
    </div>
  );
};

export default StaticPage;
