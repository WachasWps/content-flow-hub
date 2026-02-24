import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import Posts from "./pages/Posts";
import Drafts from "./pages/Drafts";
import Analytics from "./pages/Analytics";
import Members from "./pages/Members";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import PendingApproval from "./pages/PendingApproval";
import SharedCalendar from "./pages/SharedCalendar";
import InviteSignup from "./pages/InviteSignup";
import InviteLogin from "./pages/InviteLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isApproved } = useAuth();
  if (loading || (user && isApproved === null)) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (!isApproved) return <Navigate to="/pending" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isApproved } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  if (user && isApproved) return <Navigate to="/dashboard" replace />;
  if (user && !isApproved) return <Navigate to="/pending" replace />;
  return <>{children}</>;
}

function PendingRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isApproved } = useAuth();
  if (loading || (user && isApproved === null)) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (isApproved) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
            <Route path="/invite-login" element={<PublicRoute><InviteLogin /></PublicRoute>} />
            <Route path="/pending" element={<PendingRoute><PendingApproval /></PendingRoute>} />
            <Route path="/shared" element={<SharedCalendar />} />
            <Route path="/invite" element={<InviteSignup />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Index />} />
              <Route path="/posts" element={<Posts />} />
              <Route path="/drafts" element={<Drafts />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/members" element={<Members />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
