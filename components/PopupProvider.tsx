'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type PopupState = 'INTRO' | 'WELCOME' | 'COOKIES' | 'ONBOARDING' | 'INSTALL_PROMPT' | 'DONE';

interface PopupContextType {
  currentPopup: PopupState;
  nextPopup: () => void;
}

const PopupContext = createContext<PopupContextType>({ currentPopup: 'INTRO', nextPopup: () => {} });

export const usePopupControl = () => useContext(PopupContext);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const [currentPopup, setCurrentPopup] = useState<PopupState>('INTRO');

  useEffect(() => {
    const handleIntroFinished = () => {
      setCurrentPopup('WELCOME');
    };
    
    window.addEventListener('urwis_intro_finished', handleIntroFinished);
    
    // Fallback: jeśli intro zakończyło się przed zamontowaniem komponentów lub jest pominęte.
    if (sessionStorage.getItem('urwis_intro_shown') === 'true') {
      setCurrentPopup('WELCOME');
    } else {
      // Domyślnie na starcie jesteśmy w fazie INTRO
      setCurrentPopup('INTRO');
    }

    return () => window.removeEventListener('urwis_intro_finished', handleIntroFinished);
  }, []);

  const nextPopup = () => {
    setCurrentPopup(prev => {
      // Maszyna stanów okien wejściowych
      if (prev === 'WELCOME') return 'COOKIES';
      if (prev === 'COOKIES') return 'ONBOARDING';
      if (prev === 'ONBOARDING') return 'INSTALL_PROMPT';
      return 'DONE';
    });
  };

  return (
    <PopupContext.Provider value={{ currentPopup, nextPopup }}>
      {children}
    </PopupContext.Provider>
  );
}
