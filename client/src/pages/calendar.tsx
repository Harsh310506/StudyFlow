import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { Task } from "@shared/schema";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: allTasks = [] } = useQuery({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks", {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const { data: selectedDateTasks = [] } = useQuery({
    queryKey: ["/api/tasks/date", selectedDate?.toISOString().split('T')[0]],
    enabled: !!selectedDate,
    queryFn: async () => {
      if (!selectedDate) return [];
      const response = await fetch(`/api/tasks/date/${selectedDate.toISOString().split('T')[0]}`, {
        headers: getAuthHeaders(),
      });
      return response.json();
    },
  });

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getTasksForDate = (date: Date) => {
    return allTasks.filter((task: Task) => 
      task.dueDate && new Date(task.dueDate).toDateString() === date.toDateString()
    );
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const calendarDays = getCalendarDays();
  const today = new Date();

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <MobileHeader />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center">
                    <i className="fas fa-calendar text-primary mr-3"></i>
                    Calendar View
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">Track your tasks across dates with visual indicators</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={previousMonth}
                    data-testid="button-previous-month"
                    className="hover:bg-accent"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </Button>
                  <h2 className="text-lg font-semibold text-foreground min-w-[200px] text-center" data-testid="text-current-month">
                    {formatMonth(currentDate)}
                  </h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={nextMonth}
                    data-testid="button-next-month"
                    className="hover:bg-accent"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Calendar Grid */}
            <div className="bg-card rounded-lg border border-border overflow-hidden mb-8">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 bg-muted">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="px-3 py-4 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Body */}
              <div className="grid grid-cols-7 divide-x divide-border">
                {calendarDays.map((day, index) => {
                  const tasksForDay = getTasksForDate(day);
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isToday = day.toDateString() === today.toDateString();
                  const isSelected = selectedDate?.toDateString() === day.toDateString();
                  
                  return (
                    <div 
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`calendar-day h-24 p-2 border-b border-border cursor-pointer transition-colors ${
                        !isCurrentMonth ? 'bg-muted/30' : 
                        isSelected ? 'bg-primary text-primary-foreground' :
                        isToday ? 'bg-accent' : 'hover:bg-accent'
                      } ${tasksForDay.length > 0 ? 'has-task-indicators' : ''}`}
                      data-testid={`calendar-day-${day.toISOString().split('T')[0]}`}
                    >
                      <span className={`text-sm ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'} ${
                        isSelected || (tasksForDay.length > 0 && isCurrentMonth) ? 'font-medium' : ''
                      }`}>
                        {day.getDate()}
                      </span>
                      
                      {tasksForDay.length > 0 && isCurrentMonth && (
                        <div className="mt-2 space-y-1">
                          {tasksForDay.slice(0, 3).map((task: Task, taskIndex: number) => (
                            <div 
                              key={task.id}
                              className={`task-indicator-bar w-full h-1.5 rounded-full ${
                                task.priority === 'high' ? 'bg-destructive' :
                                task.priority === 'medium' ? 'bg-warning' : 'bg-success'
                              }`}
                              style={{animationDelay: `${taskIndex * 0.1}s`}}
                            />
                          ))}
                          {tasksForDay.length > 3 && (
                            <div className="text-xs text-center text-muted-foreground font-medium mt-1">
                              +{tasksForDay.length - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Selected Date Tasks */}
            {selectedDate && (
              <div className="bg-card rounded-lg border border-border fade-in">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-lg font-semibold text-foreground flex items-center">
                    <i className="fas fa-calendar-day text-primary mr-3"></i>
                    Tasks for {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                </div>
                <div className="p-6">
                  {selectedDateTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-calendar-plus text-muted-foreground text-xl"></i>
                      </div>
                      <h4 className="text-base font-medium text-foreground mb-2">No tasks scheduled</h4>
                      <p className="text-muted-foreground text-sm">This day is free - perfect for spontaneous activities!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateTasks.map((task: Task, index: number) => (
                        <div key={task.id} className={`stats-card card-hover p-4 fade-in`} style={{animationDelay: `${index * 0.1}s`}}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${
                                task.priority === 'high' ? 'bg-destructive' : 
                                task.priority === 'medium' ? 'bg-warning' : 'bg-success'
                              }`}></div>
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-foreground">{task.title}</h4>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                                )}
                                {task.dueTime && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <i className="fas fa-clock mr-1"></i>
                                    {new Date(`2000-01-01T${task.dueTime}`).toLocaleTimeString([], { 
                                      hour: 'numeric', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-md ${
                                task.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                                task.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                              }`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground`}>
                                {task.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
