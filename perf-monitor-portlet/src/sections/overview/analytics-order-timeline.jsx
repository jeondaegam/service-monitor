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
    title: "[복구 완료] API 서버 정상 응답 상태로 전환",
    time: "2026-04-30T09:20:00",
  },
  {
    id: "2",
    type: "critical",
    title: "[서버 다운] API 서버 응답 불가 상태",
    time: "2026-04-30T09:12:00",
  },
  {
    id: "3",
    type: "critical",
    title: "[DB 장애] connection timeout 5초 초과 발생",
    time: "2026-04-30T09:05:00",
  },
  {
    id: "4",
    type: "warning",
    title: "[CPU 경고] 사용률 80% 이상 10분 지속",
    time: "2026-04-30T08:50:00",
  },
  {
    id: "5",
    type: "info",
    title: "[메모리 경고] 사용률 80% 이상 5분 지속",
    time: "2026-04-30T08:40:00",
  },
  {
    id: "6",
    type: "info",
    title: "[트래픽 증가] API 요청 수 급증 감지",
    time: "2026-04-30T08:30:00",
  },
];

function formatDateTime(value) {
  if (!value) return "";

  return new Date(value).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTimelineDotColor(type) {
  const colorMap = {
    critical: "error",
    error: "error",
    warning: "warning",
    warn: "warning",
    info: "info",
    success: "success",
    resolved: "success",
  };

  return colorMap[type] || "primary";
}

export default function OrderTimeline({
  title = "이벤트 피드",
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
            lineHeight: 1.3,
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
    <TimelineItem sx={{ minHeight: 72 }}>
      <TimelineSeparator>
        <TimelineDot
          color={getTimelineDotColor(item.type)}
          sx={{
            m: "5px 0",
          }}
        />
        {lastItem ? null : (
          <TimelineConnector sx={{ bgcolor: "var(--app-border)" }} />
        )}
      </TimelineSeparator>

      <TimelineContent sx={{ pt: 0, pb: 2.25, pr: 0 }}>
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
            fontSize: 11,
            lineHeight: 1.4,
          }}
        >
          {formatDateTime(item.time)}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
}
