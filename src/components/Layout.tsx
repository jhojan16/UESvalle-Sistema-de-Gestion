import { useState, ReactNode } from 'react';
import { Box } from '@mui/material';
import { AppSidebar } from './AppSidebar';

export function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',      // ← Usa todo el ancho de la ventana
      overflow: 'hidden'   // ← Previene scroll horizontal del layout
    }}>
      <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: 'margin 0.2s',
          overflow: 'auto',    // ← Permite scroll vertical en el contenido
          height: '100vh',     // ← Altura fija del viewport
          width: '100%',       // ← Usa todo el ancho disponible
        }}
      >
        {children}
      </Box>
    </Box>
  );
}