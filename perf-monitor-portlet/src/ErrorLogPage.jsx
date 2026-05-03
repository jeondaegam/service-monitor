import { useState, useMemo } from "react";

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
    timestamp: "2025-05-01T14:03:21Z",
    requestId: "req_8f2d1a3c",
    stackTrace:
      "com.example.gateway.filter.GatewayFilter.apply(GatewayFilter.java:112)\n  at reactor.core.publisher.FluxOnAssembly$OnAssemblySubscriber.onNext(FluxOnAssembly.java:539)\n  at io.netty.channel.AbstractChannel$AbstractUnsafe.write(AbstractChannel.java:812)\nCaused by: io.netty.channel.ConnectTimeoutException: connection timed out after 3000ms",
  },
  {
    logId: "log_002",
    level: "WARN",
    service: "auth",
    message: "JWT validation failed for user_id=4821: token expired",
    timestamp: "2025-05-01T14:02:58Z",
    requestId: "req_c91e4b2f",
    stackTrace:
      "com.example.auth.JwtValidator.validate(JwtValidator.java:67)\n  at com.example.auth.AuthFilter.doFilter(AuthFilter.java:44)\nCaused by: io.jsonwebtoken.ExpiredJwtException: JWT expired at 2025-05-01T13:58:00Z",
  },
  {
    logId: "log_003",
    level: "ERROR",
    service: "db",
    message: "Max connection pool size exceeded: 100/100 connections active",
    timestamp: "2025-05-01T14:01:44Z",
    requestId: "req_77a9c3d1",
    stackTrace:
      "com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)\n  at com.example.repository.UserRepository.findById(UserRepository.java:88)\nCaused by: java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms",
  },
  {
    logId: "log_004",
    level: "WARN",
    service: "api-gateway",
    message: "Response time exceeded threshold: 3842ms (threshold: 3000ms)",
    timestamp: "2025-05-01T14:00:09Z",
    requestId: "req_4e2f8b5c",
    stackTrace:
      "com.example.gateway.monitor.LatencyMonitor.check(LatencyMonitor.java:55)\n  at com.example.gateway.filter.MetricsFilter.apply(MetricsFilter.java:38)",
  },
  {
    logId: "log_005",
    level: "ERROR",
    service: "auth",
    message: "Redis session store unreachable: connection refused",
    timestamp: "2025-05-01T13:58:33Z",
    requestId: "req_2d7c1e9a",
    stackTrace:
      "redis.clients.jedis.Jedis.connect(Jedis.java:174)\n  at com.example.auth.SessionStore.get(SessionStore.java:92)\nCaused by: java.net.ConnectException: Connection refused (Connection refused)",
  },
  {
    logId: "log_006",
    level: "INFO",
    service: "db",
    message: "Scheduled maintenance: index rebuild completed in 4.2s",
    timestamp: "2025-05-01T13:55:00Z",
    requestId: "req_00000000",
    stackTrace: "",
  },
  {
    logId: "log_007",
    level: "ERROR",
    service: "api-gateway",
    message: "Upstream service returned 500: internal server error from /users/profile",
    timestamp: "2025-05-01T13:52:17Z",
    requestId: "req_9b3f2c7d",
    stackTrace:
      "com.example.gateway.handler.ErrorHandler.handleError(ErrorHandler.java:88)\n  at com.example.gateway.filter.ProxyFilter.apply(ProxyFilter.java:201)\nCaused by: org.springframework.web.client.HttpServerErrorException$InternalServerError: 500 Internal Server Error",
  },
  {
    logId: "log_008",
    level: "WARN",
    service: "db",
    message: "Slow query detected (1842ms): SELECT * FROM orders WHERE user_id=? AND status=?",
    timestamp: "2025-05-01T13:49:05Z",
    requestId: "req_5a8d3e1f",
    stackTrace:
      "com.example.db.QueryMonitor.logSlowQuery(QueryMonitor.java:44)\n  at com.example.repository.OrderRepository.findByUserId(OrderRepository.java:133)",
  },
];

// 서비스 목록 - 백엔드에서 받아올 수도 있음
const SERVICES = ["all", "api-gateway", "auth", "db"];
const LEVELS = ["all", "ERROR", "WARN", "INFO"];

// ─────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────
const LEVEL_STYLE = {
  ERROR: { bg: "#FEE2E2", color: "#B91C1C" },
  WARN:  { bg: "#FEF3C7", color: "#92400E" },
  INFO:  { bg: "#DBEAFE", color: "#1E40AF" },
};

