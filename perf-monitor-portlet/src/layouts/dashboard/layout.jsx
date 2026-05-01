import { Box } from "@mui/material";
import { NavDesktop } from "./nav";
import OrderTimeline from "../../sections/overview/analytics-order-timeline";

// export function DashboardLayout({ children }) {
//   return (
//     // 좌측 사이드바
//     <Box sx={{ display: "flex" }}>
//       <NavDesktop />

//       {/* 메인 콘텐츠 */}
//       <Box sx={{ ml: "260px", p: 4, flex: 1 }}>{children}</Box>

//       {/* 👉 우측 Timeline */}
//       <Box
//         sx={{
//           width: 320,
//           p: 2,
//           borderLeft: "1px solid #eee",
//           bgcolor: "#fff",
//         }}
//       >
//         <OrderTimeline />
//       </Box>
//     </Box>
//   );
// }

// export function DashboardLayout({ children }) {
//   return (
//     <Box sx={{ display: "flex", minHeight: "100vh" }}>
//       {/* 좌측 사이드바 */}
//       <NavDesktop />

//       {/* 👉 메인 + 우측 영역을 하나로 묶기 */}
//       <Box
//         sx={{
//           ml: "260px",
//           display: "flex",
//           flex: 1,
//           bgcolor: "#0d0f14",
//         }}
//       >
//         {/* 메인 콘텐츠 */}
//         <Box sx={{ flex: 1, p: 4 }}>{children}</Box>

//         {/* 우측 Timeline */}
//         <Box
//           sx={{
//             width: 320,
//             p: 2,
//             flexShrink: 0,
//             borderLeft: "1px solid #232840",
//             bgcolor: "#0d0f14",
//           }}
//         >
//           <OrderTimeline />
//         </Box>
//       </Box>
//     </Box>
//   );
// }

export function DashboardLayout({ children }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0d0f14" }}>
      <NavDesktop />

      {/* 메인 콘텐츠 영역 */}
      <Box
        sx={{
          ml: "260px",
          //mr: "360px", // 오른쪽 Timeline 공간 확보
          p: 4,
          minHeight: "100vh",
          bgcolor: "#0d0f14",
        }}
      >
        {children}
      </Box>

      {/* 우측 고정 Timeline */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          right: 0,
          // width: 360,
          // width: 300,
          height: "100vh",
          p: 3,
          bgcolor: "#0d0f14",
          borderLeft: "1px solid #232840",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <OrderTimeline />
      </Box>
    </Box>
  );
}
