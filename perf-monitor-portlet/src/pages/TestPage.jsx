import { Box } from "@mui/material";
import StorageIcon from "@mui/icons-material/Storage";
import ErrorIcon from "@mui/icons-material/Error";
import MailIcon from "@mui/icons-material/Mail";
import SummaryCard from "../components/SummaryCard";

export default function TestPage() {
  return (
    <Box>
      <h1>test page</h1>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 3,
          mt: 3,
        }}
      >
        <SummaryCard
          title="서버 상태"
          value="정상"
          icon={<StorageIcon />}
          color="#1976d2"
        />

        <SummaryCard
          title="에러 로그"
          value="12건"
          icon={<ErrorIcon />}
          color="#f44336"
        />

        <SummaryCard
          title="메일 알림"
          value="5건"
          icon={<MailIcon />}
          color="#4caf50"
        />
      </Box>

      {/* timeline
      <Box sx={{ mt: 4 }}>
        <OrderTimeline />
      </Box> */}
    </Box>
  );
}
