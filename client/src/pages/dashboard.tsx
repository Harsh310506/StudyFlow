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
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
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
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground" data-testid="text-greeting">
                  {getGreeting()}, {user?.firstName || "Student"}!
                </h1>
                <p className="mt-1 text-sm text-muted-foreground" data-testid="text-today-date">
                  Today is {formatDate(new Date())}
                </p>
              </div>
              <Button 
                onClick={() => setLocation("/add-task")}
                data-testid="button-add-task"
              >
                <i className="fas fa-plus w-4 h-4 mr-2"></i>
                Add Task
              </Button>
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="px-4 sm:px-6 lg:px-8 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-tasks text-primary text-sm"></i>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Today's Tasks</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-today-total">
                      {todayTasks.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-check text-success text-sm"></i>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-completed">
                      {stats?.completed || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-clock text-warning text-sm"></i>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-pending">
                      {stats?.pending || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                      <i className="fas fa-percentage text-accent-foreground text-sm"></i>
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-completion-rate">
                      {stats?.completionRate || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* All Pending Tasks Section */}
          <div className="px-4 sm:px-6 lg:px-8 mb-8">
            <div className="bg-card rounded-lg border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">All Pending Tasks</h2>
                <p className="text-sm text-muted-foreground">Tasks due today and overall tasks to complete</p>
              </div>
              
              <div className="p-6 space-y-4">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-calendar-check text-muted-foreground text-3xl mb-4"></i>
                    <p className="text-muted-foreground">No tasks for today. Great job!</p>
                  </div>
                ) : (
                  todayTasks.map((task: Task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
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
