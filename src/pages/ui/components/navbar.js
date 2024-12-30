import Link from 'next/link';
import { useRouter } from 'next/router';
import LanguageSwitcher from '../language';
import { useTranslation } from 'next-i18next';
const Navbar = () => {
  const router = useRouter();
  const currentPath = router.pathname;
  const { t } = useTranslation('common');
   const handleLogout = () => {
    // Clear user session or token
    localStorage.removeItem("userToken");
    // Redirect to the login page
    window.location.href = "/"; // You can also use `router.push('/')` if needed
  };

  return (
    <nav className="bg-gray-800 text-white py-4 shadow-md px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Only show "List Quiz" if the current page is not "List Quiz" */}
          {currentPath !== '/ui/list' && (
            <Link href="/ui/list" className="text-lg hover:text-gray-300">
              {t('Quiz List')}
            </Link>
          )}

          {/* Only show "Take Quiz" if the current page is not "Take Quiz" */}
          {currentPath !== '/ui/take-quiz' && (
            <Link href="/ui/take-quiz" className="text-lg hover:text-gray-300">
              {t('Start Quiz')}
            </Link>
          )}
        </div>
        <LanguageSwitcher />
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
