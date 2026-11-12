import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useApiQuery } from '../hooks/useApiQuery';
import { usePersistentState } from '../hooks/usePersistentState';
import { formatMoney } from '../utils/currency';

const SettingsContext = createContext(null);

const isTheme = (value) => value === 'dark' || value === 'light';
const isCurrency = (value) => value === 'INR' || value === 'USD';

/**
 * Theme (dark/light) and display currency (INR/USD), persisted per browser,
 * plus commercial settings (USD rate, GST rate) from GET /settings.
 */
export function SettingsProvider({ children }) {
  const [theme, setTheme] = usePersistentState('sot:theme', 'dark', isTheme);
  const [currency, setCurrency] = usePersistentState('sot:currency', 'INR', isCurrency);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#030B1F' : '#F6F8FC');
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    [setTheme],
  );

  const settingsQuery = useApiQuery('appSettings');
  const usdRate = settingsQuery.data?.usdRate;
  const gstRate = settingsQuery.data?.gstRate;

  const formatPrice = useCallback((amountInr) => formatMoney(amountInr, currency, usdRate), [currency, usdRate]);

  const value = useMemo(
    () => ({ theme, toggleTheme, currency, setCurrency, formatPrice, usdRate, gstRate, settingsQuery }),
    [theme, toggleTheme, currency, setCurrency, formatPrice, usdRate, gstRate, settingsQuery],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside <SettingsProvider>.');
  return context;
}
