import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Task } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: todayTasks = [], isLoading: todayLoading } = useQuery({
    queryKey: ["/api/tasks/today"],
    queryFn: async () => {
      const response = await fetch("/api/tasks/today", {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: upcomingTasks = [] } = useQuery({
    queryKey: ["/api/tasks/upcoming"],
    queryFn: async () => {
      const response = await fetch("/api/tasks/upcoming?days=7", {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/tasks/stats"],
    queryFn: async () => {
      const response = await fetch("/api/tasks/stats", {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const groupUpcomingTasks = (tasks: Task[]) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tomorrowTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate).toDateString() === tomorrow.toDateString()
    );
    
    const thisWeekTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate > tomorrow && taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    });

    return { tomorrowTasks, thisWeekTasks };
  };

  const { tomorrowTasks, thisWeekTasks } = groupUpcomingTasks(upcomingTasks);

  if (todayLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-t-purple-500 border-r-blue-500 border-b-emerald-500 border-l-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold gradient-text">Loading StudyFlow</p>
            <p className="text-muted-foreground text-sm">Preparing your personalized dashboard...</p>
          </div>
          <div className="flex justify-center space-x-1 mt-6">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <MobileHeader />
        
        <main className="flex-1 overflow-y-auto bg-background">
          {/* Header Section */}
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold gradient-text slide-in-up" data-testid="text-greeting">
                      {getGreeting()}, {user?.firstName || "Student"}!
                    </h1>
                    <p className="mt-2 text-muted-foreground slide-in-up" style={{animationDelay: '0.1s'}} data-testid="text-today-date">
                      Today is {formatDate(new Date())}
                    </p>
                  </div>
                  <button 
                    onClick={() => setLocation("/add-task")}
                    className="btn-gradient px-6 py-3 rounded-xl font-semibold transition-all duration-300 slide-in-up"
                    style={{animationDelay: '0.2s'}}
                    data-testid="button-add-task"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stats-card p-5 card-hover slide-in-up" style={{animationDelay: '0.1s'}}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="fas fa-calendar-day text-white text-lg"></i>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000" style={{width: `${Math.min((todayTasks.length / Math.max(stats?.total || 1, 1)) * 100, 100)}%`}}></div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Today's Tasks</p>
                  <p className="text-2xl font-bold text-foreground number-counter" data-testid="stat-today-total">
                    {todayTasks.length}
                  </p>
                </div>
              </div>
              
              <div className="stats-card p-5 card-hover slide-in-up" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="fas fa-check-circle text-white text-lg"></i>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" style={{width: `${((stats?.completed || 0) / Math.max(stats?.total || 1, 1)) * 100}%`}}></div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-2xl font-bold text-foreground number-counter" data-testid="stat-completed">
                    {stats?.completed || 0}
                  </p>
                </div>
              </div>
              
              <div className="stats-card p-5 card-hover slide-in-up" style={{animationDelay: '0.3s'}}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="fas fa-hourglass-half text-white text-lg"></i>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000" style={{width: `${((stats?.pending || 0) / Math.max(stats?.total || 1, 1)) * 100}%`}}></div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pending</p>
                  <p className="text-2xl font-bold text-foreground number-counter" data-testid="stat-pending">
                    {stats?.pending || 0}
                  </p>
                </div>
              </div>
              
              <div className="stats-card p-5 card-hover slide-in-up" style={{animationDelay: '0.4s'}}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className="fas fa-chart-line text-white text-lg"></i>
                  </div>
                  <div className="text-right">
                    <div className="w-12 h-12 relative">
                      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke="url(#gradient-progress)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${((stats?.completionRate || 0) / 100) * 125.664} 125.664`} className="transition-all duration-1000" />
                        <defs>
                          <linearGradient id="gradient-progress" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Progress</p>
                  <p className="text-2xl font-bold text-foreground number-counter" data-testid="stat-completion-rate">
                    {stats?.completionRate || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* All Pending Tasks Section */}
          <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="stats-card border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 fade-in" style={{animationDelay: '0.5s'}}>
              <div className="px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <i className="fas fa-calendar-day text-white text-lg"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Today's Focus</h2>
                    <p className="text-sm text-muted-foreground">Tasks due today and overall priorities</p>
                  </div>
                  <div className="ml-auto flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg pulse-animation">
                      <i className="fas fa-trophy text-2xl text-white"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      🎉 All caught up!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      No tasks for today. Time to celebrate your productivity!
                    </p>
                    <button 
                      onClick={() => setLocation("/add-task")}
                      className="btn-gradient px-6 py-3 rounded-xl font-semibold"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Plan ahead
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayTasks.map((task: Task, index: number) => (
                      <div key={task.id} className="slide-in-up" style={{animationDelay: `${0.1 * index}s`}}>
                        <TaskCard task={task} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Upcoming Tasks */}
          <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="bg-card rounded-lg border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Upcoming Tasks</h2>
                <p className="text-sm text-muted-foreground">Tasks scheduled for the next few days</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  {/* Tomorrow */}
                  {tomorrowTasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Tomorrow</h3>
                      <div className="space-y-3">
                        {tomorrowTasks.map((task: Task) => (
                          <div key={task.id} className={`task-card priority-${task.priority} bg-background rounded-lg border border-border p-3`}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                task.priority === 'high' ? 'bg-destructive' : 
                                task.priority === 'medium' ? 'bg-warning' : 'bg-success'
                              }`}></div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
                                {task.dueTime && (
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(`2000-01-01T${task.dueTime}`).toLocaleTimeString([], { 
                                      hour: 'numeric', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* This Week */}
                  {thisWeekTasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">This Week</h3>
                      <div className="space-y-3">
                        {thisWeekTasks.map((task: Task) => (
                          <div key={task.id} className={`task-card priority-${task.priority} bg-background rounded-lg border border-border p-3`}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${
                                task.priority === 'high' ? 'bg-destructive' : 
                                task.priority === 'medium' ? 'bg-warning' : 'bg-success'
                              }`}></div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {task.dueDate && new Date(task.dueDate).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                  {task.dueTime && ` - ${new Date(`2000-01-01T${task.dueTime}`).toLocaleTimeString([], { 
                                    hour: 'numeric', 
                                    minute: '2-digit' 
                                  })}`}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {tomorrowTasks.length === 0 && thisWeekTasks.length === 0 && (
                    <div className="text-center py-8">
                      <i className="fas fa-calendar-plus text-muted-foreground text-3xl mb-4"></i>
                      <p className="text-muted-foreground">No upcoming tasks scheduled.</p>
                      <Button 
                        onClick={() => setLocation("/add-task")} 
                        className="mt-4"
                        data-testid="button-add-first-task"
                      >
                        Add Your First Task
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
