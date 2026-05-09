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

import styles from "./IncidentStats.module.css";
// API 연동시 false 
const USE_DEMO_DATA = true;

const CHART_COLORS = {
  critical: "var(--app-danger)",
  warning: "var(--app-warning)",
  success: "var(--app-success)",
  cpu: "#ef4444",
  db: "#2563eb",
  down: "#7c3aed",
  traffic: "#0d9488",
  total: "#334155",
  muted: "var(--app-muted)",
  border: "var(--app-border)",
};

const INCIDENT_TYPE_META = {
  CPU: {
    label: "CPU",
    color: CHART_COLORS.cpu,
    rule: "CPU 80% 이상 10분 지속",
  },
  DB: {
    label: "DB",
    color: CHART_COLORS.db,
    rule: "Connection timeout 5초 이상",
  },
  SERVER_DOWN: {
    label: "Server Down",
    color: CHART_COLORS.down,
    rule: "Server ON/OFF 상태 체크 실패",
  },
  API_TRAFFIC: {
    label: "API Traffic",
    color: CHART_COLORS.traffic,
    rule: "API 트래픽 임계치 초과",
  },
};

const DEMO_INCIDENT_STATS = {
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

async function fetchIncidentStats() {
  if (USE_DEMO_DATA) {
    return Promise.resolve(DEMO_INCIDENT_STATS);
  }

  const response = await fetch("/api/incidents/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch incident stats");
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

function getStatusMeta(status) {
  if (status === "CRITICAL" || status === "장애") {
    return { color: CHART_COLORS.critical, background: "#fee2e2", label: "장애" };
  }

  if (status === "WARNING" || status === "경고") {
    return { color: CHART_COLORS.warning, background: "#fef3c7", label: "경고" };
  }

  return { color: CHART_COLORS.success, background: "#dcfce7", label: "정상" };
}

function Card({ children, className = "" }) {
  return <section className={`${styles.card} ${className}`}>{children}</section>;
}

function SectionTitle({ title, sub }) {
  return (
    <div className={styles.sectionTitle}>
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

function SummaryCard({ label, value, unit, helper, color }) {
  return (
    <Card className={styles.summaryCard}>
      <p className={styles.summaryLabel}>{label}</p>
      <div className={styles.summaryValueRow}>
        <strong className={styles.summaryValue} style={{ "--summary-color": color }}>
          {value}
        </strong>
        {unit && <span className={styles.summaryUnit}>{unit}</span>}
      </div>
      <p className={styles.summaryHelper}>{helper}</p>
    </Card>
  );
}

function StatusBadge({ status }) {
  const statusMeta = getStatusMeta(status);

  return (
    <span
      className={styles.statusBadge}
      style={{
        "--status-bg": statusMeta.background,
        "--status-color": statusMeta.color,
      }}
    >
      {statusMeta.label}
    </span>
  );
}

function TypeBadge({ type }) {
  const meta = INCIDENT_TYPE_META[type];

  return (
    <span className={styles.typeBadge}>
      <span className={styles.typeDot} style={{ "--type-color": meta.color }} />
      <span>{meta.label}</span>
    </span>
  );
}

function AnalyticsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{label}</p>
      {payload.map((item) => (
        <p
          key={item.dataKey || item.name}
          className={styles.tooltipLine}
          style={{ "--tooltip-color": item.color }}
        >
          {item.name}: <strong>{item.value}</strong>
        </p>
      ))}
    </div>
  );
}

function IncidentTable({ incidents, type = "active" }) {
  const headers =
    type === "active"
      ? ["상태", "서버", "유형", "조건", "측정값", "지속", "담당"]
      : ["서버", "유형", "발생", "복구", "지속 시간", "상태"];

  return (
    <div className={styles.tableWrap}>
      <table
        className={`app-table ${styles.table} ${
          type === "active" ? styles.wideTable : styles.historyTable
        }`}
      >
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) =>
            type === "active" ? (
              <tr key={incident.id}>
                <td>
                  <StatusBadge status={incident.status} />
                </td>
                <td className={styles.strongCell}>{incident.serverName}</td>
                <td>
                  <TypeBadge type={incident.type} />
                </td>
                <td>{incident.condition}</td>
                <td className={styles.strongCell}>{incident.measuredValue}</td>
                <td>{incident.durationMinutes}분</td>
                <td>{incident.owner}</td>
              </tr>
            ) : (
              <tr key={incident.id}>
                <td className={styles.strongCell}>{incident.serverName}</td>
                <td>
                  <TypeBadge type={incident.type} />
                </td>
                <td>{formatDateTime(incident.startedAt)}</td>
                <td>{formatDateTime(incident.endedAt)}</td>
                <td className={styles.strongCell}>{incident.durationMinutes}분</td>
                <td>
                  <StatusBadge status={incident.status} />
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function IncidentStats() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const data = await fetchIncidentStats();
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
    return <div className={styles.loading}>장애 통계 데이터를 불러오는 중입니다.</div>;
  }

  if (errorMessage) {
    return (
      <div className={styles.errorWrap}>
        <Card>
          <SectionTitle title="데이터 조회 실패" sub={errorMessage} />
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            type="button"
            onClick={loadAnalytics}
          >
            다시 시도
          </button>
        </Card>
      </div>
    );
  }

  const { summary } = analytics;

  return (
    <div className={`app-page app-page--wide app-page--padded ${styles.page}`}>
      <div className="app-page-header app-page-header--split app-page-header--stack-mobile">
        <div>
          <h1 className={`app-page-title ${styles.title}`}>장애 통계</h1>
          <p className={`app-page-subtitle ${styles.description}`}>
            장애 조건 기반으로 현재 위험도, 유형별 빈도, 서버별 반복 장애를 분석합니다.
          </p>
          <p className={styles.lastUpdated}>
            마지막 집계: {formatDateTime(analytics.generatedAt)}
          </p>
        </div>

        <button className={styles.button} type="button" onClick={loadAnalytics}>
          새로고침
        </button>
      </div>

      <div className={styles.summaryGrid}>
        {/*
        <SummaryCard
          label="현재 장애"
          value={summary.activeIncidents}
          unit="건"
          helper="실시간 확인 필요"
          color={CHART_COLORS.critical}
        />
        <SummaryCard
          label="경고 서버"
          value={summary.warningServers}
          unit="대"
          helper="임계치 근접 서버"
          color={CHART_COLORS.warning}
        />
        */}
        <SummaryCard
          label="오늘 장애"
          value={summary.todayIncidents}
          unit="건"
          helper="당일 0시 기준"
          color="var(--app-text)"
        />
        {/*
        <SummaryCard
          label="평균 복구 시간"
          value={summary.mttrMinutes}
          unit="분"
          helper="MTTR"
          color={CHART_COLORS.db}
        />
        <SummaryCard
          label="가용률"
          value={summary.availability}
          unit="%"
          helper="오늘 누적 기준"
          color={CHART_COLORS.success}
        />
        */}
      </div>

      <div className={styles.chartGrid}>
        <Card>
          <SectionTitle
            title="시간대별 장애 추이"
            sub="CPU, DB, 서버 다운, API 트래픽 장애를 시간대별로 비교합니다."
          />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={analytics.hourlyTrend}
              margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
            >
              <CartesianGrid stroke={CHART_COLORS.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<AnalyticsTooltip />} />
              <Line type="monotone" dataKey="total" name="전체" stroke={CHART_COLORS.total} strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="cpu" name="CPU" stroke={CHART_COLORS.cpu} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="db" name="DB" stroke={CHART_COLORS.db} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="traffic" name="API Traffic" stroke={CHART_COLORS.traffic} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle title="장애 유형별 비율" sub="오늘 발생한 장애의 원인 분포입니다." />
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
          <div className={styles.breakdownList}>
            {chartBreakdown.map((item) => (
              <div key={item.type} className={styles.breakdownItem}>
                <TypeBadge type={item.type} />
                <strong className={styles.breakdownCount}>{item.count}건</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className={styles.riskGrid}>
        <Card>
          <SectionTitle
            title="최근 장애 이력"
            sub="복구 완료된 장애를 지속 시간 기준으로 확인합니다."
          />
          <IncidentTable incidents={analytics.recentIncidents} type="history" />
        </Card>

        {/*
        <Card>
          <SectionTitle
            title="현재 진행 중인 장애"
            sub="운영자가 먼저 확인해야 할 활성 장애 목록입니다."
          />
          <IncidentTable incidents={analytics.activeIncidents} />
        </Card>
        */}
      </div>

      <div className={styles.bottomGrid}>
        <Card>
          <SectionTitle
            title="서버별 장애 발생 현황"
            sub="반복 장애와 최근 상태를 기준으로 산정한 데모 점수입니다."
          />
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={analytics.serverRiskRanking}
              layout="vertical"
              margin={{ top: 4, right: 12, left: 10, bottom: 0 }}
            >
              <CartesianGrid stroke={CHART_COLORS.border} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="serverName" type="category" tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip content={<AnalyticsTooltip />} />
              <Bar dataKey="riskScore" name="위험도" barSize={24} radius={[0, 6, 6, 0]}>
                {analytics.serverRiskRanking.map((entry) => (
                  <Cell key={entry.serverName} fill={getStatusMeta(entry.status).color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SectionTitle
            title="장애 판단 기준"
            sub="장애 유형별 감지 조건과 임계치를 확인합니다."
          />
          <div className={styles.ruleList}>
            {Object.entries(INCIDENT_TYPE_META).map(([type, meta]) => (
              <div key={type} className={styles.ruleItem}>
                <div className={styles.ruleTitle}>
                  <TypeBadge type={type} />
                </div>
                <p className={styles.ruleText}>{meta.rule}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
