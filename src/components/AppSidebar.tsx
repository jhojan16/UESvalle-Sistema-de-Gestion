import { Fragment, type ComponentType, useMemo } from 'react';
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
  ChevronLeft,
  ArrowBigDownDash,
  FolderUp,
  UserCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const drawerWidth = 264;
const collapsedWidth = 74;
const motion = '220ms cubic-bezier(0.2, 0, 0, 1)';

interface AppSidebarProps {
  open: boolean;
  onToggle: () => void;
}

interface MenuItemConfig {
  title: string;
  url: string;
  icon: ComponentType<{ size?: number }>;
}

interface MenuSectionConfig {
  title: string;
  items: MenuItemConfig[];
}

const commonMenuSections: MenuSectionConfig[] = [
  {
    title: 'General',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: Home },
      { title: 'Perfil', url: '/perfil', icon: UserCircle2 },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { title: 'Prestadores', url: '/prestadores', icon: Users },
      { title: 'Tecnicos', url: '/tecnicos', icon: UserCog },
      { title: 'Solicitantes', url: '/solicitantes', icon: ClipboardList },
    ],
  },
  {
    title: 'Calidad',
    items: [
      { title: 'Muestras', url: '/muestras', icon: FileText },
      { title: 'Inspeccion Sanitaria', url: '/inspeccion', icon: FlaskConical },
      { title: 'Mapa de riesgo', url: '/mapa', icon: MapPin },
    ],
  },
  {
    title: 'Reportes',
    items: [{ title: 'Exportar', url: '/exportar', icon: ArrowBigDownDash }],
  },
];

const adminMenuSections: MenuSectionConfig[] = [
  {
    title: 'Administracion',
    items: [
      { title: 'Subir', url: '/subir', icon: FolderUp },
      { title: 'Admin Usuarios', url: '/admin/usuarios', icon: ShieldCheck },
    ],
  },
];

export function AppSidebar({ open, onToggle }: AppSidebarProps) {
  const { signOut, isAdmin } = useAuth();
  const location = useLocation();

  const menuSections = useMemo(
    () => (isAdmin ? [...commonMenuSections, ...adminMenuSections] : commonMenuSections),
    [isAdmin]
  );

  const isPathActive = (url: string) =>
    location.pathname === url || location.pathname.startsWith(`${url}/`);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          transition: `width ${motion}, box-shadow ${motion}`,
          borderRight: '1px solid',
          borderColor: 'divider',
          overflowX: 'hidden',
          position: 'relative',
          zIndex: 1200,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          boxShadow: open
            ? '0 6px 20px rgba(15, 23, 42, 0.10)'
            : '0 4px 14px rgba(15, 23, 42, 0.08)',
        },
      }}
    >
      <Box
        sx={{
          px: open ? 1.5 : 0,
          py: open ? 1.5 : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          minWidth: 0,
          minHeight: 72,
          transition: `padding ${motion}`,
        }}
      >
        {open ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                }}
              >
                <Building2 size={19} />
              </Avatar>
              <Box sx={{ ml: 1.5, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} noWrap>
                  UES Valle
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  Sistema Administrativo
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Contraer menu" arrow>
              <IconButton
                onClick={onToggle}
                size="small"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: `all ${motion}`,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ChevronLeft size={18} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="Expandir menu" arrow>
            <IconButton
              onClick={onToggle}
              size="small"
              sx={{
                width: 44,
                height: 44,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: `all ${motion}`,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ChevronLeft
                size={18}
                style={{
                  transform: 'rotate(180deg)',
                  transition: `transform ${motion}`,
                }}
              />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ flexShrink: 0 }} />

      <List
        sx={{
          flex: 1,
          py: 1.5,
          overflowX: 'hidden',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: open ? 'stretch' : 'center',
          px: open ? 1 : 0.5,
          transition: `padding ${motion}`,
        }}
      >
        {menuSections.map((section, sectionIndex) => (
          <Fragment key={section.title}>
            {open ? (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  px: 1.5,
                  pt: sectionIndex === 0 ? 0 : 1.5,
                  pb: 0.5,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {section.title}
              </Typography>
            ) : (
              sectionIndex > 0 && <Divider sx={{ width: '62%', my: 0.9 }} />
            )}

            {section.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = isPathActive(item.url);

              return (
                <ListItem
                  key={item.url}
                  disablePadding
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    px: open ? 0.5 : 0,
                    py: 0.25,
                  }}
                >
                  <Tooltip title={!open ? item.title : ''} placement="right" arrow>
                    <ListItemButton
                      component={NavLink}
                      to={item.url}
                      selected={isActive}
                      sx={{
                        borderRadius: open ? 1.5 : 1.8,
                        minHeight: 44,
                        width: open ? '100%' : 50,
                        px: open ? 1.25 : 0,
                        justifyContent: open ? 'flex-start' : 'center',
                        transition: `all ${motion}`,
                        '&:hover': {
                          bgcolor: 'action.hover',
                          transform: open ? 'translateX(2px)' : 'none',
                        },
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          boxShadow: '0 8px 16px rgba(37, 99, 235, 0.26)',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                            transform: 'none',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 1.5 : 0,
                          justifyContent: 'center',
                          color: isActive ? 'inherit' : 'text.secondary',
                          transition: `margin ${motion}, color ${motion}`,
                        }}
                      >
                        <IconComponent size={19} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        sx={{
                          opacity: open ? 1 : 0,
                          maxWidth: open ? 190 : 0,
                          overflow: 'hidden',
                          transition: `opacity ${motion}, max-width ${motion}`,
                        }}
                        primaryTypographyProps={{
                          noWrap: true,
                          fontSize: 14,
                          fontWeight: isActive ? 700 : 500,
                        }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            })}
          </Fragment>
        ))}
      </List>

      <Divider sx={{ flexShrink: 0 }} />

      <Box
        sx={{
          p: open ? 1 : 0.5,
          display: 'flex',
          justifyContent: 'center',
          flexShrink: 0,
          transition: `padding ${motion}`,
        }}
      >
        <Tooltip title={!open ? 'Cerrar sesion' : ''} placement="right" arrow>
          <ListItemButton
            onClick={signOut}
            sx={{
              borderRadius: open ? 1.5 : 1.8,
              minHeight: 44,
              width: open ? '100%' : 50,
              px: open ? 1.25 : 0,
              justifyContent: open ? 'flex-start' : 'center',
              transition: `all ${motion}`,
              '&:hover': {
                bgcolor: 'action.hover',
                transform: open ? 'translateX(2px)' : 'none',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 1.5 : 0,
                justifyContent: 'center',
                color: 'text.secondary',
                transition: `margin ${motion}`,
              }}
            >
              <LogOut size={19} />
            </ListItemIcon>
            <ListItemText
              primary="Cerrar sesion"
              sx={{
                opacity: open ? 1 : 0,
                maxWidth: open ? 170 : 0,
                overflow: 'hidden',
                transition: `opacity ${motion}, max-width ${motion}`,
              }}
              primaryTypographyProps={{ noWrap: true, fontSize: 14, fontWeight: 500 }}
            />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
