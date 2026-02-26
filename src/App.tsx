import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { AppLoader } from "./components/AppLoader";

const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Prestadores = lazy(() => import("./pages/Prestadores"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Muestras = lazy(() => import("./pages/Muestras"));
const Tecnico = lazy(() => import("./pages/Tecnico"));
const InspeccionStagingResolver = lazy(() => import("./pages/InsercionIndividual"));
const PrestadorDetalle = lazy(() => import("./pages/PrestadorDetalle"));
const Solicitantes = lazy(() => import("./pages/Solicitantes"));
const VistaExportar = lazy(() => import("./pages/VistaExportar"));
const MapaPuntosCaptacion = lazy(() => import("./pages/MapaRiesgo"));
const InspeccionesView = lazy(() => import("./pages/Inspeccion"));
const CargaMasivaVista = lazy(() => import("./pages/VistaUpload"));
const AdminUsuarios = lazy(() => import("./pages/AdminUsuarios"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<AppLoader fullScreen message="Cargando vista..." />}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
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
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Perfil />
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
                path="/inspeccion/InsercionIndividual"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <InspeccionStagingResolver />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/muestras"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Muestras />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/solicitantes"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Solicitantes />
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
                path="/mapa"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MapaPuntosCaptacion />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inspeccion"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <InspeccionesView />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/exportar"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <VistaExportar />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subir"
                element={
                  <ProtectedRoute requireAdmin>
                    <Layout>
                      <CargaMasivaVista />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <ProtectedRoute requireAdmin>
                    <Layout>
                      <AdminUsuarios />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;
