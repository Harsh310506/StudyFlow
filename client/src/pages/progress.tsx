import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { Task } from "@shared/schema";

export default function Progress() {
  const { data: stats } = useQuery({
    queryKey: ["/api/tasks/stats"],
    queryFn: async () => {
      const response = await fetch("/api/tasks/stats", {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks", {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const getWeeklyProgress = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);

    return days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      
      const dayTasks = allTasks.filter((task: Task) => 
        task.dueDate && new Date(task.dueDate).toDateString() === date.toDateString()
      );
      
      const completed = dayTasks.filter((task: Task) => task.completionStatus === 'complete').length;
      const total = dayTasks.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return { day, percentage, completed, total };
    });
  };

  const getCategoryBreakdown = () => {
    const categories = ['assignment', 'exam', 'project', 'personal'];
    
    return categories.map(category => {
      const count = allTasks.filter((task: Task) => task.category === category).length;
      return { category, count };
    });
  };

  const getRecentActivity = () => {
    return allTasks
      .filter((task: Task) => task.completionStatus === 'complete')
      .sort((a: Task, b: Task) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime())
      .slice(0, 5);
  };

  const weeklyProgress = getWeeklyProgress();
  const categoryBreakdown = getCategoryBreakdown();
  const recentActivity = getRecentActivity();

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <Sidebar />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <MobileHeader />
        
        <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Progress & Statistics</h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">Track your productivity and task completion rates</p>
            </div>
            
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-tasks text-primary text-sm sm:text-base"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-total-tasks">
                      {stats?.total || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-check-circle text-success"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-total-completed">
                      {stats?.completed || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clock text-warning"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-total-pending">
                      {stats?.pending || 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-percentage text-accent-foreground"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-success-rate">
                      {stats?.completionRate || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Weekly Progress */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Progress</h3>
                <div className="space-y-4">
                  {weeklyProgress.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{day.day}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              day.percentage >= 80 ? 'bg-success' : 
                              day.percentage >= 50 ? 'bg-warning' : 'bg-destructive'
                            }`}
                            style={{ width: `${day.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-foreground" data-testid={`progress-${day.day.toLowerCase()}`}>
                          {day.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Category Breakdown */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Tasks by Category</h3>
                <div className="space-y-4">
                  {categoryBreakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.category === 'assignment' ? 'bg-primary' :
                          item.category === 'exam' ? 'bg-destructive' :
                          item.category === 'project' ? 'bg-warning' : 'bg-success'
                        }`}></div>
                        <span className="text-sm text-foreground capitalize">{item.category}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground" data-testid={`category-${item.category}-count`}>
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-card rounded-lg border border-border">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
              </div>
              <div className="p-6">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-history text-muted-foreground text-3xl mb-4"></i>
                    <p className="text-muted-foreground">No recent activity yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((task: Task, index: number) => (
                      <div key={task.id} className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                          <i className="fas fa-check text-success text-xs"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">
                            Completed <strong>{task.title}</strong>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {task.updatedAt && new Date(task.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
