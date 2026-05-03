import { useMemo, useState } from "react";

import styles from "./ErrorLogPage.module.css";

// ─────────────────────────────────────────
// 하드코딩 더미 데이터
// 나중에 API 붙일 때 이 부분만 교체
// GET /api/logs?level=&service=&keyword=&page=&size=
// ─────────────────────────────────────────
const DUMMY_LOGS = [
  {
    logId: "log_001",
    level: "ERROR",
    service: "api-gateway",
    message: "Connection timeout: upstream responded with 502",
    timestamp: "2026-05-01T14:03:21Z",
    requestId: "req_8f2d1a3c",
    stackTrace:
      "com.example.gateway.filter.GatewayFilter.apply(GatewayFilter.java:112)\n  at reactor.core.publisher.FluxOnAssembly$OnAssemblySubscriber.onNext(FluxOnAssembly.java:539)\n  at io.netty.channel.AbstractChannel$AbstractUnsafe.write(AbstractChannel.java:812)\nCaused by: io.netty.channel.ConnectTimeoutException: connection timed out after 3000ms",
  },
  {
    logId: "log_002",
    level: "WARN",
    service: "auth",
    message: "JWT validation failed for user_id=4821: token expired",
    timestamp: "2026-05-01T14:02:58Z",
    requestId: "req_c91e4b2f",
    stackTrace:
      "com.example.auth.JwtValidator.validate(JwtValidator.java:67)\n  at com.example.auth.AuthFilter.doFilter(AuthFilter.java:44)\nCaused by: io.jsonwebtoken.ExpiredJwtException: JWT expired at 2025-05-01T13:58:00Z",
  },
  {
    logId: "log_003",
    level: "ERROR",
    service: "db",
    message: "Max connection pool size exceeded: 100/100 connections active",
    timestamp: "2026-05-01T14:01:44Z",
    requestId: "req_77a9c3d1",
    stackTrace:
      "com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)\n  at com.example.repository.UserRepository.findById(UserRepository.java:88)\nCaused by: java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms",
  },
  {
    logId: "log_004",
    level: "WARN",
    service: "api-gateway",
    message: "Response time exceeded threshold: 3842ms (threshold: 3000ms)",
    timestamp: "2026-05-01T14:00:09Z",
    requestId: "req_4e2f8b5c",
    stackTrace:
      "com.example.gateway.monitor.LatencyMonitor.check(LatencyMonitor.java:55)\n  at com.example.gateway.filter.MetricsFilter.apply(MetricsFilter.java:38)",
  },
  {
    logId: "log_005",
    level: "ERROR",
    service: "auth",
    message: "Redis session store unreachable: connection refused",
    timestamp: "2026-05-01T13:58:33Z",
    requestId: "req_2d7c1e9a",
    stackTrace:
      "redis.clients.jedis.Jedis.connect(Jedis.java:174)\n  at com.example.auth.SessionStore.get(SessionStore.java:92)\nCaused by: java.net.ConnectException: Connection refused (Connection refused)",
  },
  {
    logId: "log_006",
    level: "INFO",
    service: "db",
    message: "Scheduled maintenance: index rebuild completed in 4.2s",
    timestamp: "2026-05-01T13:55:00Z",
    requestId: "req_00000000",
    stackTrace: "",
  },
  {
    logId: "log_007",
    level: "ERROR",
    service: "api-gateway",
    message: "Upstream service returned 500: internal server error from /users/profile",
    timestamp: "2026-05-01T13:52:17Z",
    requestId: "req_9b3f2c7d",
    stackTrace:
      "com.example.gateway.handler.ErrorHandler.handleError(ErrorHandler.java:88)\n  at com.example.gateway.filter.ProxyFilter.apply(ProxyFilter.java:201)\nCaused by: org.springframework.web.client.HttpServerErrorException$InternalServerError: 500 Internal Server Error",
  },
  {
    logId: "log_008",
    level: "WARN",
    service: "db",
    message: "Slow query detected (1842ms): SELECT * FROM orders WHERE user_id=? AND status=?",
    timestamp: "2026-05-01T13:49:05Z",
    requestId: "req_5a8d3e1f",
    stackTrace:
      "com.example.db.QueryMonitor.logSlowQuery(QueryMonitor.java:44)\n  at com.example.repository.OrderRepository.findByUserId(OrderRepository.java:133)",
  },
];

const SERVICES = ["all", "api-gateway", "auth", "db"];
const LEVELS = ["all", "ERROR", "WARN", "INFO"];

const LEVEL_STYLE = {
  ERROR: { bg: "#fee2e2", color: "#b91c1c" },
  WARN: { bg: "#fef3c7", color: "#92400e" },
  INFO: { bg: "#dbeafe", color: "#1e40af" },
};

const TABLE_HEADERS = ["시간", "레벨", "서비스", "메시지", ""];

