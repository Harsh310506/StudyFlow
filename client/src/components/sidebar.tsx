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
    { path: "/password-manager", icon: "fas fa-shield-alt", label: "Password Manager", key: "password-manager" },
    { path: "/notes", icon: "fas fa-file-text", label: "Notes Manager", key: "notes" },
    { path: "/progress", icon: "fas fa-chart-line", label: "Progress", key: "progress" },
  ];

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow glass-effect border-r border-gray-200/30 dark:border-gray-700/30 pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <i className="fas fa-graduation-cap text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">StudyFlow</h1>
              <p className="text-xs text-muted-foreground">Student Dashboard</p>
            </div>
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="px-4 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-sm" data-testid="text-user-initials">
                      {user ? `${user.firstName[0]}${user.lastName[0]}` : "?"}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
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
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`sidebar-item w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                location === item.path || (location === "/" && item.path === "/")
                  ? "active bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : "text-muted-foreground hover:bg-white/70 dark:hover:bg-gray-800/70 hover:text-foreground hover:shadow-md"
              } slide-in-up`}
              style={{animationDelay: `${0.1 * index}s`}}
              data-testid={`button-nav-${item.key}`}
            >
              <i className={`${item.icon} w-5 h-5 mr-3`}></i>
              <span className="truncate">{item.label}</span>
              {(location === item.path || (location === "/" && item.path === "/")) && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>
        
        {/* Bottom Actions */}
        <div className="px-4 mt-auto space-y-3">
          <div className="border-t border-gray-200/30 dark:border-gray-700/30 pt-4">
            <button 
              onClick={toggleDarkMode}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:bg-white/70 dark:hover:bg-gray-800/70 hover:text-foreground transition-all duration-200 hover:shadow-md"
              data-testid="button-toggle-theme"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"} text-white text-sm`}></i>
              </div>
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-muted-foreground rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 hover:shadow-md"
              data-testid="button-logout"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-sign-out-alt text-white text-sm"></i>
              </div>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
