import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPasswordSchema, type InsertPassword, type Password } from "@shared/schema";
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
import { Eye, EyeOff, Plus, Trash2, Shield, Copy } from "lucide-react";

const addPasswordSchema = insertPasswordSchema.extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  encryptedPassword: z.string().min(1, "Password is required"),
});

const verifyPasswordSchema = z.object({
  password: z.string().min(1, "Account password is required"),
});

type AddPasswordFormData = z.infer<typeof addPasswordSchema>;
type VerifyPasswordFormData = z.infer<typeof verifyPasswordSchema>;

export default function PasswordManager() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [selectedPasswordId, setSelectedPasswordId] = useState<string | null>(null);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addPasswordForm = useForm<AddPasswordFormData>({
    resolver: zodResolver(addPasswordSchema),
    defaultValues: {
      title: "",
      description: "",
      encryptedPassword: "",
    },
  });

  const verifyPasswordForm = useForm<VerifyPasswordFormData>({
    resolver: zodResolver(verifyPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const { data: passwords = [], isLoading } = useQuery({
    queryKey: ["/api/passwords"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/passwords");
      return response.json();
    },
  });

  const createPasswordMutation = useMutation({
    mutationFn: async (data: AddPasswordFormData) => {
      const response = await apiRequest("POST", "/api/passwords", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      toast({
        title: "Password saved!",
        description: "Your password has been securely stored.",
      });
      setIsAddDialogOpen(false);
      addPasswordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePasswordMutation = useMutation({
    mutationFn: async (passwordId: string) => {
      await apiRequest("DELETE", `/api/passwords/${passwordId}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      toast({
        title: "Password deleted",
        description: "The password has been removed from your vault.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const revealPasswordMutation = useMutation({
    mutationFn: async ({ passwordId, userPassword }: { passwordId: string; userPassword: string }) => {
      const response = await apiRequest("POST", `/api/passwords/${passwordId}/reveal`, { password: userPassword });
      return response.json();
    },
    onSuccess: (data) => {
      setRevealedPassword(data.password);
      setIsVerifyDialogOpen(false);
      verifyPasswordForm.reset();
      toast({
        title: "Password revealed",
        description: "Click the eye icon again to hide it.",
      });
      // Hide password after 10 seconds for security
      setTimeout(() => {
        setRevealedPassword(null);
        setSelectedPasswordId(null);
      }, 10000);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reveal password",
        description: "Invalid account password or password not found.",
        variant: "destructive",
      });
    },
  });

  const handleAddPassword = (data: AddPasswordFormData) => {
    createPasswordMutation.mutate(data);
  };

  const handleRevealPassword = (passwordId: string) => {
    if (selectedPasswordId === passwordId && revealedPassword) {
      // Hide password if already visible
      setRevealedPassword(null);
      setSelectedPasswordId(null);
    } else {
      // Show password verification dialog
      setSelectedPasswordId(passwordId);
      setIsVerifyDialogOpen(true);
    }
  };

  const handleVerifyAndReveal = (data: VerifyPasswordFormData) => {
    if (selectedPasswordId) {
      revealPasswordMutation.mutate({
        passwordId: selectedPasswordId,
        userPassword: data.password,
      });
    }
  };

  const handleDeletePassword = (passwordId: string) => {
    if (confirm("Are you sure you want to delete this password? This action cannot be undone.")) {
      deletePasswordMutation.mutate(passwordId);
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
                <p className="text-muted-foreground">Loading your password vault...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <Sidebar />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <MobileHeader />
        
        <main className="flex-1 bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                    <i className="fas fa-shield-alt text-primary"></i>
                    Password Manager
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                    Securely store and manage your passwords
                  </p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-password">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={addPasswordForm.handleSubmit(handleAddPassword)} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Gmail, Facebook, Netflix"
                          {...addPasswordForm.register("title")}
                          data-testid="input-password-title"
                        />
                        {addPasswordForm.formState.errors.title && (
                          <p className="text-sm text-destructive mt-1">
                            {addPasswordForm.formState.errors.title.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="What is this password for?"
                          {...addPasswordForm.register("description")}
                          data-testid="textarea-password-description"
                        />
                        {addPasswordForm.formState.errors.description && (
                          <p className="text-sm text-destructive mt-1">
                            {addPasswordForm.formState.errors.description.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter the password to store"
                          {...addPasswordForm.register("encryptedPassword")}
                          data-testid="input-password-value"
                        />
                        {addPasswordForm.formState.errors.encryptedPassword && (
                          <p className="text-sm text-destructive mt-1">
                            {addPasswordForm.formState.errors.encryptedPassword.message}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddDialogOpen(false)}
                          data-testid="button-cancel-add"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createPasswordMutation.isPending}
                          data-testid="button-save-password"
                        >
                          {createPasswordMutation.isPending ? "Saving..." : "Save Password"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {passwords.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No passwords stored yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start building your secure password vault by adding your first password.
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} data-testid="button-add-first-password">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Password
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {passwords.map((password: Password) => (
                  <div
                    key={password.id}
                    className="bg-card rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors"
                    data-testid={`password-card-${password.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{password.title}</h3>
                            <p className="text-sm text-muted-foreground">{password.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-muted-foreground">
                          <p>Added {password.createdAt ? new Date(password.createdAt).toLocaleDateString() : 'Unknown date'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevealPassword(password.id)}
                            data-testid={`button-reveal-${password.id}`}
                            className={selectedPasswordId === password.id && revealedPassword ? "text-primary" : ""}
                          >
                            {selectedPasswordId === password.id && revealedPassword ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                <span className="sr-only">Hide password</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                <span className="sr-only">Show password</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePassword(password.id)}
                            data-testid={`button-delete-${password.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {selectedPasswordId === password.id && revealedPassword && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-medium text-foreground">Revealed Password:</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(revealedPassword);
                              toast({
                                title: "Copied!",
                                description: "Password copied to clipboard",
                              });
                            }}
                            className="h-8 px-2"
                          >
                            <i className="fas fa-copy w-3 h-3 mr-1"></i>
                            Copy
                          </Button>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <p className="font-mono text-base font-semibold text-foreground break-all" data-testid={`revealed-password-${password.id}`}>
                            {revealedPassword}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-muted-foreground">
                            Password will auto-hide in 10 seconds for security.
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRevealedPassword(null);
                              setSelectedPasswordId(null);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            Hide Now
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Account Password Verification Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Account Password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your account password to reveal the stored password.
          </p>
          <form onSubmit={verifyPasswordForm.handleSubmit(handleVerifyAndReveal)} className="space-y-4">
            <div>
              <Label htmlFor="account-password">Account Password</Label>
              <Input
                id="account-password"
                type="password"
                placeholder="Enter your account password"
                {...verifyPasswordForm.register("password")}
                data-testid="input-account-password"
              />
              {verifyPasswordForm.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {verifyPasswordForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsVerifyDialogOpen(false);
                  setSelectedPasswordId(null);
                  verifyPasswordForm.reset();
                }}
                data-testid="button-cancel-verify"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={revealPasswordMutation.isPending}
                data-testid="button-verify-password"
              >
                {revealPasswordMutation.isPending ? "Verifying..." : "Reveal Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}