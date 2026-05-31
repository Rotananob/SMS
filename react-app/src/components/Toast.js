import React, { useState, useEffect } from 'react';
import '../index.css';

export default function Toast({ message, type, duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast ${type}`}>
      <i className={`fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
      <span>{message}</span>
    </div>
  );
}
