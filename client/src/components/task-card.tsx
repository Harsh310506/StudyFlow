import { Task } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Task['completionStatus'] | null>(null);

  const updateTaskMutation = useMutation({
    mutationFn: async (updates: Partial<Task>) => {
      return apiRequest("PATCH", `/api/tasks/${task.id}`, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
      
      // Show success toast
      if (variables.completionStatus) {
        const statusMessages = {
          'partial': 'Task marked as partially completed',
          'half': 'Task marked as half completed',
          'complete': 'Task marked as fully completed',
          'pending': 'Task marked as pending'
        };
        toast({
          title: "Task Updated",
          description: statusMessages[variables.completionStatus] || "Task status updated",
        });
      }
    },
  });

  const toggleCompletion = () => {
    const newStatus = task.completionStatus === 'complete' ? 'pending' : 'complete';
    if (newStatus === 'complete') {
      // Use confirmation dialog for completing tasks
      handleCompletionStatusChange('complete');
    } else {
      // Directly mark as pending without confirmation
      updateTaskMutation.mutate({ completionStatus: newStatus });
    }
  };

  const handleCompletionStatusChange = (status: Task['completionStatus']) => {
    setPendingStatus(status);
    setIsCompletionDialogOpen(true);
  };

  const confirmCompletionStatusChange = () => {
    if (pendingStatus) {
      updateTaskMutation.mutate({ completionStatus: pendingStatus });
      setIsCompletionDialogOpen(false);
      setPendingStatus(null);
    }
  };

  const getStatusMessage = (status: Task['completionStatus']) => {
    const messages: Record<Task['completionStatus'], string> = {
      'partial': 'Mark this task as partially completed? This means you\'ve made some progress but haven\'t finished it yet.',
      'half': 'Mark this task as half completed? This means you\'re halfway through the task.',
      'complete': 'Mark this task as fully completed? This will move it to your completed tasks list.',
      'pending': 'Mark this task as pending? This will move it back to your active tasks.'
    };
    return messages[status] || 'Update task status?';
  };

  const updateCompletionStatus = (status: Task['completionStatus']) => {
    handleCompletionStatusChange(status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'assignment': return 'fa-book';
      case 'exam': return 'fa-graduation-cap';
      case 'project': return 'fa-code';
      case 'personal': return 'fa-user';
      default: return 'fa-tasks';
    }
  };

  const formatTime = (time?: string | null) => {
    if (!time) return null;
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`stats-card card-hover priority-${task.priority} p-5 border-0 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300`} data-testid={`card-task-${task.id}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <button 
            onClick={toggleCompletion}
            className={`mt-1 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-300 shadow-sm ${
              task.completionStatus === 'complete'
                ? 'border-emerald-500 bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-200 dark:shadow-emerald-500/25'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-purple-400 dark:hover:border-purple-500'
            }`}
            data-testid={`button-toggle-${task.id}`}
          >
            {task.completionStatus === 'complete' && (
              <i className="fas fa-check text-white text-xs"></i>
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className={`text-base font-semibold text-foreground ${
                task.completionStatus === 'complete' ? 'line-through opacity-60' : ''
              }`} data-testid={`text-task-title-${task.id}`}>
                {task.title}
              </h3>
              <div className="flex items-center space-x-2 ml-4">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  task.priority === 'high' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                  task.priority === 'medium' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                  'bg-gradient-to-br from-emerald-500 to-teal-500'
                }`}>
                  <i className={`fas ${getCategoryIcon(task.category)} text-white text-xs`}></i>
                </div>
              </div>
            </div>
            {task.description && (
              <p className={`text-sm text-muted-foreground mt-1 ${
                task.completionStatus === 'complete' ? 'line-through opacity-60' : ''
              }`} data-testid={`text-task-description-${task.id}`}>
                {task.description}
              </p>
            )}
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                <i className={`fas ${task.priority === 'high' ? 'fa-exclamation' : task.priority === 'medium' ? 'fa-flag' : 'fa-arrow-down'} w-3 h-3 mr-1`}></i>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
                <i className={`fas ${getCategoryIcon(task.category)} w-3 h-3 mr-1`}></i>
                {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
              </span>
              {task.dueTime && (
                <span className="text-xs text-muted-foreground">Due: {formatTime(task.dueTime)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          {task.completionStatus !== 'complete' && (
            <div className="flex space-x-1">
              <button 
                onClick={() => updateCompletionStatus('partial')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  task.completionStatus === 'partial' 
                    ? 'completion-partial' 
                    : 'border border-border hover:bg-accent'
                }`}
                data-testid={`button-partial-${task.id}`}
              >
                Partial
              </button>
              <button 
                onClick={() => updateCompletionStatus('half')}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                  task.completionStatus === 'half' 
                    ? 'completion-half' 
                    : 'border border-border hover:bg-accent'
                }`}
                data-testid={`button-half-${task.id}`}
              >
                Half
              </button>
            </div>
          )}
          {task.completionStatus === 'complete' && (
            <button className="completion-full px-3 py-1 rounded-md text-xs font-medium">
              Completed
            </button>
          )}
          {onEdit && (
            <button 
              onClick={() => onEdit(task)}
              className="text-muted-foreground hover:text-foreground"
              data-testid={`button-edit-${task.id}`}
            >
              <i className="fas fa-edit w-4 h-4"></i>
            </button>
          )}
        </div>
      </div>
      
      {/* Task Completion Confirmation Dialog */}
      <AlertDialog open={isCompletionDialogOpen} onOpenChange={setIsCompletionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Task Status</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus && getStatusMessage(pendingStatus)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsCompletionDialogOpen(false);
              setPendingStatus(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmCompletionStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
