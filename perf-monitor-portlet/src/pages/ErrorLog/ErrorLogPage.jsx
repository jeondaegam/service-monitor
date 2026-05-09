import { Fragment, useMemo, useState } from "react";
import { Button, TextField } from "@mui/material";

import styles from "./ErrorLogPage.module.css";

// ─────────────────────────────────────────
// 하드코딩 더미 데이터
// 나중에 API 붙일 때 이 부분만 교체
// GET /api/logs?date=&level=&errorType=&keyword=&page=&size=
// ─────────────────────────────────────────
const DUMMY_LOGS = [
  {
    logId: "log_001",
    level: "ERROR",
    errorType: "server",
    message: "AI report request failed: server returned HTTP 500 while generating daily analysis",
    timestamp: "2026-05-01T14:03:21Z",
    requestId: "req_8f2d1a3c",
    stackTrace:
      "com.example.gateway.filter.GatewayFilter.apply(GatewayFilter.java:112)\n  at reactor.core.publisher.FluxOnAssembly$OnAssemblySubscriber.onNext(FluxOnAssembly.java:539)\n  at io.netty.channel.AbstractChannel$AbstractUnsafe.write(AbstractChannel.java:812)\nCaused by: io.netty.channel.ConnectTimeoutException: connection timed out after 3000ms",
  },
  {
    logId: "log_002",
    level: "WARN",
    errorType: "cpu",
    message: "CPU usage exceeded threshold during AI report batch processing: 92.4%",
    timestamp: "2026-05-01T14:02:58Z",
    requestId: "req_c91e4b2f",
    stackTrace:
      "com.example.auth.JwtValidator.validate(JwtValidator.java:67)\n  at com.example.auth.AuthFilter.doFilter(AuthFilter.java:44)\nCaused by: io.jsonwebtoken.ExpiredJwtException: JWT expired at 2025-05-01T13:58:00Z",
  },
  {
    logId: "log_003",
    level: "ERROR",
    errorType: "memory",
    message: "Memory pressure detected while parsing AI response payload: heap usage 91%",
    timestamp: "2026-05-01T14:01:44Z",
    requestId: "req_77a9c3d1",
    stackTrace:
      "com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)\n  at com.example.repository.UserRepository.findById(UserRepository.java:88)\nCaused by: java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms",
  },
  {
    logId: "log_004",
    level: "WARN",
    errorType: "disk",
    message: "Disk write latency increased while storing error log detail snapshot",
    timestamp: "2026-05-01T14:00:09Z",
    requestId: "req_4e2f8b5c",
    stackTrace:
      "com.example.gateway.monitor.LatencyMonitor.check(LatencyMonitor.java:55)\n  at com.example.gateway.filter.MetricsFilter.apply(MetricsFilter.java:38)",
  },
  {
    logId: "log_005",
    level: "ERROR",
    errorType: "network",
    message: "Network timeout while calling AI report generation API from scheduler",
    timestamp: "2026-05-01T13:58:33Z",
    requestId: "req_2d7c1e9a",
    stackTrace:
      "redis.clients.jedis.Jedis.connect(Jedis.java:174)\n  at com.example.auth.SessionStore.get(SessionStore.java:92)\nCaused by: java.net.ConnectException: Connection refused (Connection refused)",
  },
  {
    logId: "log_006",
    level: "INFO",
    errorType: "db",
    message: "DB connection timeout from HikariCP while loading AI report data",
    timestamp: "2026-05-01T13:55:00Z",
    requestId: "req_00000000",
    stackTrace: "",
  },
  {
    logId: "log_007",
    level: "ERROR",
    errorType: "server",
    message:
      "NullPointerException while reading raw error log detail: getRawLog() called on null",
    timestamp: "2026-05-01T13:52:17Z",
    requestId: "req_9b3f2c7d",
    stackTrace:
      "com.example.gateway.handler.ErrorHandler.handleError(ErrorHandler.java:88)\n  at com.example.gateway.filter.ProxyFilter.apply(ProxyFilter.java:201)\nCaused by: org.springframework.web.client.HttpServerErrorException$InternalServerError: 500 Internal Server Error",
  },
  {
    logId: "log_008",
    level: "WARN",
    errorType: "db",
    message:
      "JSON parse failed for AI response: unexpected HTML error page received",
    timestamp: "2026-05-01T13:49:05Z",
    requestId: "req_5a8d3e1f",
    stackTrace:
      "com.example.db.QueryMonitor.logSlowQuery(QueryMonitor.java:44)\n  at com.example.repository.OrderRepository.findByUserId(OrderRepository.java:133)",
  },
    {
    logId: "log_009",
    level: "WARN",
    errorType: "db",
    message:
      "JSON parse failed for AI response: unexpected HTML error page received",
    timestamp: "2026-05-01T13:49:05Z",
    requestId: "req_5a8d3e1f",
    stackTrace:
      "com.example.db.QueryMonitor.logSlowQuery(QueryMonitor.java:44)\n  at com.example.repository.OrderRepository.findByUserId(OrderRepository.java:133)",
  },
      {
    logId: "log_010",
    level: "WARN",
    errorType: "db",
    message:
      "JSON parse failed for AI response: unexpected HTML error page received",
    timestamp: "2026-05-01T13:49:05Z",
    requestId: "req_5a8d3e1f",
    stackTrace:
      "com.example.db.QueryMonitor.logSlowQuery(QueryMonitor.java:44)\n  at com.example.repository.OrderRepository.findByUserId(OrderRepository.java:133)",
  },
];

