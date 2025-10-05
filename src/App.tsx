import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
// Import only essential components for initial load
import NotFound from "./pages/NotFound";
import Redirect from "./pages/Redirect";

// Lazy load page components with route-based code splitting and prefetching
const Index = React.lazy(() => import(/* webpackChunkName: "landing" */ "./pages/Index"));
const Auth = React.lazy(() => import(/* webpackChunkName: "auth" */ "./pages/Auth"));

// Dashboard module group
const Dashboard = React.lazy(() => import(/* webpackChunkName: "dashboard-main" */ "./pages/Dashboard"));
const CreateLink = React.lazy(() => import(/* webpackChunkName: "dashboard-links" */ "./pages/CreateLink"));
const ManageLinks = React.lazy(() => import(/* webpackChunkName: "dashboard-links" */ "./pages/ManageLinks"));

// Analytics module group
const LinkAnalytics = React.lazy(() => import(/* webpackChunkName: "analytics" */ "./pages/LinkAnalytics"));
const DashboardAnalytics = React.lazy(() => import(/* webpackChunkName: "analytics" */ "./pages/DashboardAnalytics"));

// Organization module group
const OrganizeLinks = React.lazy(() => import(/* webpackChunkName: "organization" */ "./pages/OrganizeLinks"));
const CustomRedirectRulesPage = React.lazy(() => import(/* webpackChunkName: "organization" */ "./pages/CustomRedirectRulesPage"));

// Preload critical chunks on idle
const preloadRouteChunk = (chunkName: string) => {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = `/assets/${chunkName}.js`;
  document.head.appendChild(link);
};

// Preload dashboard chunks when user is authenticated
if (localStorage.getItem('supabase.auth.token')) {
  requestIdleCallback(() => {
    preloadRouteChunk('dashboard-main');
    preloadRouteChunk('dashboard-links');
  });
}

const queryClient = new QueryClient();

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/create" element={
                <ProtectedRoute>
                  <CreateLink />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/links" element={
                <ProtectedRoute>
                  <ManageLinks />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/analytics/:id" element={
                <ProtectedRoute>
                  <LinkAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/analytics" element={
                <ProtectedRoute>
                  <DashboardAnalytics />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/organize" element={
                <ProtectedRoute>
                  <OrganizeLinks />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/redirect-rules" element={
                <ProtectedRoute>
                  <CustomRedirectRulesPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/redirect-rules/:linkId" element={
                <ProtectedRoute>
                  <CustomRedirectRulesPage />
                </ProtectedRoute>
              } />
              {/* Dynamic route for slug redirects */}
              <Route path=":slug" element={<Redirect />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
