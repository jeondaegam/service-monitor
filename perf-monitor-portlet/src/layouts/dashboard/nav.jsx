import { Box, ListItemButton } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { navData } from "../nav-config-dashboard";

export function NavDesktop() {
  const location = useLocation();

  return (
    <Box
      sx={{
        width: 260,
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        p: 2,
        bgcolor: "#fff",
        borderRight: "1px solid #eee",
      }}
    >
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
              color: active ? "primary.main" : "text.secondary",
              bgcolor: active ? "primary.lighter" : "transparent",
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
