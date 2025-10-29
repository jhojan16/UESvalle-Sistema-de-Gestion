import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  IconButton,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Home,
  Users,
  FlaskConical,
  UserCog,
  FileText,
  MapPin,
  Building2,
  ClipboardList,
  LogOut,
  Menu,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Prestadores', url: '/prestadores', icon: Users },
  { title: 'Muestreos', url: '/muestreos', icon: FlaskConical },
  { title: 'Técnicos', url: '/tecnicos', icon: UserCog },
  { title: 'Laboratorios', url: '/laboratorios', icon: Building2 },
  { title: 'Reportes', url: '/reportes', icon: FileText },
  { title: 'Solicitantes', url: '/solicitantes', icon: ClipboardList },
  { title: 'Ubicaciones', url: '/ubicaciones', icon: MapPin },
];

const drawerWidth = 260;

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function AppSidebar({ open, onToggle }: AppSidebarProps) {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : 72,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : 72,
          boxSizing: 'border-box',
          transition: 'width 0.2s',
          overflowX: 'hidden',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <Building2 size={24} />
        </Avatar>
        {open && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              UES Valle
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sistema Administrativo
            </Typography>
          </Box>
        )}
        <IconButton onClick={onToggle} size="small">
          {open ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.url;
          return (
            <ListItem key={item.title} disablePadding sx={{ px: 1 }}>
              <ListItemButton
                component={NavLink}
                to={item.url}
                selected={isActive}
                sx={{
                  borderRadius: 1,
                  justifyContent: open ? 'initial' : 'center',
                  minHeight: 48,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: isActive ? 'inherit' : 'text.secondary',
                  }}
                >
                  <IconComponent size={20} />
                </ListItemIcon>
                {open && <ListItemText primary={item.title} />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      <Box sx={{ p: 1 }}>
        <ListItemButton
          onClick={signOut}
          sx={{
            borderRadius: 1,
            justifyContent: open ? 'initial' : 'center',
            minHeight: 48,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : 'auto',
              justifyContent: 'center',
            }}
          >
            <LogOut size={20} />
          </ListItemIcon>
          {open && <ListItemText primary="Cerrar Sesión" />}
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
