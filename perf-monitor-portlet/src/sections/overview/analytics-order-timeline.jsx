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
    type: "order1",
    title: "1983, orders, $4220",
    time: "2023-11-08T00:00:00",
  },
  {
    id: "2",
    type: "order2",
    title: "12 Invoices have been paid",
    time: "2024-04-09T00:00:00",
  },
  {
    id: "3",
    type: "order3",
    title: "Order #37745 from September",
    time: "2023-09-12T00:00:00",
  },
  {
    id: "4",
    type: "order4",
    title: "New order placed #XF-2356",
    time: "2024-01-01T00:00:00",
  },
  {
    id: "5",
    type: "order5",
    title: "New order placed #XF-2346",
    time: "2024-04-23T00:00:00",
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
  title = "History",
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
            (item.type === "order1" && "primary") ||
            (item.type === "order2" && "success") ||
            (item.type === "order3" && "info") ||
            (item.type === "order4" && "warning") ||
            "error"
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
