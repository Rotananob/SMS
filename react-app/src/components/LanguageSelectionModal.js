import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import '../index.css';

export default function LanguageSelectionModal({ onClose }) {
  const { language, setLanguage } = useLanguage();

  const handleSelectLanguage = (lang) => {
    setLanguage(lang);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Language / ជ្រើសរើសភាសា</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <button
              onClick={() => handleSelectLanguage('en')}
              style={{
                padding: '2rem',
                borderRadius: '12px',
                border: language === 'en' ? '3px solid var(--primary)' : '2px solid var(--border-color)',
                background: language === 'en' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--text-main)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            >
              🇺🇸 English
            </button>
            <button
              onClick={() => handleSelectLanguage('km')}
              style={{
                padding: '2rem',
                borderRadius: '12px',
                border: language === 'km' ? '3px solid var(--primary)' : '2px solid var(--border-color)',
                background: language === 'km' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--text-main)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            >
              🇰🇭 ខ្មែរ
            </button>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Current: {language === 'en' ? 'English' : 'Khmer'}
          </p>
        </div>
      </div>
    </div>
  );
}
