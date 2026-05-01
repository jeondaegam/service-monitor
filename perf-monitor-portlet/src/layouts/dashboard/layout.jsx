import { Box } from "@mui/material";
import { NavDesktop } from "./nav";

export function DashboardLayout({ children }) {
  return (
    <Box sx={{ display: "flex" }}>
      <NavDesktop />

      <Box sx={{ ml: "260px", p: 4, flex: 1 }}>{children}</Box>
    </Box>
  );
}
