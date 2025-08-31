import { useLocation } from "wouter";
import { useTheme } from "./theme-provider";
import { removeAuthToken } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { setTheme, theme } = useTheme();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const handleLogout = () => {
    removeAuthToken();
    queryClient.clear();
    setLocation("/login");
  };

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Dashboard", key: "dashboard" },
    { path: "/add-task", icon: "fas fa-plus", label: "Add Task", key: "add-task" },
    { path: "/calendar", icon: "fas fa-calendar", label: "Calendar", key: "calendar" },
    { path: "/progress", icon: "fas fa-chart-line", label: "Progress", key: "progress" },
  ];

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-card border-r border-border pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-graduation-cap text-primary-foreground text-sm"></i>
            </div>
            <h1 className="text-xl font-bold text-foreground">StudyFlow</h1>
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="px-4 mb-6">
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-medium text-sm" data-testid="text-user-initials">
                {user ? `${user.firstName[0]}${user.lastName[0]}` : "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate" data-testid="text-user-name">
                {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
              </p>
              <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
                {user?.email || "Loading..."}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                location === item.path || (location === "/" && item.path === "/")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
              data-testid={`button-nav-${item.key}`}
            >
              <i className={`${item.icon} w-5 h-5 mr-3`}></i>
              {item.label}
            </button>
          ))}
        </nav>
        
        {/* Bottom Actions */}
        <div className="px-4 mt-auto space-y-2">
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-accent hover:text-accent-foreground"
            data-testid="button-toggle-theme"
          >
            <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"} w-4 h-4 mr-2`}></i>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-destructive hover:text-destructive-foreground"
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt w-4 h-4 mr-2"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
