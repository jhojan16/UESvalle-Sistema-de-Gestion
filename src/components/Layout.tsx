import { useState, ReactNode } from 'react';
import { Box } from '@mui/material';
import { AppSidebar } from './AppSidebar';

export function Layout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: 'margin 0.2s',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
