import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Imprint from "./pages/Imprint";
import Privacy from "./pages/Privacy";
import Onboarding from "./pages/Onboarding";
import Plan from "./pages/Plan";
import Shopping from "./pages/Shopping";
import { Dashboard } from "./pages/Dashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminPayments } from "./pages/AdminPayments";
import { MealPlans } from "./pages/MealPlans";
import { Recipes } from "./pages/Recipes";
import { ShoppingLists } from "./pages/ShoppingLists";
import { CreateRecipe } from "./pages/CreateRecipe";
import { CreateMealPlan } from "./pages/CreateMealPlan";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/imprint" element={<Imprint />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/plan" 
                element={
                  <ProtectedRoute>
                    <Plan />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/shopping" 
                element={
                  <ProtectedRoute>
                    <Shopping />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/meal-plans" 
                element={
                  <ProtectedRoute>
                    <MealPlans />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recipes" 
                element={
                  <ProtectedRoute>
                    <Recipes />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/shopping-lists" 
                element={
                  <ProtectedRoute>
                    <ShoppingLists />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-recipe" 
                element={
                  <ProtectedRoute>
                    <CreateRecipe />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-meal-plan" 
                element={
                  <ProtectedRoute>
                    <CreateMealPlan />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/payments" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPayments />
                  </ProtectedRoute>
                } 
              />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
