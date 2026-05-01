import { Box } from "@mui/material";
import { NavDesktop } from "./nav";
import OrderTimeline from "../../sections/overview/analytics-order-timeline";

export function DashboardLayout({ children }) {
  return (
    // 좌측 사이드바
    <Box sx={{ display: "flex" }}>
      <NavDesktop />

      {/* 메인 콘텐츠 */}
      <Box sx={{ ml: "260px", p: 4, flex: 1 }}>{children}</Box>

      {/* 👉 우측 Timeline */}
      <Box
        sx={{
          width: 320,
          p: 2,
          borderLeft: "1px solid #eee",
          bgcolor: "#fff",
        }}
      >
        <OrderTimeline />
      </Box>
    </Box>
  );
}
