import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageSelectionModal from './LanguageSelectionModal';
import '../index.css';

export default function LanguageSwitcher() {
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        className="topbar-icon-btn language-switcher"
        onClick={() => setShowModal(true)}
        title="Select Language"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '2px solid var(--primary)',
          cursor: 'pointer',
          transition: 'var(--transition)',
          fontSize: '0.95rem',
          fontWeight: '600'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(99, 102, 241, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(99, 102, 241, 0.1)';
        }}
      >
        <i className="fas fa-globe"></i>
        <span style={{ minWidth: '2.5rem' }}>
          {language === 'en' ? 'EN' : 'KH'}
        </span>
      </button>

      {showModal && <LanguageSelectionModal onClose={() => setShowModal(false)} />}
    </>
  );
}
