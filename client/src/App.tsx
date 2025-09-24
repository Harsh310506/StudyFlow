import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ProtectedRoute } from "@/components/protected-route";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import AddTask from "@/pages/add-task";
import Calendar from "@/pages/calendar";
import PasswordManager from "@/pages/password-manager";
import NotesManager from "@/pages/notes-manager";
import Progress from "@/pages/progress";
import Timetable from "@/pages/timetable";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/add-task">
        <ProtectedRoute>
          <AddTask />
        </ProtectedRoute>
      </Route>
      <Route path="/calendar">
        <ProtectedRoute>
          <Calendar />
        </ProtectedRoute>
      </Route>
      <Route path="/password-manager">
        <ProtectedRoute>
          <PasswordManager />
        </ProtectedRoute>
      </Route>
      <Route path="/notes">
        <ProtectedRoute>
          <NotesManager />
        </ProtectedRoute>
      </Route>
      <Route path="/progress">
        <ProtectedRoute>
          <Progress />
        </ProtectedRoute>
      </Route>
      <Route path="/timetable">
        <ProtectedRoute>
          <Timetable />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="studyflow-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
