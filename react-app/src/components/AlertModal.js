import React from 'react';
import '../index.css';

export default function AlertModal({ title, message, type = 'info', onConfirm, onCancel, buttons = ['OK'] }) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return 'var(--success)';
      case 'error':
        return 'var(--danger)';
      case 'warning':
        return 'var(--warning)';
      case 'info':
      default:
        return 'var(--primary)';
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div 
        className="modal alert-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px' }}
      >
        <div className="modal-body" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
          <i 
            className={getIcon()} 
            style={{ 
              fontSize: '3.5rem', 
              color: getColor(),
              marginBottom: '1.5rem',
              display: 'block'
            }}
          ></i>
          
          {title && (
            <h3 style={{ 
              fontSize: '1.4rem', 
              fontWeight: '700',
              marginBottom: '0.75rem',
              color: 'var(--text-main)'
            }}>
              {title}
            </h3>
          )}
          
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            {message}
          </p>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center', gap: '1rem' }}>
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              className={`btn ${btn.toLowerCase() === 'cancel' || btn.toLowerCase() === 'no' ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => {
                if (btn.toLowerCase() === 'cancel' || btn.toLowerCase() === 'no') {
                  onCancel?.();
                } else {
                  onConfirm?.();
                }
              }}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
