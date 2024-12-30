import { useTranslation } from 'next-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  if (!i18n || typeof i18n.changeLanguage !== 'function') {
    console.error('i18n is not properly configured.');
    return null; // Atau tampilkan fallback UI
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang).catch(console.error); // Tambahkan catch untuk debug
  };

  return (
    <div>
      <button onClick={() => handleLanguageChange('en')}>Eng</button>
      <br />
      <button onClick={() => handleLanguageChange('ar')}>Arab</button>
    </div>
  );
};

export default LanguageSwitcher;
