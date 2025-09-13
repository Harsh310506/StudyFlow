import { useState } from "react";
import { useLocation } from "wouter";
import { useTheme } from "./theme-provider";
import { removeAuthToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";

export function MobileHeader() {
  const [location, setLocation] = useLocation();
  const { setTheme, theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const queryClient = useQueryClient();

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    removeAuthToken();
    queryClient.clear();
    setLocation("/login");
    setIsMenuOpen(false);
  };

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Dashboard", key: "dashboard" },
    { path: "/add-task", icon: "fas fa-plus-circle", label: "Add Task", key: "add-task" },
    { path: "/calendar", icon: "fas fa-calendar-alt", label: "Calendar", key: "calendar" },
    { path: "/password-manager", icon: "fas fa-shield-alt", label: "Password Manager", key: "password-manager" },
    { path: "/notes", icon: "fas fa-sticky-note", label: "Notes Manager", key: "notes" },
    { path: "/progress", icon: "fas fa-chart-line", label: "Progress", key: "progress" },
  ];

  const handleNavigation = (path: string) => {
    setLocation(path);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between bg-card border-b border-border px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <i className="fas fa-bullseye text-white text-sm"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Focusly</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-muted-foreground hover:bg-accent transition-colors"
            data-testid="button-mobile-theme-toggle"
            aria-label="Toggle theme"
          >
            <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md text-muted-foreground hover:bg-accent transition-colors"
            data-testid="button-mobile-menu"
            aria-label="Toggle menu"
          >
            <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="lg:hidden fixed right-0 top-[73px] bottom-0 w-80 max-w-[90vw] bg-card border-l border-border z-50 overflow-y-auto">
            <div className="p-4">
              {/* Navigation Items */}
              <nav className="space-y-2 mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Navigation</h3>
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      location === item.path || (location === "/" && item.path === "/")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                    data-testid={`button-mobile-nav-${item.key}`}
                  >
                    <i className={`${item.icon} mr-3 w-5`}></i>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <div className="border-t border-border pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  data-testid="button-mobile-logout"
                >
                  <i className="fas fa-sign-out-alt mr-3 w-5"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
