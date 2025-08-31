import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const addTaskSchema = insertTaskSchema.extend({
  dueDate: z.string().optional(),
});

type AddTaskFormData = z.infer<typeof addTaskSchema>;

export default function AddTask() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      dueTime: "",
      priority: "medium",
      category: "assignment",
      completionStatus: "pending",
      isOverallTask: false,
      emailReminder: false,
      pushReminder: false,
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: AddTaskFormData) => {
      const taskData = {
        ...data,
        dueDate: data.dueDate && !data.isOverallTask ? new Date(data.dueDate) : null,
      };
      const response = await apiRequest("POST", "/api/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/stats"] });
      toast({
        title: "Task created!",
        description: "Your task has been added successfully.",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddTaskFormData) => {
    createTaskMutation.mutate(data);
  };

  const isOverallTask = form.watch("isOverallTask");

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <MobileHeader />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Add New Task</h1>
              <p className="mt-1 text-sm text-muted-foreground">Create a new task and organize your schedule</p>
            </div>
            
            <div className="bg-card rounded-lg border border-border p-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Task Title */}
                <div>
                  <Label htmlFor="task-title" className="block text-sm font-medium text-foreground mb-2">
                    Task Title
                  </Label>
                  <Input
                    id="task-title"
                    placeholder="Enter task title..."
                    {...form.register("title")}
                    data-testid="input-task-title"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>
                
                {/* Task Description */}
                <div>
                  <Label htmlFor="task-description" className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </Label>
                  <Textarea
                    id="task-description"
                    rows={3}
                    placeholder="Add more details about this task..."
                    {...form.register("description")}
                    data-testid="textarea-task-description"
                  />
                </div>
                
                {/* Overall Task Option */}
                <div className="border border-border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="isOverallTask"
                      checked={isOverallTask}
                      onCheckedChange={(checked) => form.setValue("isOverallTask", !!checked)}
                      data-testid="checkbox-overall-task"
                    />
                    <div>
                      <Label htmlFor="isOverallTask" className="text-sm font-medium text-foreground cursor-pointer">
                        Mark as Overall Task
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Overall tasks don't have specific due dates and can be worked on anytime
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Date and Time - Hidden for Overall Tasks */}
                {!isOverallTask && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="task-date" className="block text-sm font-medium text-foreground mb-2">
                        Due Date
                      </Label>
                      <Input
                        id="task-date"
                        type="date"
                        {...form.register("dueDate")}
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        data-testid="input-due-date"
                      />
                    </div>
                    <div>
                      <Label htmlFor="task-time" className="block text-sm font-medium text-foreground mb-2">
                        Due Time (Optional)
                      </Label>
                      <Input
                        id="task-time"
                        type="time"
                        {...form.register("dueTime")}
                        data-testid="input-due-time"
                      />
                    </div>
                  </div>
                )}
                
                {/* Priority and Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-sm font-medium text-foreground mb-2">
                      Priority Level
                    </Label>
                    <Select
                      value={form.watch("priority")}
                      onValueChange={(value) => form.setValue("priority", value as any)}
                    >
                      <SelectTrigger data-testid="select-priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="block text-sm font-medium text-foreground mb-2">
                      Category
                    </Label>
                    <Select
                      value={form.watch("category")}
                      onValueChange={(value) => form.setValue("category", value as any)}
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Reminder Options */}
                <div>
                  <Label className="block text-sm font-medium text-foreground mb-3">
                    Reminder Settings
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="emailReminder"
                        checked={form.watch("emailReminder")}
                        onCheckedChange={(checked) => form.setValue("emailReminder", !!checked)}
                        data-testid="checkbox-email-reminder"
                      />
                      <Label htmlFor="emailReminder" className="text-sm text-foreground cursor-pointer">
                        Email reminder 1 day before
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="pushReminder"
                        checked={form.watch("pushReminder")}
                        onCheckedChange={(checked) => form.setValue("pushReminder", !!checked)}
                        data-testid="checkbox-push-reminder"
                      />
                      <Label htmlFor="pushReminder" className="text-sm text-foreground cursor-pointer">
                        Browser notification 1 hour before
                      </Label>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => setLocation("/")}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createTaskMutation.isPending}
                    data-testid="button-create-task"
                  >
                    {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
