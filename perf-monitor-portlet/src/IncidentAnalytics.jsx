import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// API 연동시 false 
const USE_DEMO_DATA = true;

const COLORS = {
  page: "var(--app-bg)",
  panel: "var(--app-panel)",
  panelAlt: "var(--app-panel-alt)",
  border: "var(--app-border)",
  text: "var(--app-text)",
  muted: "var(--app-muted)",
  softText: "var(--app-soft-text)",
  critical: "var(--app-danger)",
  warning: "var(--app-warning)",
  success: "var(--app-success)",
  cpu: "#ef4444",
  db: "#2563eb",
  down: "#7c3aed",
  traffic: "#0d9488",
  line: "#334155",
};

const INCIDENT_TYPE_META = {
  CPU: {
    label: "CPU",
    color: COLORS.cpu,
    rule: "CPU 80% 이상 10분 지속",
  },
  DB: {
    label: "DB",
    color: COLORS.db,
    rule: "Connection timeout 5초 이상",
  },
  SERVER_DOWN: {
    label: "Server Down",
    color: COLORS.down,
    rule: "Server ON/OFF 상태 체크 실패",
  },
  API_TRAFFIC: {
    label: "API Traffic",
    color: COLORS.traffic,
    rule: "API 트래픽 임계치 초과",
  },
};

const DEMO_INCIDENT_ANALYTICS = {
  generatedAt: "2026-05-03T13:40:00+09:00",
  summary: {
    activeIncidents: 3,
    warningServers: 5,
    todayIncidents: 18,
    mttrMinutes: 16,
    availability: 99.91,
  },
  typeBreakdown: [
    { type: "CPU", count: 7 },
    { type: "DB", count: 4 },
    { type: "SERVER_DOWN", count: 2 },
    { type: "API_TRAFFIC", count: 5 },
  ],
  hourlyTrend: [
    { time: "00:00", total: 1, cpu: 0, db: 1, down: 0, traffic: 0 },
    { time: "03:00", total: 0, cpu: 0, db: 0, down: 0, traffic: 0 },
    { time: "06:00", total: 2, cpu: 1, db: 0, down: 0, traffic: 1 },
    { time: "09:00", total: 4, cpu: 2, db: 1, down: 0, traffic: 1 },
    { time: "12:00", total: 6, cpu: 2, db: 1, down: 1, traffic: 2 },
    { time: "15:00", total: 3, cpu: 1, db: 1, down: 0, traffic: 1 },
    { time: "18:00", total: 2, cpu: 1, db: 0, down: 1, traffic: 0 },
    { time: "21:00", total: 0, cpu: 0, db: 0, down: 0, traffic: 0 },
  ],
  serverRiskRanking: [
    {
      serverName: "api-01",
      status: "CRITICAL",
      riskScore: 92,
      incidents: 8,
      mainType: "CPU",
      lastSeen: "5분 전",
    },
    {
      serverName: "db-01",
      status: "WARNING",
      riskScore: 76,
      incidents: 4,
      mainType: "DB",
      lastSeen: "18분 전",
    },
    {
      serverName: "api-02",
      status: "WARNING",
      riskScore: 68,
      incidents: 3,
      mainType: "API_TRAFFIC",
      lastSeen: "42분 전",
    },
    {
      serverName: "web-02",
      status: "NORMAL",
      riskScore: 34,
      incidents: 2,
      mainType: "SERVER_DOWN",
      lastSeen: "어제",
    },
  ],
  activeIncidents: [
    {
      id: "inc-20260503-001",
      serverName: "api-01",
      type: "CPU",
      condition: "CPU 80% 이상 10분 지속",
      measuredValue: "87.4%",
      threshold: "80%",
      durationMinutes: 17,
      status: "장애",
      owner: "SRE Team",
      startedAt: "2026-05-03T13:21:00+09:00",
    },
    {
      id: "inc-20260503-002",
      serverName: "db-01",
      type: "DB",
      condition: "Connection timeout 5초 이상",
      measuredValue: "6.8초",
      threshold: "5초",
      durationMinutes: 9,
      status: "경고",
      owner: "DBA",
      startedAt: "2026-05-03T13:31:00+09:00",
    },
    {
      id: "inc-20260503-003",
      serverName: "api-02",
      type: "API_TRAFFIC",
      condition: "분당 요청 수 10,000회 초과",
      measuredValue: "12,430회/min",
      threshold: "10,000회/min",
      durationMinutes: 6,
      status: "경고",
      owner: "Backend Team",
      startedAt: "2026-05-03T13:34:00+09:00",
    },
  ],
  recentIncidents: [
    {
      id: "hist-001",
      serverName: "api-01",
      type: "CPU",
      startedAt: "2026-05-03T12:44:00+09:00",
      endedAt: "2026-05-03T13:01:00+09:00",
      durationMinutes: 17,
      status: "복구",
    },
    {
      id: "hist-002",
      serverName: "web-02",
      type: "SERVER_DOWN",
      startedAt: "2026-05-03T11:20:00+09:00",
      endedAt: "2026-05-03T11:25:00+09:00",
      durationMinutes: 5,
      status: "복구",
    },
    {
      id: "hist-003",
      serverName: "db-01",
      type: "DB",
      startedAt: "2026-05-03T10:12:00+09:00",
      endedAt: "2026-05-03T10:24:00+09:00",
      durationMinutes: 12,
      status: "복구",
    },
    {
      id: "hist-004",
      serverName: "api-02",
      type: "API_TRAFFIC",
      startedAt: "2026-05-03T09:31:00+09:00",
      endedAt: "2026-05-03T09:39:00+09:00",
      durationMinutes: 8,
      status: "복구",
    },
  ],
};