function formatTime(iso) {
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(-2);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  const second = String(d.getSeconds()).padStart(2, "0");

  return `${yy}-${month}-${day} ${hour}:${minute}:${second}`;
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function classNames(...names) {
  return names.filter(Boolean).join(" ");
}

function LevelBadge({ level }) {
  const style = LEVEL_STYLE[level] || LEVEL_STYLE.INFO;

  return (
    <span
      className={styles.levelBadge}
      style={{
        "--level-bg": style.bg,
        "--level-color": style.color,
      }}
    >
      {level}
    </span>
  );
}

function FilterChip({ active, tone, children, onClick }) {
  return (
    <button
      className={classNames(
        styles.chip,
        active && tone === "ERROR" && styles.chipError,
        active && tone === "WARN" && styles.chipWarn,
        active && tone === "INFO" && styles.chipInfo,
        active && !["ERROR", "WARN", "INFO"].includes(tone) && styles.chipActive,
      )}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function DetailPanel({ log }) {
  const levelStyle = LEVEL_STYLE[log.level] || LEVEL_STYLE.INFO;

  return (
    <tr>
      <td className={styles.detailCell} colSpan={5}>
        <div className={styles.detailPanel} style={{ "--detail-color": levelStyle.color }}>
          <div className={styles.detailGrid}>
            {[
              ["Log ID", log.logId],
              ["Request ID", log.requestId],
              ["서비스", log.service],
              ["발생 시각", formatDateTime(log.timestamp)],
            ].map(([label, value]) => (
              <div key={label}>
                <div className={styles.detailLabel}>{label}</div>
                <div className={styles.detailValue}>{value}</div>
              </div>
            ))}
          </div>

          <div className={log.stackTrace ? styles.messageBlock : undefined}>
            <div className={styles.detailLabel}>메시지</div>
            <div className={styles.detailBox}>{log.message}</div>
          </div>

          {log.stackTrace && (
            <div>
              <div className={styles.detailLabel}>Stack Trace</div>
              <pre className={styles.stackTrace}>{log.stackTrace}</pre>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function LogTable({ logs, selectedId, onRowClick }) {
  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <colgroup>
          <col className={styles.timeCol} />
          <col className={styles.levelCol} />
          <col className={styles.serviceCol} />
          <col />
          <col className={styles.arrowCol} />
        </colgroup>
        <thead>
          <tr>
            {TABLE_HEADERS.map((header) => (
              <th
                key={header}
                className={header === "메시지" ? styles.messageHeader : undefined}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 && (
            <tr>
              <td className={styles.emptyCell} colSpan={5}>
                조건에 맞는 로그가 없습니다.
              </td>
            </tr>
          )}

          {logs.map((log) => {
            const isOpen = selectedId === log.logId;

            return (
              <>
                <tr
                  key={log.logId}
                  className={classNames(
                    styles.logRow,
                    isOpen && styles.logRowActive,
                    isOpen && styles.rowOpen,
                  )}
                  onClick={() => onRowClick(log.logId)}
                >
                  <td className={styles.timeCell}>{formatTime(log.timestamp)}</td>
                  <td className={styles.levelCell}>
                    <LevelBadge level={log.level} />
                  </td>
                  <td className={styles.serviceCell}>{log.service}</td>
                  <td className={styles.messageCell}>{log.message}</td>
                  <td className={classNames(styles.arrowCell, isOpen && styles.arrowOpen)}>
                    &rsaquo;
                  </td>
                </tr>

                {isOpen && <DetailPanel key={`detail-${log.logId}`} log={log} />}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────
export default function ErrorLogPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [keyword] = useState("");

  const filtered = useMemo(() => {
    return DUMMY_LOGS.filter((log) => {
      if (filterLevel !== "all" && log.level !== filterLevel) return false;
      if (filterService !== "all" && log.service !== filterService) return false;
      if (keyword && !log.message.toLowerCase().includes(keyword.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [filterLevel, filterService, keyword]);

  const handleRowClick = (logId) => {
    setSelectedId((prev) => (prev === logId ? null : logId));
  };

  const handleLevelChange = (level) => {
    setFilterLevel(level);
    setSelectedId(null);
  };

  const handleServiceChange = (service) => {
    setFilterService(service);
    setSelectedId(null);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>에러 로그</h1>
        <p className={styles.subtitle}>
          총 {filtered.length}건 · 클릭하면 상세 내용을 확인할 수 있습니다.
        </p>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.chipGroup}>
          {LEVELS.map((level) => (
            <FilterChip
              key={level}
              active={filterLevel === level}
              tone={level}
              onClick={() => handleLevelChange(level)}
            >
              {level === "all" ? "전체" : level}
            </FilterChip>
          ))}
        </div>

        <div className={styles.divider} />

        <div className={styles.chipGroup}>
          {SERVICES.map((service) => (
            <FilterChip
              key={service}
              active={filterService === service}
              tone="service"
              onClick={() => handleServiceChange(service)}
            >
              {service === "all" ? "전체 서비스" : service}
            </FilterChip>
          ))}
        </div>
      </div>

      <LogTable logs={filtered} selectedId={selectedId} onRowClick={handleRowClick} />

      <div className={styles.footerNote}>
        {filtered.length}건 표시 중 · 페이지네이션 필요시 API 연동 시 추가
      </div>
    </div>
  );
}
