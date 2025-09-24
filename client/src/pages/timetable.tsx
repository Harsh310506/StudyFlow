import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, Edit2, Trash2, MapPin, User, FileText, Circle } from "lucide-react";
import { TimetableEntry, InsertTimetable } from "@shared/schema";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "All Days"];
const ACTIVITY_TYPES = [
  { value: "class", label: "Class", color: "bg-blue-500" },
  { value: "study", label: "Study", color: "bg-green-500" },
  { value: "break", label: "Break", color: "bg-yellow-500" },
  { value: "activity", label: "Activity", color: "bg-purple-500" },
  { value: "meal", label: "Meal", color: "bg-orange-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
];

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", 
  "#F97316", "#6B7280", "#EF4444", "#06B6D4"
];

interface TimetableFormData {
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  type: string;
  location: string;
  instructor: string;
  notes: string;
  color: string;
}

export default function Timetable() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize with current day
  useEffect(() => {
    const today = new Date();
    const dayIndex = today.getDay();
    // Convert Sunday (0) to correct index and adjust for Monday start
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    setSelectedDay(DAYS[adjustedIndex]);
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const [formData, setFormData] = useState<TimetableFormData>({
    day: selectedDay,
    startTime: "",
    endTime: "",
    subject: "",
    type: "class",
    location: "",
    instructor: "",
    notes: "",
    color: "#3B82F6",
  });

  // Fetch timetable entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/timetable"],
    queryFn: async (): Promise<TimetableEntry[]> => {
      const response = await apiRequest("GET", "/api/timetable");
      return response.json();
    },
  });

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: InsertTimetable) => {
      console.log("Sending data to server:", data);
      const response = await apiRequest("POST", "/api/timetable", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      setIsDialogOpen(false);
      setEditingEntry(null);
      resetForm();
      toast({ title: "Entry created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create entry", variant: "destructive" });
    },
  });

  // Update entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTimetable> }) => {
      console.log("Updating entry with data:", data);
      const response = await apiRequest("PATCH", `/api/timetable/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      setIsDialogOpen(false);
      setEditingEntry(null);
      resetForm();
      toast({ title: "Entry updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update entry", variant: "destructive" });
    },
  });

  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/timetable/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timetable"] });
      toast({ title: "Entry deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete entry", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      day: selectedDay,
      startTime: "",
      endTime: "",
      subject: "",
      type: "class",
      location: "",
      instructor: "",
      notes: "",
      color: "#3B82F6",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startTime || !formData.endTime || !formData.subject) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const submitData = {
      day: formData.day as any,
      startTime: formData.startTime,
      endTime: formData.endTime,
      subject: formData.subject,
      type: formData.type as any,
      location: formData.location || null,
      instructor: formData.instructor || null,
      notes: formData.notes || null,
      color: formData.color,
      isAllDay: false,
    };

    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, data: submitData });
    } else {
      createEntryMutation.mutate(submitData);
    }
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setFormData({
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subject: entry.subject,
      type: entry.type,
      location: entry.location || "",
      instructor: entry.instructor || "",
      notes: entry.notes || "",
      color: entry.color,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteEntryMutation.mutate(id);
    }
  };

  const openAddDialog = () => {
    resetForm();
    setFormData(prev => ({ ...prev, day: selectedDay }));
    setEditingEntry(null);
    setIsDialogOpen(true);
  };

  // Filter entries for selected day
  const dayEntries = entries
    .filter((entry) => selectedDay === "All Days" ? true : entry.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Get activity type info
  const getActivityType = (type: string) => {
    return ACTIVITY_TYPES.find(t => t.value === type) || ACTIVITY_TYPES[0];
  };

  // Check if it's today and get current time indicator position
  const isToday = () => {
    if (selectedDay === "All Days") return true;
    const today = new Date();
    const dayIndex = today.getDay();
    const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    return DAYS[adjustedIndex] === selectedDay;
  };

  const getCurrentTimePosition = () => {
    if (!isToday()) return null;
    const now = currentTime;
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const currentTimeIndicator = getCurrentTimePosition();

  // Calculate stats for selected day
  const stats = {
    total: dayEntries.length,
    classes: dayEntries.filter(e => e.type === 'class').length,
    study: dayEntries.filter(e => e.type === 'study').length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <MobileHeader />
      
      <div className="lg:pl-64">
        <main className="min-h-screen bg-background">
          <div className="px-3 sm:px-4 lg:px-8 py-4 lg:py-6">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
                <Clock className="h-6 w-6" />
                Daily Timetable
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your schedule efficiently with organized daily planning
              </p>
            </div>

            {/* Day Selection */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {DAYS.map((day) => {
                  const today = new Date();
                  const dayIndex = today.getDay();
                  const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
                  const isCurrentDay = day !== "All Days" && DAYS[adjustedIndex] === day;

                  return (
                    <Button
                      key={day}
                      variant={selectedDay === day ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDay(day)}
                      className="relative"
                    >
                      {day}
                      {isCurrentDay && (
                        <Circle className="h-2 w-2 fill-green-500 text-green-500 absolute -top-1 -right-1" />
                      )}
                    </Button>
                  );
                })}
              </div>

              <Button onClick={openAddDialog} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            </div>

            {/* Current Time Indicator */}
            {isToday() && currentTimeIndicator && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <Circle className="h-2 w-2 fill-red-500 text-red-500" />
                  <span className="text-sm font-medium">
                    Current time: {formatTime(currentTimeIndicator)}
                  </span>
                </div>
              </div>
            )}

            {/* Timetable Entries */}
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading timetable...</p>
              </div>
            ) : dayEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">No entries for {selectedDay}</p>
                <Button onClick={openAddDialog} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first entry
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dayEntries.map((entry) => {
                  const activityType = getActivityType(entry.type);
                  
                  return (
                    <Card key={entry.id} className="relative">
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l`}
                        style={{ backgroundColor: entry.color }}
                      />
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg">{entry.subject}</CardTitle>
                              <Badge 
                                variant="secondary" 
                                className={`${activityType.color} text-white`}
                              >
                                {activityType.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                              </span>
                              {entry.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {entry.location}
                                </span>
                              )}
                              {entry.instructor && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {entry.instructor}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(entry)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(entry.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {entry.notes && (
                        <CardContent className="pt-0">
                          <div className="flex items-start gap-1 text-sm text-muted-foreground">
                            <FileText className="h-3 w-3 mt-0.5" />
                            <span>{entry.notes}</span>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Stats */}
            {dayEntries.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>Total entries: {stats.total}</span>
                  <span>Classes: {stats.classes}</span>
                  <span>Study sessions: {stats.study}</span>
                </div>
              </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingEntry ? "Edit Entry" : "Add New Entry"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="day">Day *</Label>
                      <Select value={formData.day} onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, day: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select value={formData.type} onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, type: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTIVITY_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input
                        type="time"
                        id="startTime"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input
                        type="time"
                        id="endTime"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject/Activity *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="e.g., Mathematics, Study Session, Lunch"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Room, Building"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instructor">Instructor/Contact</Label>
                      <Input
                        id="instructor"
                        value={formData.instructor}
                        onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                        placeholder="Teacher, Contact person"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional information..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2 mt-2">
                      {COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-6 h-6 rounded-full border-2 ${
                            formData.color === color ? 'border-primary' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createEntryMutation.isPending || updateEntryMutation.isPending}>
                      {editingEntry ? "Update Entry" : "Create Entry"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
