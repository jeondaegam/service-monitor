import { useState, useEffect } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// 더미 데이터 생성
const generateData = () =>
  [
    "00시",
    "02시",
    "04시",
    "06시",
    "08시",
    "10시",
    "12시",
    "14시",
    "16시",
    "18시",
    "20시",
    "22시",
  ].map((time) => ({
    time,
    errorRate: parseFloat((Math.random() * 8 + 0.2).toFixed(2)),
    requests: Math.floor(Math.random() * 800 + 200),
    critical: parseFloat((Math.random() * 2).toFixed(2)),
  }));

const COLORS = {
  bg: "#0d0f14",
  surface: "#13161e",
  card: "#181c27",
  border: "#232840",
  accent: "#e84545",
  accentSoft: "rgba(232,69,69,0.15)",
  blue: "#4a9eff",
  blueSoft: "rgba(74,158,255,0.15)",
  text: "#e8eaf0",
  muted: "#7b82a0",
  success: "#2dd4a0",
  warning: "#f59e42",
};

const cardStyle = {
  background: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "16px",
  padding: "24px",
};

const MetricCard = ({ label, value, unit, sub, color, trend }) => (
  <div
    style={{
      ...cardStyle,
      flex: 1,
      minWidth: "180px",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "80px",
        height: "80px",
        background: color,
        borderRadius: "0 16px 0 100%",
        opacity: 0.08,
      }}
    />
    <p
      style={{
        margin: 0,
        fontSize: "12px",
        color: COLORS.muted,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </p>
    <p
      style={{
        margin: "10px 0 4px",
        fontSize: "38px",
        fontWeight: 700,
        color,
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      {value}
      <span
        style={{
          fontSize: "16px",
          fontWeight: 400,
          color: COLORS.muted,
          marginLeft: "4px",
        }}
      >
        {unit}
      </span>
    </p>
    <p style={{ margin: 0, fontSize: "12px", color: COLORS.muted }}>
      {trend} <span style={{ color: COLORS.text }}>{sub}</span>
    </p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: "13px",
      }}
    >
      <p style={{ margin: "0 0 8px", color: COLORS.muted, fontWeight: 600 }}>
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.name} style={{ margin: "4px 0", color: p.color }}>
          {p.name}:{" "}
          <strong style={{ color: COLORS.text }}>
            {p.value}
            {p.name.includes("율") || p.name.includes("임계") ? "%" : "건"}
          </strong>
        </p>
      ))}
    </div>
  );
};

export default function StatsDashboard() {
  const [data, setData] = useState(generateData());
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const avgError = (
    data.reduce((s, d) => s + d.errorRate, 0) / data.length
  ).toFixed(2);
  const maxError = Math.max(...data.map((d) => d.errorRate)).toFixed(2);
  const totalReq = data.reduce((s, d) => s + d.requests, 0).toLocaleString();
  const avgCritical = (
    data.reduce((s, d) => s + d.critical, 0) / data.length
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
    <div
      style={{
        // minHeight: "100vh",
        // background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'DM Sans', 'Pretendard', sans-serif",
        // padding: "32px",
        boxSizing: "border-box",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "32px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: COLORS.success,
                boxShadow: `0 0 8px ${COLORS.success}`,
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: COLORS.success,
                letterSpacing: "0.06em",
              }}
            >
              LIVE
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            서비스 에러율 대시보드
          </h1>
          <p
            style={{ margin: "6px 0 0", fontSize: "13px", color: COLORS.muted }}
          >
            마지막 업데이트: {lastUpdated.toLocaleTimeString("ko-KR")}
          </p>
        </div>
        <button
          onClick={refresh}
          style={{
            background: COLORS.accentSoft,
            border: `1px solid ${COLORS.accent}`,
            color: COLORS.accent,
            borderRadius: "10px",
            padding: "10px 20px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
            transition: "all 0.2s",
            opacity: isRefreshing ? 0.6 : 1,
          }}
        >
          {isRefreshing ? "갱신 중..." : "↻ 새로고침"}
        </button>
      </div>

      {/* 지표 카드 */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <MetricCard
          label="평균 에러율"
          value={avgError}
          unit="%"
          sub="오늘 평균"
          color={COLORS.accent}
          trend="📊"
        />
        <MetricCard
          label="최고 에러율"
          value={maxError}
          unit="%"
          sub="금일 최고치"
          color={COLORS.warning}
          trend="⚠️"
        />
        <MetricCard
          label="전체 요청 수"
          value={totalReq}
          unit="건"
          sub="24시간 누적"
          color={COLORS.blue}
          trend="📈"
        />
        <MetricCard
          label="임계 에러율"
          value={avgCritical}
          unit="%"
          sub="심각 수준"
          color="#b06aff"
          trend="🔴"
        />
      </div>

      {/* 메인 차트 */}
      <div style={{ ...cardStyle, marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
              시간대별 에러율 + 요청 수
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "12px",
                color: COLORS.muted,
              }}
            >
              최근 24시간 기준
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
            <span style={{ color: COLORS.accent }}>━ 에러율</span>
            <span style={{ color: COLORS.warning }}>━ 임계 에러</span>
            <span style={{ color: COLORS.blue }}>▌ 요청 수</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={COLORS.border}
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fill: COLORS.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: COLORS.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: COLORS.muted, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              yAxisId="right"
              dataKey="requests"
              name="요청 수"
              fill={COLORS.blue}
              opacity={0.25}
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="errorRate"
              name="에러율"
              stroke={COLORS.accent}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: COLORS.accent }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="critical"
              name="임계 에러"
              stroke={COLORS.warning}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 하단: 시간대별 요약 테이블 */}
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 600 }}>
          시간대별 상세
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                {["시간대", "에러율", "요청 수", "임계 에러율", "상태"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        color: COLORS.muted,
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const status =
                  row.errorRate > 5
                    ? { label: "위험", color: COLORS.accent }
                    : row.errorRate > 2
                      ? { label: "주의", color: COLORS.warning }
                      : { label: "정상", color: COLORS.success };
                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: `1px solid ${COLORS.border}`,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = COLORS.surface)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td style={{ padding: "10px 12px", color: COLORS.muted }}>
                      {row.time}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        color: status.color,
                        fontWeight: 600,
                      }}
                    >
                      {row.errorRate}%
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {row.requests.toLocaleString()}건
                    </td>
                    <td style={{ padding: "10px 12px", color: COLORS.warning }}>
                      {row.critical}%
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          background: `${status.color}20`,
                          color: status.color,
                          border: `1px solid ${status.color}50`,
                          borderRadius: "6px",
                          padding: "2px 10px",
                          fontSize: "11px",
                          fontWeight: 600,
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
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
