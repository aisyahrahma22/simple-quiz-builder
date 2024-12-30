import i18next from 'i18next';
import { appWithTranslation } from 'next-i18next';
import { initReactI18next } from 'react-i18next';

i18next.use(initReactI18next);

export default appWithTranslation;
