import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: 'hsl(221, 83%, 53%)',
      light: 'hsl(221, 83%, 63%)',
      dark: 'hsl(221, 83%, 43%)',
    },
    secondary: {
      main: 'hsl(142, 76%, 36%)',
      light: 'hsl(142, 76%, 46%)',
      dark: 'hsl(142, 76%, 26%)',
    },
    background: {
      default: 'hsl(0, 0%, 98%)',
      paper: 'hsl(0, 0%, 100%)',
    },
    text: {
      primary: 'hsl(222, 47%, 11%)',
      secondary: 'hsl(215, 16%, 47%)',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '6px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});
