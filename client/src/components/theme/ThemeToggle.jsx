import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const Icon = isDark ? Sun : Moon;

  return (
    <button className="btn btn-ghost" onClick={toggleTheme} title="Toggle theme">
      <Icon size={18} />
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
};

export default ThemeToggle;
