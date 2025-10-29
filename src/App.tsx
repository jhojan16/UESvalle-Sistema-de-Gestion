import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Prestadores from "./pages/Prestadores";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/prestadores"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Prestadores />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/muestreos"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center p-8">
                      <h2 className="text-2xl font-bold">Muestreos</h2>
                      <p className="text-muted-foreground mt-2">Página en desarrollo</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tecnicos"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center p-8">
                      <h2 className="text-2xl font-bold">Técnicos</h2>
                      <p className="text-muted-foreground mt-2">Página en desarrollo</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/laboratorios"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center p-8">
                      <h2 className="text-2xl font-bold">Laboratorios</h2>
                      <p className="text-muted-foreground mt-2">Página en desarrollo</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center p-8">
                      <h2 className="text-2xl font-bold">Reportes</h2>
                      <p className="text-muted-foreground mt-2">Página en desarrollo</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/solicitantes"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center p-8">
                      <h2 className="text-2xl font-bold">Solicitantes</h2>
                      <p className="text-muted-foreground mt-2">Página en desarrollo</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ubicaciones"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="text-center p-8">
                      <h2 className="text-2xl font-bold">Ubicaciones</h2>
                      <p className="text-muted-foreground mt-2">Página en desarrollo</p>
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