const DUMMY_AI_REPORT = {
  targetDate: "2026-05-08",
  totalErrorCnt: 4,
  aiSummary: `1. 종합 요약
- 분석 기준일 2026-05-08 기준으로 Log4j2 ERROR 이벤트는 총 4건 확인되었습니다.
- 오류는 DB 연결 풀 고갈 또는 지연, 에러 로그 상세 조회 시 NullPointerException, 배치성 AI 리포트 생성 API 호출 실패, AI 응답 파싱 실패 유형으로 구분됩니다.
- 각 오류는 서로 다른 컴포넌트에서 발생하였으며, 동일 시점에 연속적으로 발생한 것으로 보아 전체 시스템 안정성 이슈 또는 리포트 생성 및 조회 기능 관련 모듈가 포함되어 있어 관련 기능 영향 여부 확인이 필요합니다.

---

2. 주요 장애 유형

### 2.1 DB 연결 실패
- 주요 유형: DB Connection Timeout
- 관련 컴포넌트 또는 클래스명: com.back.ai.web.AiReportController / HikariCP, MyBatis
- 발생 특징:
  - HikariCP 커넥션 풀에서 DB 연결을 할당받지 못하고 30초 후 타임아웃이 발생했습니다.
  - Spring JDBC 및 MyBatis 트랜잭션 처리 과정에서 연결 실패가 확인되었습니다.
  - AI 리포트 관련 요청 처리 중 발생한 것으로 확인됩니다.

### 2.2 에러 로그 상세 조회 중 NullPointerException
- 주요 유형: NullPointerException
- 관련 컴포넌트 또는 클래스명: com.back.error.service.ErrorLogServiceImpl / com.back.errorlog.web.ErrorLogController
- 발생 특징:
  - 에러 로그 상세 처리 조회 대상 객체가 null인 상태에서 getRawLog() 메서드를 호출하여 예외가 발생하였습니다.
  - 서비스 계층의 selectErrorLog() 메서드에서 예외가 발생한 것으로 확인됩니다.

### 2.3 스케줄러 기반 AI 리포트 생성 실패
- 주요 유형: 외부 또는 내부 API 호출 500 오류
- 관련 컴포넌트 또는 클래스명: com.back.scheduler.Scheduler / RestTemplate
- 발생 특징:
  - 스케줄러 실행 중 전달 AI 리포트 생성 요청에 대해 HTTP 500 Internal Server Error가 반환되었습니다.
  - RestTemplate 응답 처리 과정에서 서버 오류를 처리된 것이 확인됩니다.

### 2.4 AI 응답 파싱 실패
- 주요 유형: JSON 파싱 오류
- 관련 컴포넌트 또는 클래스명: com.back.ai.service.impl.AiReportServiceImpl / Jackson ObjectMapper
- 발생 특징:
  - AI 응답을 JSON으로 파싱하는 과정에서 유효하지 않은 문자가 감지되어 파싱 실패하였습니다.
  - 응답 본문이 JSON 형식이 아닌 HTML 또는 오류 페이지 형식일 가능성이 있습니다. 해당 내용은 정의, 실제 응답 원문 확인이 필요합니다.

---

3. 반복 발생 패턴
- 동일한 예외가 반복적으로 발생한 정황은 제공된 ERROR 로그 4건만으로는 명확히 확인되지 않습니다.
- 다만 AI 리포트 관련 기능에서 DB 연결 실패, 스케줄러 리포트 생성 실패, AI 응답 파싱 실패가 각각 발생하여 AI 리포트 처리 흐름 전반에 대한 점검이 필요합니다.

---

4. 원인 분석 및 추정

### 4.1 DB 연결 지연 또는 커넥션 풀 부족
- DB 연결 실패는 커넥션 풀에서 적절한 대기 시간 내 DB 커넥션을 확보하지 못해 발생했습니다.
- 에러 로그 상세 조회 오류는 조회 결과 객체가 null인 상태에서 코드 레벨 검증 없이 메서드를 호출하여 발생했습니다.
- 스케줄러 오류는 생성 API 호출 결과 서버 내부 오류가 반환되었으며, AI 응답 파싱 오류는 응답 데이터가 정상적인 JSON 형식으로 처리될 수 없는 상태에서 Jackson 파서가 실패하여 발생했습니다.

### 4.2 추정 원인
- DB 연결 실패: 커넥션 풀 부족, 장시간 점유 쿼리, DB 응답 지연, 빈번 커넥션, DB 서버 동시 응답 수 제한. 해당 상황에 DB 및 애플리케이션 지표 확인이 필요합니다.
- NullPointerException: 존재하지 않는 로그 식별자 조회, DB 조회 결과 미존재, 예외 처리 누락, 입력값 검증 누락 등이 원인일 수 있습니다.
- 스케줄러 HTTP 500 오류: 호출 대상 서버 내부 오류, AI 리포트 생성 로직 오류, 외부 AI 서비스 장애, 요청 파라미터 오류 등이 원인일 수 있습니다.
- AI 응답 파싱 실패: 호출 대상 서비스가 JSON 대신 HTML 오류 페이지, 인증 오류 페이지, 프록시 오류 응답, 차단 오류 응답 등을 반환했을 가능성이 있습니다. 이는 추정이며 응답 상태 코드와 본문 확인이 필요합니다.

---

5. 영향
- 시스템 장애로 인해 AI 리포트 조회 및 생성 기능 일부 응답 지연, 오류, 요청 누락 가능성이 있습니다.`,
};