async function fetchIncidentAnalytics() {
  if (USE_DEMO_DATA) {
    return Promise.resolve(DEMO_INCIDENT_ANALYTICS);
  }

  // API 연동시 수정 (URL 예시) 
  const response = await fetch("/api/incidents/analytics");
  if (!response.ok) {
    throw new Error("Failed to fetch incident analytics");
  }
  return response.json();
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusStyle(status) {
  if (status === "CRITICAL" || status === "장애") {
    return { color: COLORS.critical, background: "#fee2e2", label: "장애" };
  }
  if (status === "WARNING" || status === "경고") {
    return { color: COLORS.warning, background: "#fef3c7", label: "경고" };
  }
  return { color: COLORS.success, background: "#dcfce7", label: "정상" };
}

function Card({ children, style }) {
  return (
    <section
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ margin: 0, color: COLORS.text, fontSize: 16, fontWeight: 700 }}>
        {title}
      </h2>
      {sub && (
        <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 12 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function SummaryCard({ label, value, unit, helper, color }) {
  return (
    <Card style={{ minHeight: 122 }}>
      <p style={{ margin: 0, color: COLORS.muted, fontSize: 12, fontWeight: 600 }}>
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 12 }}>
        <strong style={{ color, fontSize: 32, lineHeight: 1 }}>{value}</strong>
        {unit && <span style={{ color: COLORS.muted, fontSize: 13 }}>{unit}</span>}
      </div>
      <p style={{ margin: "10px 0 0", color: COLORS.softText, fontSize: 12 }}>
        {helper}
      </p>
    </Card>
  );
}

function StatusBadge({ status }) {
  const statusStyle = getStatusStyle(status);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minWidth: 48,
        justifyContent: "center",
        padding: "3px 8px",
        borderRadius: 999,
        background: statusStyle.background,
        color: statusStyle.color,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {statusStyle.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const meta = INCIDENT_TYPE_META[type];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: meta.color,
          flex: "0 0 auto",
        }}
      />
      <span>{meta.label}</span>
    </span>
  );
}

function AnalyticsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: "10px 12px",
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)",
      }}
    >
      <p style={{ margin: "0 0 8px", color: COLORS.text, fontSize: 12, fontWeight: 700 }}>
        {label}
      </p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ margin: "4px 0", color: item.color, fontSize: 12 }}>
          {item.name}: <strong>{item.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function IncidentAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchIncidentAnalytics();
      setAnalytics(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const chartBreakdown = useMemo(() => {
    if (!analytics) return [];
    return analytics.typeBreakdown.map((item) => ({
      ...item,
      label: INCIDENT_TYPE_META[item.type].label,
      color: INCIDENT_TYPE_META[item.type].color,
    }));
  }, [analytics]);

  if (loading) {
    return (
      <div style={{ padding: 32, color: COLORS.muted, fontSize: 14 }}>
        장애 통계 데이터를 불러오는 중입니다.
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={{ padding: 32 }}>
        <Card>
          <SectionTitle title="데이터 조회 실패" sub={errorMessage} />
          <button
            onClick={loadAnalytics}
            style={{
              border: `1px solid ${COLORS.border}`,
              background: COLORS.panel,
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </Card>
      </div>
    );
  }

  const { summary } = analytics;

  return (
    <div
      style={{
        minHeight: "100%",
        background: COLORS.page,
        padding: "28px 32px",
        color: COLORS.text,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
            Incident Analytics
          </h1>
          <p style={{ margin: "6px 0 0", color: COLORS.muted, fontSize: 13 }}>
            장애 조건 기반으로 현재 위험도, 유형별 빈도, 서버별 반복 장애를 분석합니다.
          </p>
          <p style={{ margin: "6px 0 0", color: COLORS.softText, fontSize: 12 }}>
            마지막 집계: {formatDateTime(analytics.generatedAt)}
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          style={{
            background: COLORS.text,
            color: "#fff",
            border: 0,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          새로고침
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <SummaryCard
          label="현재 장애"
          value={summary.activeIncidents}
          unit="건"
          helper="실시간 확인 필요"
          color={COLORS.critical}
        />
        <SummaryCard
          label="경고 서버"
          value={summary.warningServers}
          unit="대"
          helper="임계치 근접 서버"
          color={COLORS.warning}
        />
        <SummaryCard
          label="오늘 장애"
          value={summary.todayIncidents}
          unit="건"
          helper="최근 24시간 기준"
          color={COLORS.line}
        />
        <SummaryCard
          label="평균 복구 시간"
          value={summary.mttrMinutes}
          unit="분"
          helper="MTTR"
          color={COLORS.db}
        />
        <SummaryCard
          label="가용률"
          value={summary.availability}
          unit="%"
          helper="오늘 누적 기준"
          color={COLORS.success}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.5fr) minmax(320px, 0.9fr)",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Card>
          <SectionTitle
            title="시간대별 장애 추이"
            sub="CPU, DB, 서버 다운, API 트래픽 장애를 시간대별로 비교합니다."
          />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={analytics.hourlyTrend} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<AnalyticsTooltip />} />
              <Line type="monotone" dataKey="total" name="전체" stroke={COLORS.line} strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="cpu" name="CPU" stroke={COLORS.cpu} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="db" name="DB" stroke={COLORS.db} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="traffic" name="API Traffic" stroke={COLORS.traffic} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle title="장애 유형 비율" sub="오늘 발생한 장애의 원인 분포입니다." />
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={chartBreakdown}
                dataKey="count"
                nameKey="label"
                innerRadius={54}
                outerRadius={82}
                paddingAngle={3}
              >
                {chartBreakdown.map((entry) => (
                  <Cell key={entry.type} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<AnalyticsTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "grid", gap: 8 }}>
            {chartBreakdown.map((item) => (
              <div
                key={item.type}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: COLORS.muted,
                  fontSize: 12,
                }}
              >
                <TypeBadge type={item.type} />
                <strong style={{ color: COLORS.text }}>{item.count}건</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(360px, 0.95fr) minmax(0, 1.35fr)",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Card>
          <SectionTitle title="서버별 위험도" sub="반복 장애와 최근 상태를 기준으로 산정한 데모 점수입니다." />
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={analytics.serverRiskRanking} layout="vertical" margin={{ top: 4, right: 12, left: 10, bottom: 0 }}>
              <CartesianGrid stroke={COLORS.border} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="serverName" type="category" tick={{ fill: COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<AnalyticsTooltip />} />
              <Bar dataKey="riskScore" name="위험도" radius={[0, 6, 6, 0]}>
                {analytics.serverRiskRanking.map((entry) => (
                  <Cell key={entry.serverName} fill={getStatusStyle(entry.status).color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle title="현재 진행 중인 장애" sub="운영자가 먼저 확인해야 할 활성 장애 목록입니다." />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr style={{ background: COLORS.panelAlt }}>
                  {["상태", "서버", "유형", "조건", "측정값", "지속", "담당"].map((header) => (
                    <th key={header} style={tableHeaderStyle}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analytics.activeIncidents.map((incident) => (
                  <tr key={incident.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <td style={tableCellStyle}><StatusBadge status={incident.status} /></td>
                    <td style={tableCellStrongStyle}>{incident.serverName}</td>
                    <td style={tableCellStyle}><TypeBadge type={incident.type} /></td>
                    <td style={tableCellStyle}>{incident.condition}</td>
                    <td style={tableCellStrongStyle}>{incident.measuredValue}</td>
                    <td style={tableCellStyle}>{incident.durationMinutes}분</td>
                    <td style={tableCellStyle}>{incident.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 0.85fr)",
          gap: 16,
        }}
      >
        <Card>
          <SectionTitle title="최근 장애 이력" sub="복구 완료된 장애를 지속 시간 기준으로 확인합니다." />
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
              <thead>
                <tr style={{ background: COLORS.panelAlt }}>
                  {["서버", "유형", "발생", "복구", "지속 시간", "상태"].map((header) => (
                    <th key={header} style={tableHeaderStyle}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analytics.recentIncidents.map((incident) => (
                  <tr key={incident.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <td style={tableCellStrongStyle}>{incident.serverName}</td>
                    <td style={tableCellStyle}><TypeBadge type={incident.type} /></td>
                    <td style={tableCellStyle}>{formatDateTime(incident.startedAt)}</td>
                    <td style={tableCellStyle}>{formatDateTime(incident.endedAt)}</td>
                    <td style={tableCellStrongStyle}>{incident.durationMinutes}분</td>
                    <td style={tableCellStyle}><StatusBadge status={incident.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <SectionTitle title="장애 판단 기준" sub="백엔드 룰 엔진 또는 설정 API로 분리하기 좋은 영역입니다." />
          <div style={{ display: "grid", gap: 10 }}>
            {Object.entries(INCIDENT_TYPE_META).map(([type, meta]) => (
              <div
                key={type}
                style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 8,
                  padding: 12,
                  background: COLORS.panelAlt,
                }}
              >
                <div style={{ color: COLORS.text, fontSize: 13, fontWeight: 700 }}>
                  <TypeBadge type={type} />
                </div>
                <p style={{ margin: "6px 0 0", color: COLORS.muted, fontSize: 12 }}>
                  {meta.rule}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

const tableHeaderStyle = {
  textAlign: "left",
  color: COLORS.muted,
  fontSize: 11,
  fontWeight: 700,
  padding: "10px 12px",
  whiteSpace: "nowrap",
};

const tableCellStyle = {
  color: COLORS.muted,
  fontSize: 12,
  padding: "12px",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
};

const tableCellStrongStyle = {
  ...tableCellStyle,
  color: COLORS.text,
  fontWeight: 700,
};
