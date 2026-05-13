import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import { NavDesktop } from "./nav";
import IncidentFeed from "../../sections/overview/incident-feed";
import { useThemeMode } from "../../theme-mode";

export function DashboardLayout({ children }) {
  const { themeMode } = useThemeMode();
  const { pathname } = useLocation();
  const hideTimeline = pathname === "/error-log";

  return (
    <Box
      className={`app-shell app-theme-${themeMode}`}
      sx={{
        display: "grid",
        gridTemplateColumns: "260px minmax(0, 1fr) clamp(400px, 26vw, 497px)",
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
          borderLeft: "1px solid var(--app-border)", // 우측 레이아웃 영역 실선
          minWidth: 0,
          height: "100vh",
          position: "sticky",
          top: 0,
          overflowY: "auto",
        }}
      >
        {!hideTimeline && <IncidentFeed />}
      </Box>
    </Box>
  );
}
