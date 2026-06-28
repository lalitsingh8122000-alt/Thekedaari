import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('hi');

  useEffect(() => {
    AsyncStorage.getItem('thekedaar_lang').then((saved) => {
      if (saved && translations[saved]) setLang(saved);
    });
  }, []);

  const switchLang = (l) => {
    setLang(l);
    AsyncStorage.setItem('thekedaar_lang', l);
  };

  const t = (key) => translations[lang]?.[key] || translations.hi[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
