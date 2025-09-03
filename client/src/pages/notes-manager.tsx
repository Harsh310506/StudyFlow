import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNoteSchema, type InsertNote, type Note } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { getAuthHeaders } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { MobileHeader } from "@/components/mobile-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Trash2, Bookmark, BookmarkCheck, Clock } from "lucide-react";

const addNoteSchema = insertNoteSchema.extend({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type AddNoteFormData = z.infer<typeof addNoteSchema>;

export default function NotesManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addNoteForm = useForm<AddNoteFormData>({
    resolver: zodResolver(addNoteSchema),
    defaultValues: {
      title: "",
      content: "",
      isBookmarked: false,
    },
  });

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["/api/notes"],
    queryFn: async () => {
      const response = await fetch("/api/notes", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch notes");
      return response.json();
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async (data: AddNoteFormData) => {
      const response = await apiRequest("POST", "/api/notes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note saved!",
        description: "Your note has been successfully created.",
      });
      setIsAddDialogOpen(false);
      addNoteForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: async ({ noteId, isBookmarked }: { noteId: string; isBookmarked: boolean }) => {
      const response = await apiRequest("PATCH", `/api/notes/${noteId}`, { isBookmarked });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: variables.isBookmarked ? "Note bookmarked!" : "Bookmark removed",
        description: variables.isBookmarked 
          ? "This note will not auto-delete." 
          : "This note will expire in 5 days if not bookmarked.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update bookmark",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await apiRequest("DELETE", `/api/notes/${noteId}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note deleted",
        description: "The note has been removed permanently.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddNote = (data: AddNoteFormData) => {
    createNoteMutation.mutate(data);
  };

  const handleToggleBookmark = (noteId: string, currentBookmarkStatus: boolean) => {
    toggleBookmarkMutation.mutate({
      noteId,
      isBookmarked: !currentBookmarkStatus,
    });
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      deleteNoteMutation.mutate(noteId);
    }
  };

  const formatTimeRemaining = (expiresAt: Date | null): string => {
    if (!expiresAt) return "";
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Expired";
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
      return "Less than 1 hour remaining";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <div className="lg:pl-64 flex flex-col flex-1">
          <MobileHeader />
          <main className="flex-1 overflow-y-auto bg-background">
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your notes...</p>
              </div>
            </div>
          </main>
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
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    Notes Manager
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Store important notes and descriptions. Notes auto-delete after 5 days unless bookmarked.
                  </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-note">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Note</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={addNoteForm.handleSubmit(handleAddNote)} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="Enter note title"
                          {...addNoteForm.register("title")}
                          data-testid="input-note-title"
                        />
                        {addNoteForm.formState.errors.title && (
                          <p className="text-sm text-destructive mt-1">
                            {addNoteForm.formState.errors.title.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          placeholder="Enter your note content..."
                          className="min-h-[200px] resize-y"
                          {...addNoteForm.register("content")}
                          data-testid="textarea-note-content"
                        />
                        {addNoteForm.formState.errors.content && (
                          <p className="text-sm text-destructive mt-1">
                            {addNoteForm.formState.errors.content.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="bookmark"
                          className="rounded border-border"
                          {...addNoteForm.register("isBookmarked")}
                          data-testid="checkbox-bookmark"
                        />
                        <Label htmlFor="bookmark" className="text-sm">
                          Bookmark this note (prevents auto-deletion)
                        </Label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                          data-testid="button-cancel-note"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createNoteMutation.isPending}
                          data-testid="button-save-note"
                        >
                          {createNoteMutation.isPending ? "Saving..." : "Save Note"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No notes yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start organizing your thoughts and important information by creating your first note.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-note">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Note
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {notes.map((note: Note) => (
                  <div
                    key={note.id}
                    className="bg-card rounded-lg border border-border p-6 hover:bg-accent/50 transition-colors"
                    data-testid={`note-card-${note.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground text-lg">{note.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Created {new Date(note.createdAt!).toLocaleDateString()}</span>
                              {note.isBookmarked ? (
                                <span className="flex items-center gap-1 text-primary">
                                  <BookmarkCheck className="w-3 h-3" />
                                  Bookmarked
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeRemaining(note.expiresAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleBookmark(note.id, note.isBookmarked)}
                          data-testid={`button-bookmark-${note.id}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {note.isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-primary" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          data-testid={`button-delete-${note.id}`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 border">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                        {note.content}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}