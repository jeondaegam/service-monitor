import { Box, Card, Typography } from "@mui/material";

export default function SummaryCard({ title, value, icon, color = "#1976d2" }) {
  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 4,
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            bgcolor: `${color}22`,
            color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
