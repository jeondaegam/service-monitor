import Card from "@mui/material/Card";
import Timeline from "@mui/lab/Timeline";
import TimelineDot from "@mui/lab/TimelineDot";
import Typography from "@mui/material/Typography";
import CardHeader from "@mui/material/CardHeader";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";

const timelineList = [
  {
    id: "1",
    type: "success",
    // title: "[복구 완료] API 서버 정상 응답 상태로 전환",
    title: "[복구 완료] API 서버 정상 응답 상태로 전환",
    time: "2026-04-30T09:20:00",
  },
  {
    id: "2",
    type: "critical",
    title: "[서버 다운] API 서버 응답 불가 상태 발생",
    time: "2026-04-30T09:12:00",
  },
  {
    id: "3",
    type: "critical",
    title: "[DB 장애]  user-service DB connection timeout (5초 초과)",
    // title: "DB Connection Timeout — user-service ",
    time: "2026-04-30T09:05:00",
  },
  {
    id: "4",
    type: "warning",
    title: "[CPU 경고] api-server CPU 사용률 80% 이상 10분 지속",
    // title: "CPU 과부하 — api-gateway ",
    time: "2026-04-30T08:50:00",
  },
  {
    id: "5",
    type: "info",
    title: "[메모리 경고] 메모리 사용률 80% 이상 5분 지속",
    time: "2026-04-30T08:40:00",
  },
  {
    id: "6",
    type: "info",
    title: "[트래픽 증가] api-server API 요청 수 급증 (평균 대비 +120%)",
    time: "2026-04-30T08:30:00",
  },
];

const DOT_COLORS = {
  critical: "#FF5630",
  error: "#FF5630",
  warning: "#FFAB00",
  warn: "#FFAB00",
  info: "#00B8D9",
  success: "#22C55E",
  resolved: "#22C55E",
};

// 04.30 09:20 형식 
function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  const pad = (number) => String(number).padStart(2, "0");

  return `${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

// 26-05-09 23:03:21 형식
// function formatDateTime(value) {
//   if (!value) return "";

//   const date = new Date(value);
//   const pad = (number) => String(number).padStart(2, "0");

//   return `${String(date.getFullYear()).slice(2)}-${pad(date.getMonth() + 1)}-${pad(
//     date.getDate(),
//   )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
// }

function getTimelineDotColor(type) {
  return DOT_COLORS[type] || "#1877F2";
}

export default function OrderTimeline({
  title = "최근 장애 이력",
  subheader,
  list = timelineList,
  sx,
}) {
  return (
    <Card
      sx={{
        bgcolor: "var(--app-panel)",
        color: "var(--app-text)",
        border: "1px solid var(--app-border)",
        borderRadius: 2,
        boxShadow: "var(--app-shadow)",
        overflow: "hidden",
        ...(sx || {}),
      }}
    >
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 0,
          "& .MuiCardHeader-title": {
            color: "var(--app-text)",
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 3.3,
          },
          "& .MuiCardHeader-subheader": {
            color: "var(--app-muted)",
            fontSize: 12,
          },
        }}
      />

      <Timeline
        sx={{
          m: 0,
          px: 2.5,
          py: 2,
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {list.map((item, index) => (
          <Item
            key={item.id}
            item={item}
            lastItem={index === list.length - 1}
          />
        ))}
      </Timeline>
    </Card>
  );
}

function Item({ item, lastItem }) {
  return (
    <TimelineItem sx={{ minHeight: 70 }}>
      <TimelineSeparator>
        <TimelineDot
          sx={{
            m: "6px 0 8px",
            bgcolor: getTimelineDotColor(item.type),
          }}
        />
        {lastItem ? null : (
          <TimelineConnector
            sx={{
              width: 2,
              minHeight: 34,
              flexGrow: 0,
              bgcolor: "var(--app-border)",
            }}
          />
        )}
      </TimelineSeparator>

      <TimelineContent sx={{ pt: 0, pb: 2.1, pr: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{
            color: "var(--app-text)",
            fontSize: 13,
            fontWeight: 650,
            lineHeight: 1.45,
            wordBreak: "keep-all",
          }}
        >
          {item.title}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            color: "var(--app-soft-text)",
            fontSize: 12,
            lineHeight: 1.4,
          }}
        >
          {formatDateTime(item.time)}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
}