const UI = {
  panel: "var(--app-panel)",
  panelAlt: "var(--app-panel-alt)",
  border: "var(--app-border)",
  text: "var(--app-text)",
  muted: "var(--app-muted)",
  softText: "var(--app-soft-text)",
  hover: "var(--app-hover)",
  active: "var(--app-active)",
};

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

// ─────────────────────────────────────────
// 배지 컴포넌트
// ─────────────────────────────────────────
function LevelBadge({ level }) {
  const s = LEVEL_STYLE[level] || LEVEL_STYLE.INFO;
  return (
    <span style={{
      display: "inline-block",
      fontSize: 10,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: 20,
      background: s.bg,
      color: s.color,
      letterSpacing: "0.04em",
    }}>
      {level}
    </span>
  );
}

// ─────────────────────────────────────────
// 상세 패널 (인라인 확장)
// ─────────────────────────────────────────
function DetailPanel({ log }) {
  return (
    <tr>
      <td colSpan={5} style={{ padding: 0, borderBottom: `1px solid ${UI.border}` }}>
        <div style={{
          background: UI.panelAlt,
          borderLeft: `3px solid ${LEVEL_STYLE[log.level]?.color ?? "#6B7280"}`,
          padding: "16px 20px",
          animation: "slideDown 0.18s ease",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 14 }}>
            {[
              ["Log ID",      log.logId],
              ["Request ID",  log.requestId],
              ["서비스",       log.service],
              ["발생 시각",    formatDateTime(log.timestamp)],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: UI.muted, marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: UI.text, wordBreak: "break-all" }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: log.stackTrace ? 12 : 0 }}>
            <div style={{ fontSize: 11, color: UI.muted, marginBottom: 4 }}>메시지</div>
            <div style={{
              fontSize: 12,
              fontFamily: "monospace",
              color: UI.text,
              background: UI.panel,
              border: `1px solid ${UI.border}`,
              borderRadius: 6,
              padding: "8px 12px",
            }}>
              {log.message}
            </div>
          </div>

          {log.stackTrace && (
            <div>
              <div style={{ fontSize: 11, color: UI.muted, marginBottom: 4 }}>Stack Trace</div>
              <pre style={{
                fontSize: 11,
                fontFamily: "monospace",
                color: UI.text,
                background: UI.panel,
                border: `1px solid ${UI.border}`,
                borderRadius: 6,
                padding: "10px 12px",
                margin: 0,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.7,
              }}>
                {log.stackTrace}
              </pre>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────
export default function ErrorLogPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [filterLevel,   setFilterLevel]   = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [keyword,       setKeyword]       = useState("");

  // ── 필터링 ──────────────────────────────
  // API 붙이면 이 useMemo 대신 useEffect + fetch 로 교체
  const filtered = useMemo(() => {
    return DUMMY_LOGS.filter((log) => {
      if (filterLevel   !== "all" && log.level   !== filterLevel)   return false;
      if (filterService !== "all" && log.service !== filterService)  return false;
      if (keyword && !log.message.toLowerCase().includes(keyword.toLowerCase())) return false;
      return true;
    });
  }, [filterLevel, filterService, keyword]);

  const handleRowClick = (logId) => {
    setSelectedId((prev) => (prev === logId ? null : logId));
    // ── API 연동 시 여기서 단건 조회 ──
    // if (prev !== logId) {
    //   fetch(`/api/logs/${logId}`)
    //     .then(r => r.json())
    //     .then(data => setDetail(data));
    // }
  };

  // ── 칩 공용 스타일 ──────────────────────
  const chipStyle = (active, type) => ({
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid",
    borderColor: active
      ? (type === "ERROR" ? "#FCA5A5" : type === "WARN" ? "#FCD34D" : "#93C5FD")
      : UI.border,
    background: active
      ? (type === "ERROR" ? "#FEE2E2" : type === "WARN" ? "#FEF3C7" : "#DBEAFE")
      : UI.panel,
    color: active
      ? (type === "ERROR" ? "#B91C1C" : type === "WARN" ? "#92400E" : "#1E40AF")
      : UI.muted,
    transition: "all 0.15s",
  });

  const svcChipStyle = (active) => ({
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    border: "1px solid",
    borderColor: active ? "#6366F1" : UI.border,
    background: active ? UI.active : UI.panel,
    color: active ? "#6366F1" : UI.muted,
    transition: "all 0.15s",
  });

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .log-row:hover td { background: var(--app-hover); cursor: pointer; }
        .log-row.active td { background: var(--app-active); }
      `}</style>

      <div style={{ padding: "28px 32px", fontFamily: "system-ui, sans-serif", maxWidth: 1100, margin: "0 auto", color: UI.text }}>

        {/* ── 헤더 ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: UI.text, margin: 0 }}>에러 로그</h1>
          <p style={{ fontSize: 13, color: UI.muted, marginTop: 4 }}>
            총 {filtered.length}건 · 클릭하면 상세 확인
          </p>
        </div>

        {/* ── 필터 바 ── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
          {/* 레벨 필터 */}
          <div style={{ display: "flex", gap: 6 }}>
            {LEVELS.map((lv) => (
              <button
                key={lv}
                style={chipStyle(filterLevel === lv, lv)}
                onClick={() => { setFilterLevel(lv); setSelectedId(null); }}
              >
                {lv === "all" ? "전체" : lv}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: UI.border }} />

          {/* 서비스 필터 */}
          <div style={{ display: "flex", gap: 6 }}>
            {SERVICES.map((svc) => (
              <button
                key={svc}
                style={svcChipStyle(filterService === svc)}
                onClick={() => { setFilterService(svc); setSelectedId(null); }}
              >
                {svc === "all" ? "전체 서비스" : svc}
              </button>
            ))}
          </div>

          {/* 키워드 검색 */}
          {/* <input
            placeholder="메시지 검색..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setSelectedId(null); }}
            style={{
              marginLeft: "auto",
              padding: "6px 12px",
              fontSize: 13,
              border: "1px solid #D1D5DB",
              borderRadius: 8,
              outline: "none",
              width: 200,
            }}
          /> */}
        </div>

        {/* ── 테이블 ── */}
        <div style={{
          background: UI.panel,
          border: `1px solid ${UI.border}`,
          borderRadius: 12,
          overflow: "hidden",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 80 }} />   {/* 시각 */}
              <col style={{ width: 70 }} />   {/* 레벨 */}
              <col style={{ width: 100 }} />  {/* 서비스 */}
              <col />                          {/* 메시지 */}
              <col style={{ width: 40 }} />   {/* 화살표 */}
            </colgroup>
            <thead>
              <tr style={{ background: UI.panelAlt, borderBottom: `1px solid ${UI.border}` }}>
                {["시각", "레벨", "서비스", "메시지", ""].map((h) => (
                  <th key={h} style={{
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: UI.muted,
                    padding: "10px 14px",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 40, color: UI.softText, fontSize: 14 }}>
                    조건에 맞는 로그가 없습니다.
                  </td>
                </tr>
              )}

              {filtered.map((log) => {
                const isOpen = selectedId === log.logId;
                return (
                  <>
                    <tr
                      key={log.logId}
                      className={`log-row${isOpen ? " active" : ""}`}
                      onClick={() => handleRowClick(log.logId)}
                    >
                      <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "monospace", color: UI.muted, borderBottom: isOpen ? "none" : `1px solid ${UI.border}` }}>
                        {formatTime(log.timestamp)}
                      </td>
                      <td style={{ padding: "10px 14px", borderBottom: isOpen ? "none" : `1px solid ${UI.border}` }}>
                        <LevelBadge level={log.level} />
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: UI.text, fontFamily: "monospace", borderBottom: isOpen ? "none" : `1px solid ${UI.border}` }}>
                        {log.service}
                      </td>
                      <td style={{
                        padding: "10px 14px",
                        fontSize: 12,
                        fontFamily: "monospace",
                        color: UI.text,
                        borderBottom: isOpen ? "none" : `1px solid ${UI.border}`,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {log.message}
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "center", fontSize: 14, color: UI.softText, borderBottom: isOpen ? "none" : `1px solid ${UI.border}`, transition: "transform 0.15s", transform: isOpen ? "rotate(90deg)" : "none" }}>
                        ›
                      </td>
                    </tr>

                    {/* 인라인 상세 패널 */}
                    {isOpen && <DetailPanel key={`detail-${log.logId}`} log={log} />}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── 페이지네이션 자리 ── */}
        {/* API 붙이면 여기에 페이지 버튼 추가 */}
        <div style={{ marginTop: 12, fontSize: 12, color: UI.softText, textAlign: "right" }}>
          {filtered.length}건 표시 중 · 페이지네이션은 API 연동 후 추가
        </div>
      </div>
    </>
  );
}
