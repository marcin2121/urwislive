'use client';

import React, { createContext, useContext, useState } from 'react';

export type PopupState = 'COOKIES' | 'WELCOME' | 'INSTALL_PROMPT' | 'DONE';

interface PopupContextType {
  currentPopup: PopupState;
  nextPopup: () => void;
}

const PopupContext = createContext<PopupContextType>({ currentPopup: 'COOKIES', nextPopup: () => {} });

export const usePopupControl = () => useContext(PopupContext);

export function PopupProvider({ children }: { children: React.ReactNode }) {
  // Kolejka startuje od razu - wcześniej czekała na zdarzenie z intro, którego na desktopie
  // i na podstronach nikt nie wysyłał, więc okno cookies (zgoda na GA) nigdy się nie pojawiało.
  // Cookies pierwsze (wymóg zgody przed analityką), powitanie z samouczkiem tylko w PWA.
  const [currentPopup, setCurrentPopup] = useState<PopupState>('COOKIES');

  const nextPopup = () => {
    setCurrentPopup(prev => {
      // Maszyna stanów okien wejściowych
      if (prev === 'COOKIES') return 'WELCOME';
      if (prev === 'WELCOME') return 'INSTALL_PROMPT';
      return 'DONE';
    });
  };

  return (
    <PopupContext.Provider value={{ currentPopup, nextPopup }}>
      {children}
    </PopupContext.Provider>
  );
}
