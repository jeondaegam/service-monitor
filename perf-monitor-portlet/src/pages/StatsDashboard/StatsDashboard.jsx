import { useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import styles from "./StatsDashboard.module.css";

const CHART_COLORS = {
  accent: "var(--app-danger)",
  blue: "#4a9eff",
  purple: "#b06aff",
  muted: "var(--app-muted)",
  border: "var(--app-border)",
  success: "var(--app-success)",
  warning: "var(--app-warning)",
};

const generateData = () =>
  ["00시", "02시", "04시", "06시", "08시", "10시", "12시", "14시", "16시", "18시", "20시", "22시"].map(
    (time) => ({
      time,
      errorRate: parseFloat((Math.random() * 8 + 0.2).toFixed(2)),
      requests: Math.floor(Math.random() * 800 + 200),
      critical: parseFloat((Math.random() * 2).toFixed(2)),
    }),
  );

function MetricCard({ label, value, unit, sub, color, trend }) {
  return (
    <div className={styles.metricCard} style={{ "--metric-color": color }}>
      <div className={styles.metricAccent} />
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>
        {value}
        <span className={styles.metricUnit}>{unit}</span>
      </p>
      <p className={styles.metricSub}>
        {trend} <strong>{sub}</strong>
      </p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{label}</p>
      {payload.map((item) => (
        <p
          key={item.name}
          className={styles.tooltipLine}
          style={{ "--tooltip-color": item.color }}
        >
          {item.name}:{" "}
          <strong>
            {item.value}
            {item.name.includes("율") || item.name.includes("임계") ? "%" : "건"}
          </strong>
        </p>
      ))}
    </div>
  );
}

function getRowStatus(row) {
  if (row.errorRate > 5) {
    return { label: "위험", color: CHART_COLORS.accent };
  }

  if (row.errorRate > 2) {
    return { label: "주의", color: CHART_COLORS.warning };
  }

  return { label: "정상", color: CHART_COLORS.success };
}

export default function StatsDashboard() {
  const [data, setData] = useState(generateData());
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const avgError = (
    data.reduce((sum, item) => sum + item.errorRate, 0) / data.length
  ).toFixed(2);
  const maxError = Math.max(...data.map((item) => item.errorRate)).toFixed(2);
  const totalReq = data.reduce((sum, item) => sum + item.requests, 0).toLocaleString();
  const avgCritical = (
    data.reduce((sum, item) => sum + item.critical, 0) / data.length
  ).toFixed(2);

  const refresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setData(generateData());
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.liveRow}>
            <div className={styles.liveDot} />
            <span className={styles.liveText}>LIVE</span>
          </div>
          <h1 className={styles.title}>서비스 에러율 대시보드</h1>
          <p className={styles.subtitle}>
            마지막 업데이트: {lastUpdated.toLocaleTimeString("ko-KR")}
          </p>
        </div>

        <button
          className={`${styles.refreshButton} ${isRefreshing ? styles.refreshing : ""}`}
          type="button"
          onClick={refresh}
        >
          {isRefreshing ? "갱신 중..." : "새로고침"}
        </button>
      </header>

      <div className={styles.metricsGrid}>
        <MetricCard
          label="평균 에러율"
          value={avgError}
          unit="%"
          sub="오늘 평균"
          color={CHART_COLORS.accent}
          trend="↗"
        />
        <MetricCard
          label="최고 에러율"
          value={maxError}
          unit="%"
          sub="금일 최고치"
          color={CHART_COLORS.warning}
          trend="!"
        />
        <MetricCard
          label="전체 요청 수"
          value={totalReq}
          unit="건"
          sub="24시간 누적"
          color={CHART_COLORS.blue}
          trend="↗"
        />
        <MetricCard
          label="임계 에러율"
          value={avgCritical}
          unit="%"
          sub="경계 수준"
          color={CHART_COLORS.purple}
          trend="!"
        />
      </div>

      <section className={`${styles.card} ${styles.chartCard}`}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.sectionTitle}>시간대별 에러율 + 요청 수</h2>
            <p className={styles.sectionSub}>최근 24시간 기준</p>
          </div>
          <div className={styles.legend}>
            <span style={{ color: CHART_COLORS.accent }}>━ 에러율</span>
            <span style={{ color: CHART_COLORS.warning }}>━ 임계 에러</span>
            <span style={{ color: CHART_COLORS.blue }}>▌ 요청 수</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
            <XAxis dataKey="time" tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="left"
              tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="right"
              dataKey="requests"
              name="요청 수"
              fill={CHART_COLORS.blue}
              opacity={0.25}
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="errorRate"
              name="에러율"
              stroke={CHART_COLORS.accent}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: CHART_COLORS.accent }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="critical"
              name="임계 에러"
              stroke={CHART_COLORS.warning}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>시간대별 상세</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {["시간대", "에러율", "요청 수", "임계 에러율", "상태"].map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const status = getRowStatus(row);

                return (
                  <tr key={row.time}>
                    <td className={styles.mutedCell}>{row.time}</td>
                    <td className={styles.strongCell} style={{ "--status-color": status.color }}>
                      {row.errorRate}%
                    </td>
                    <td>{row.requests.toLocaleString()}건</td>
                    <td className={styles.warningCell}>{row.critical}%</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          "--status-bg": `${status.color}20`,
                          "--status-border": `${status.color}50`,
                          "--status-color": status.color,
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
