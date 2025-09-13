import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";
import { setAuthToken } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const registerFormSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAuthToken(data.token);
      queryClient.invalidateQueries();
      setLocation("/");
      toast({
        title: "Welcome to Focusly!",
        description: "Your account has been created successfully. Let's help you find your focus!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <i className="fas fa-bullseye text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Join Focusly</h2>
          <p className="text-sm text-muted-foreground">Focus. Achieve. Succeed.</p>
        </div>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="John"
                {...form.register("firstName")}
                data-testid="input-firstName"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...form.register("lastName")}
                data-testid="input-lastName"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="registerEmail" className="block text-sm font-medium text-foreground mb-1">
              Email Address
            </Label>
            <Input
              id="registerEmail"
              type="email"
              placeholder="john@student.edu"
              {...form.register("email")}
              data-testid="input-register-email"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="registerPassword" className="block text-sm font-medium text-foreground mb-1">
              Password
            </Label>
            <Input
              id="registerPassword"
              type="password"
              placeholder="Choose a strong password"
              {...form.register("password")}
              data-testid="input-register-password"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...form.register("confirmPassword")}
              data-testid="input-confirm-password"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={registerMutation.isPending}
            data-testid="button-register"
          >
            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>
          
          <div className="text-center">
            <span className="text-sm text-muted-foreground">Already have an account? </span>
            <button
              type="button"
              onClick={() => setLocation("/login")}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
              data-testid="link-login"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
