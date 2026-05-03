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
    id: '1',
    type: 'success',
    title: '[복구 완료] API 서버 정상 응답 상태로 전환',
    time: '2026-04-30T09:20:00',
  },
  {
    id: '2',
    type: 'critical',
    title: '[서버 다운] API 서버 응답 불가 상태',
    time: '2026-04-30T09:12:00',
  },
  {
    id: '3',
    type: 'critical',
    title: '[DB 장애] connection timeout 5초 초과 발생',
    time: '2026-04-30T09:05:00',
  },
  {
    id: '4',
    type: 'warning',
    title: '[CPU 과부하] 사용률 80% 이상 10분 지속',
    time: '2026-04-30T08:50:00',
  },
  {
    id: '5',
    type: 'info',
    title: '[메모리 경고] 사용률 80% 이상 5분 지속',
    time: '2026-04-30T08:40:00',
  },
  {
    id: '6',
    type: 'info',
    title: '[트래픽 증가] API 요청 10회 이상 급증 감지',
    time: '2026-04-30T08:30:00',
  },
];


function formatDateTime(value) {
  if (!value) return "";

  return new Date(value).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderTimeline({
  //   title = "Order timeline",
  title = "이벤트 피드",
  subheader,
  list = timelineList,
  sx,
}) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 12px 24px rgba(145, 158, 171, 0.12)",
        ...(sx || {}),
      }}
    >
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{
          p: 3,
          pb: 0,
          "& .MuiCardHeader-title": {
            fontWeight: 700,
            fontSize: 18,
          },
        }}
      />

      <Timeline
        sx={{
          m: 0,
          p: 3,
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
    <TimelineItem>
      <TimelineSeparator>
<TimelineDot
  color={
    (item.type === 'critical' && 'error') ||
    (item.type === 'warning' && 'warning') ||
    (item.type === 'info' && 'info') ||
    (item.type === 'success' && 'success') ||
    'primary'
  }
/>
        {lastItem ? null : <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent>
        <Typography variant="subtitle2">{item.title}</Typography>

        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {formatDateTime(item.time)}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
}
