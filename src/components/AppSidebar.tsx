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
  Tooltip,
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
  ArrowBigDownDash 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Prestadores', url: '/prestadores', icon: Users },
  { title: 'Laboratorios', url: '/laboratorios', icon: Building2 },
  { title: 'Técnicos', url: '/tecnicos', icon: UserCog },
  { title: 'Solicitantes', url: '/solicitantes', icon: ClipboardList },
  { title: 'Muestras', url: '/muestras', icon: FileText },
  { title: 'Inspeccion Sanitaria', url: '/inspeccion', icon: FlaskConical },
  { title: 'Mapa de riesgo', url: '/mapa', icon: MapPin },
  { title: 'Exportar', url: '/exportar', icon: ArrowBigDownDash },
];

const drawerWidth = 260;
const collapsedWidth = 72;

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
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          transition: 'width 0.2s',
          borderRight: '1px solid',
          borderColor: 'divider',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 1200,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: open ? 2 : 0,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minWidth: 0,
        height: '64px',
        flexShrink: 0,
        position: 'relative',
      }}>
        {open ? (
          <>
            <Avatar sx={{ 
              bgcolor: 'primary.main', 
              flexShrink: 0,
              width: 40,
              height: 40,
            }}>
              <Building2 size={20} />
            </Avatar>
            <Box sx={{ 
              flex: 1, 
              minWidth: 0,
              overflow: 'hidden',
              ml: 2,
            }}>
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                UES Valle
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Sistema Administrativo
              </Typography>
            </Box>
            <Tooltip title="Contraer menú" arrow>
              <IconButton 
                onClick={onToggle} 
                size="small"
                sx={{ flexShrink: 0 }}
              >
                <ChevronLeft size={20} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Expandir menú" arrow>
            <IconButton 
              onClick={onToggle} 
              size="small"
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 0,
              }}
            >
              <Menu size={24} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      {/* Menu Items - Lista centrada cuando está contraído */}
      <List sx={{ 
        flex: 1, 
        py: 2, 
        overflowX: 'hidden',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: open ? 'stretch' : 'center',
        px: open ? 1 : 0,
      }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.url;
          return (
            <ListItem 
              key={item.title} 
              disablePadding 
              sx={{ 
                px: open ? 1 : 0,
                width: open ? 'auto' : '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Tooltip title={!open ? item.title : ""} placement="right" arrow>
                <ListItemButton
                  component={NavLink}
                  to={item.url}
                  selected={isActive}
                  sx={{
                    borderRadius: open ? 1 : 0,
                    justifyContent: 'center',
                    minHeight: 48,
                    width: open ? 'auto' : '100%',
                    px: open ? 2 : 1,
                    maxWidth: open ? 'none' : '48px',
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
                      mr: open ? 2 : 0,
                      justifyContent: 'center',
                      color: isActive ? 'inherit' : 'text.secondary',
                    }}
                  >
                    <IconComponent size={20} />
                  </ListItemIcon>
                  {open && (
                    <ListItemText 
                      primary={item.title} 
                      primaryTypographyProps={{ 
                        noWrap: true,
                      }} 
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ flexShrink: 0 }} />

      {/* Logout Button - También centrado cuando está contraído */}
      <Box sx={{ 
        p: open ? 1 : 0,
        display: 'flex',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Tooltip title={!open ? "Cerrar Sesión" : ""} placement="right" arrow>
          <ListItemButton
            onClick={signOut}
            sx={{
              borderRadius: open ? 1 : 0,
              justifyContent: 'center',
              minHeight: 48,
              width: open ? 'auto' : '100%',
              px: open ? 2 : 1,
              maxWidth: open ? 'none' : '48px',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : 0,
                justifyContent: 'center',
              }}
            >
              <LogOut size={20} />
            </ListItemIcon>
            {open && (
              <ListItemText 
                primary="Cerrar Sesión" 
                primaryTypographyProps={{ noWrap: true }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}