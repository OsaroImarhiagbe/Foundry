import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from '../assets/locales/translations.json';



i18n
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources: translations,  // Use the combined translations from the JSON file
    fallbackLng: 'en',
    supportedLngs: ['en', 'es','fr','de','it'] ,       // Fallback language if the current language translation is missing
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    react: {
      useSuspense: false,  // Optional: Add this if you face issues with Suspense (useful for server-side rendering)
    },
  });

export default i18n;
