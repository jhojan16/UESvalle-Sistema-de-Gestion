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
import Muestreos from "./pages/Muestreos";
import Tecnico from "./pages/Tecnico";
import Laboratorio from "./pages/Laboratorio";
import PrestadorDetalle from "./pages/PrestadorDetalle";
import Solicitante from "./pages/Solicitantes";
import Reportes from "./pages/Reportes";
import VistaExportar from "./pages/VistaExportar";

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
              path="/prestadores/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PrestadorDetalle />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/laboratorios"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Laboratorio />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/muestreos"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Muestreos />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tecnicos"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Tecnico /> 
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/reportes"
              element={
                <ProtectedRoute>
                  <Layout>  
                    <Reportes />
                  </Layout>
                </ProtectedRoute>

              }
            />
            <Route
              path="/solicitantes"
              element={
                <ProtectedRoute>
                  <Layout>  
                    <Solicitante />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ubicaciones"
              element={
                <ProtectedRoute>
                  <Layout>
                    <VistaExportar/>
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