const ERROR_TYPES = ["all", "server", "cpu", "memory", "disk", "network", "db"];
// const LEVELS = ["all", "ERROR", "WARN", "INFO"];

const LEVEL_STYLE = {
  ERROR: { bg: "#fee2e2", color: "#b91c1c" },
  WARN: { bg: "#fef3c7", color: "#92400e" },
  INFO: { bg: "#dbeafe", color: "#1e40af" },
};

const TABLE_HEADERS = ["로그 ID", "에러 발생 일시", "에러 유형", "메시지", ""];

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateByOffset(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatDateInput(date);
}

function applyDateToTimestamp(timestamp, date) {
  const [, time = "00:00:00Z"] = timestamp.split("T");
  return `${date}T${time}`;
}

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

// function LevelBadge({ level }) {
//   const style = LEVEL_STYLE[level] || LEVEL_STYLE.INFO;
//
//   return (
//     <span
//       className={styles.levelBadge}
//       style={{
//         "--level-bg": style.bg,
//         "--level-color": style.color,
//       }}
//     >
//       {level}
//     </span>
//   );
// }

function FilterChip({ active, tone, children, onClick }) {
  return (
    <button
      className={classNames(
        styles.chip,
        active && tone === "ERROR" && styles.chipError,
        active && tone === "WARN" && styles.chipWarn,
        active && tone === "INFO" && styles.chipInfo,
        active &&
          !["ERROR", "WARN", "INFO"].includes(tone) &&
          styles.chipActive,
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
        <div
          className={styles.detailPanel}
          style={{ "--detail-color": levelStyle.color }}
        >
          <div className={styles.detailGrid}>
            {[
              ["Log ID", log.logId],
              ["에러 유형", log.errorType],
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
          <col className={styles.logIdCol} />
          <col className={styles.timeCol} />
          {/*
          <col className={styles.levelCol} />
          */}
          <col className={styles.errorTypeCol} />
          <col />
          <col className={styles.arrowCol} />
        </colgroup>
        <thead>
          <tr>
            {TABLE_HEADERS.map((header) => (
              <th
                key={header}
                className={
                  header === "메시지" ? styles.messageHeader : undefined
                }
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
              <Fragment key={log.logId}>
                <tr
                  className={classNames(
                    styles.logRow,
                    isOpen && styles.logRowActive,
                    isOpen && styles.rowOpen,
                  )}
                  onClick={() => onRowClick(log.logId)}
                >
                  <td className={styles.logIdCell}>{log.logId}</td>
                  <td className={styles.timeCell}>
                    {formatTime(log.timestamp)}
                  </td>
                  {/*
                  <td className={styles.levelCell}>
                    <LevelBadge level={log.level} />
                  </td>
                  */}
                  <td className={styles.errorTypeCell}>{log.errorType}</td>
                  <td className={styles.messageCell}>{log.message}</td>
                  <td
                    className={styles.arrowCell}
                  >
                    <span
                      className={classNames(
                        styles.arrowIcon,
                        isOpen && styles.arrowOpen,
                      )}
                    >
                      &rsaquo;
                    </span>
                  </td>
                </tr>

                {isOpen && <DetailPanel log={log} />}
              </Fragment>
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
function AiSummaryMarkdown({ content }) {
  return (
    <div className={styles.aiReportContent}>
      {content.split("\n").map((line, index) => {
        const trimmed = line.trim();
        const key = `${index}-${trimmed}`;

        if (!trimmed) {
          return <div key={key} className={styles.aiReportSpacer} />;
        }

        if (trimmed === "---") {
          return <hr key={key} className={styles.aiReportDivider} />;
        }

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={key} className={styles.aiReportSubHeading}>
              {trimmed.slice(4)}
            </h4>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <h3 key={key} className={styles.aiReportHeading}>
              {trimmed}
            </h3>
          );
        }

        if (trimmed.startsWith("- ")) {
          const isNested = line.startsWith("  ");

          return (
            <div
              key={key}
              className={classNames(
                styles.aiReportListItem,
                isNested && styles.aiReportNestedListItem,
              )}
            >
              <span className={styles.aiReportBullet} />
              <span>{trimmed.slice(2)}</span>
            </div>
          );
        }

        return (
          <p key={key} className={styles.aiReportParagraph}>
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

function AiReportSection({ report }) {
  return (
    <section className={styles.aiReportCard}>
      <div className={styles.aiReportHeader}>
        <div>
          <h2 className={styles.aiReportTitle}>AI 분석 리포트</h2>
          <p className={styles.aiReportSubtitle}>
            선택한 날짜의 ERROR 로그를 기준으로 생성된 장애 분석 요약입니다.
          </p>
        </div>
        <div className={styles.aiReportMeta}>
          <span>{report.targetDate}</span>
          <strong>ERROR {report.totalErrorCnt}건</strong>
        </div>
      </div>

      <AiSummaryMarkdown content={report.aiSummary} />
    </section>
  );
}

export default function ErrorLogPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => getDateByOffset(0));
  // const [filterLevel, setFilterLevel] = useState("all");
  const [filterErrorType, setFilterErrorType] = useState("all");
  const [keyword] = useState("");
  const todayDate = getDateByOffset(0);

  const datedLogs = useMemo(() => {
    return DUMMY_LOGS.map((log) => ({
      ...log,
      timestamp: applyDateToTimestamp(log.timestamp, selectedDate),
    }));
  }, [selectedDate]);

  const filtered = useMemo(() => {
    return datedLogs.filter((log) => {
      // if (filterLevel !== "all" && log.level !== filterLevel) return false;
      if (filterErrorType !== "all" && log.errorType !== filterErrorType)
        return false;
      if (
        keyword &&
        !log.message.toLowerCase().includes(keyword.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [datedLogs, filterErrorType, keyword]);

  const aiReport = useMemo(() => {
    return {
      ...DUMMY_AI_REPORT,
      targetDate: selectedDate,
    };
  }, [selectedDate]);

  const handleRowClick = (logId) => {
    setSelectedId((prev) => (prev === logId ? null : logId));
  };

  // const handleLevelChange = (level) => {
  //   setFilterLevel(level);
  //   setSelectedId(null);
  // };

  const handleDateChange = (date) => {
    if (!date) return;

    if (date > todayDate) {
      setSelectedDate(todayDate);
      setSelectedId(null);
      return;
    }

    setSelectedDate(date);
    setSelectedId(null);
  };

  const handleErrorTypeChange = (errorType) => {
    setFilterErrorType(errorType);
    setSelectedId(null);
  };

  return (
    <div className="app-page app-page--wide app-page--padded">
      <header className="app-page-header">
        <h1 className="app-page-title">에러 로그</h1>
        <p className="app-page-subtitle"> 
          {/* 총 {filtered.length}건 ·  */}
          날짜별 장애 및 에러 로그 이력을 기반으로 AI 분석 리포트를 제공합니다. 클릭하면 상세 내용을 확인할 수 있습니다.
        </p>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.dateControls}>
          <Button
            className={styles.dateButton}
            size="small"
            variant={selectedDate === todayDate ? "contained" : "outlined"}
            onClick={() => handleDateChange(todayDate)}
          >
            오늘
          </Button>
          <Button
            className={styles.dateButton}
            size="small"
            variant={selectedDate === getDateByOffset(-1) ? "contained" : "outlined"}
            onClick={() => handleDateChange(getDateByOffset(-1))}
          >
            어제
          </Button>
          <TextField
            className={styles.datePicker}
            type="date"
            size="small"
            value={selectedDate}
            onChange={(event) => handleDateChange(event.target.value)}
          />
        </div>

        {/*
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
        */}

        <div className={styles.chipGroup}>
          {ERROR_TYPES.map((errorType) => (
            <FilterChip
              key={errorType}
              active={filterErrorType === errorType}
              tone="errorType"
              onClick={() => handleErrorTypeChange(errorType)}
            >
              {errorType === "all" ? "전체 에러 유형" : errorType}
            </FilterChip>
          ))}
        </div>
      </div>

      <LogTable
        logs={filtered}
        selectedId={selectedId}
        onRowClick={handleRowClick}
      />

      <AiReportSection report={aiReport} />

      {/* <div className={styles.footerNote}>
        {filtered.length}건 표시 중 · 페이지네이션 필요시 API 연동 시 추가
      </div> */}
    </div>
  );
}
