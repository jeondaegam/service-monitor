import { Box, ListItemButton } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { navData } from "../nav-config-dashboard";
import { useThemeMode } from "../../theme-mode";

export function NavDesktop() {
  const location = useLocation();
  const { isDark, toggleThemeMode } = useThemeMode();

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: "100vh",
        p: 2,
        bgcolor: "var(--app-panel)",
        borderRight: "1px solid var(--app-border)",
        color: "var(--app-text)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          px: 1,
          py: 1,
        }}
      >
        <Box sx={{ fontSize: 13, fontWeight: 700, color: "var(--app-text)" }}>
          발표의 숲<br/>
          Service Monitor
        </Box>
        <Box
          component="button"
          type="button"
          onClick={toggleThemeMode}
          title={isDark ? "일반모드로 전환" : "다크모드로 전환"}
          sx={{
            border: "1px solid var(--app-border)",
            borderRadius: 1,
            bgcolor: "var(--app-surface)",
            color: "var(--app-text)",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            px: 1.25,
            py: 0.75,
          }}
        >
          {isDark ? "Light" : "Dark"}
        </Box>
      </Box>

      {navData.map((item) => {
        const active = location.pathname === item.path;

        return (
          <ListItemButton
            key={item.title}
            component={Link}
            to={item.path}
            sx={{
              mb: 1,
              borderRadius: 1,
              display: "flex",
              gap: 2,
              color: active ? "var(--app-accent)" : "var(--app-muted)",
              bgcolor: active ? "var(--app-active)" : "transparent",
              "&:hover": {
                bgcolor: active ? "var(--app-active)" : "var(--app-hover)",
              },
            }}
          >
            {/* 아이콘 */}
            {item.icon}

            {/* 텍스트 */}
            {item.title}
          </ListItemButton>
        );
      })}
    </Box>
  );
}
