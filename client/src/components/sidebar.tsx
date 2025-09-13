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
    { path: "/add-task", icon: "fas fa-plus-circle", label: "Add Task", key: "add-task" },
    { path: "/calendar", icon: "fas fa-calendar-alt", label: "Calendar", key: "calendar" },
    { path: "/password-manager", icon: "fas fa-shield-alt", label: "Password Manager", key: "password-manager" },
    { path: "/notes", icon: "fas fa-sticky-note", label: "Notes Manager", key: "notes" },
    { path: "/progress", icon: "fas fa-chart-line", label: "Progress", key: "progress" },
  ];

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
      <div className="flex flex-col flex-grow bg-card border-r border-border pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-bullseye text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Focusly</h1>
              <p className="text-xs text-muted-foreground font-medium">Focus. Achieve. Succeed.</p>
            </div>
          </div>
        </div>
        <div className="px-4">
          <p className="text-xs text-muted-foreground">Student Dashboard</p>
        </div>

        {/* User Profile Section */}
        <div className="px-4 mb-6">
          <div className="bg-accent border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-primary-foreground font-semibold text-sm" data-testid="text-user-initials">
                    {user ? `${user.firstName[0]}${user.lastName[0]}` : "?"}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate" data-testid="text-user-name">
                  {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                </p>
                <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">
                  {user?.email || "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`sidebar-item w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                location === item.path || (location === "/" && item.path === "/")
                  ? "active bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              data-testid={`button-nav-${item.key}`}
            >
              <i className={`${item.icon} mr-3 w-5`}></i>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Bottom Actions */}
        <div className="px-4 mt-auto space-y-3">
          <div className="border-t border-border pt-4">
            <button 
              onClick={toggleDarkMode}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-muted-foreground rounded-lg hover:bg-accent hover:text-foreground transition-colors"
              data-testid="button-toggle-theme"
            >
              <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"} mr-3 w-5`}></i>
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt mr-3 w-5"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
