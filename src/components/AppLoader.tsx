import { Box, CircularProgress, Typography } from "@mui/material";

type AppLoaderProps = {
  message?: string;
  fullScreen?: boolean;
  minHeight?: number | string;
  size?: number;
};

export function AppLoader({
  message = "Cargando...",
  fullScreen = false,
  minHeight = 320,
  size = 36,
}: AppLoaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1.5,
        minHeight: fullScreen ? "100vh" : minHeight,
        width: "100%",
      }}
    >
      <CircularProgress size={size} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
