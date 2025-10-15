'use client';

import { useEffect } from 'react';

export function Preloader() {
  useEffect(() => {
    // Cacher le preloader après le chargement
    const timer = setTimeout(() => {
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 300);
      }
    }, 500); // Petite pause pour l'effet visuel

    return () => clearTimeout(timer);
  }, []);

  return null;
}

