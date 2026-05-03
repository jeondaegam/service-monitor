import { Box } from "@mui/material";
import { NavDesktop } from "./nav";
import OrderTimeline from "../../sections/overview/analytics-order-timeline";

export function DashboardLayout({ children }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "260px minmax(0, 1fr) 360px",
        minHeight: "100vh",
        bgcolor: "#0d0f14",
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
          bgcolor: "#0d0f14",
        }}
      >
        {children}
      </Box>

      <Box
        component="aside"
        sx={{
          p: 3,
          bgcolor: "#0d0f14",
          borderLeft: "1px solid #232840",
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
