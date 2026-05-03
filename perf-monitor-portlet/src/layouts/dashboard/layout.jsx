import { Box } from "@mui/material";
import { NavDesktop } from "./nav";
import OrderTimeline from "../../sections/overview/analytics-order-timeline";
import { useThemeMode } from "../../theme-mode";

export function DashboardLayout({ children }) {
  const { themeMode } = useThemeMode();

  return (
    <Box
      className={`app-shell app-theme-${themeMode}`}
      sx={{
        display: "grid",
        gridTemplateColumns: "260px minmax(0, 1fr) 432px",
        minHeight: "100vh",
        bgcolor: "var(--app-bg)",
      }}
    >
      <Box component="aside">
        <NavDesktop />
      </Box>

      <Box
        component="main"
        sx={{
          p: 4,
          minWidth: 0,
          bgcolor: "var(--app-bg)",
        }}
      >
        {children}
      </Box>

      <Box
        component="aside"
        sx={{
          p: 3,
          bgcolor: "var(--app-bg)",
          borderLeft: "1px solid var(--app-border)",
          minWidth: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
        }}
      >
        <OrderTimeline />
      </Box>
    </Box>
  );
}
