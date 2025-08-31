import { useTheme } from "./theme-provider";

export function MobileHeader() {
  const { setTheme, theme } = useTheme();

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="lg:hidden flex items-center justify-between bg-card border-b border-border px-4 py-3">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-bold text-foreground">StudyFlow</h1>
      </div>
      <button 
        onClick={toggleDarkMode}
        className="p-2 rounded-md text-muted-foreground hover:bg-accent"
        data-testid="button-mobile-theme-toggle"
      >
        <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"} w-5 h-5`}></i>
      </button>
    </div>
  );
}
