import { useMemo, useState } from "react";

import styles from "./Notifications.module.css";
// ─────────────────────────────────────────
// 하드코딩 더미 데이터
// API 붙일 때 교체 위치:
//   수신자 → GET /api/mail/recipients
//   히스토리 → GET /api/mail/history?page=0&size=10
// ─────────────────────────────────────────
const DUMMY_RECIPIENTS = [
  {
    id: 1,
    email: "yj.hong@company.com",
    name: "홍유진",
    team: "운영팀",
    active: true,
  },
  {
    id: 2,
    email: "sh.lee@company.com",
    name: "이승환",
    team: "개발팀",
    active: false,
  },
  {
    id: 3,
    email: "ji.han@company.com",
    name: "한정일",
    team: "인프라팀",
    active: false,
  },
  {
    id: 4,
    email: "yh.heo@company.com",
    name: "허연혜",
    team: "운영팀",
    active: true,
  },
  {
    id: 5,
    email: "yr.jeon@company.com",
    name: "전여름",
    team: "운영팀",
    active: true,
  },
  {
    id: 6,
    email: "ne.kim@company.com",
    name: "김나은",
    team: "개발팀",
    active: true,
  },
];

const DUMMY_HISTORY = [
  {
    mailId: "mail_001",
    senderEmail: "monitor@company.com",
    subject: "[CRITICAL] API Gateway 장애 발생",
    sentAt: "2025-05-01T14:03:22Z",
    status: "SUCCESS",
    recipientCount: 3,
    triggerLevel: "ERROR",
    relatedLogId: "log_001",
  },
  {
    mailId: "mail_002",
    senderEmail: "monitor@company.com",
    subject: "[WARN] DB 응답 지연 감지",
    sentAt: "2025-05-01T13:47:10Z",
    status: "SUCCESS",
    recipientCount: 3,
    triggerLevel: "WARN",
    relatedLogId: "log_008",
  },
  {
    mailId: "mail_003",
    senderEmail: "alert@company.com",
    subject: "[CRITICAL] Auth 서비스 오류",
    sentAt: "2025-05-01T12:15:44Z",
    status: "FAIL",
    recipientCount: 0,
    triggerLevel: "ERROR",
    relatedLogId: "log_005",
  },
  {
    mailId: "mail_004",
    senderEmail: "monitor@company.com",
    subject: "[WARN] 응답시간 임계치 초과",
    sentAt: "2025-05-01T11:30:05Z",
    status: "SUCCESS",
    recipientCount: 4,
    triggerLevel: "WARN",
    relatedLogId: "log_004",
  },
  {
    mailId: "mail_005",
    senderEmail: "alert@company.com",
    subject: "[CRITICAL] Redis 세션 스토어 다운",
    sentAt: "2025-04-30T22:08:33Z",
    status: "SUCCESS",
    recipientCount: 3,
    triggerLevel: "ERROR",
    relatedLogId: "log_005",
  },
  {
    mailId: "mail_006",
    senderEmail: "monitor@company.com",
    subject: "[WARN] Connection pool 경고",
    sentAt: "2025-04-30T18:55:21Z",
    status: "FAIL",
    recipientCount: 0,
    triggerLevel: "WARN",
    relatedLogId: "log_003",
  },
];

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1e40af" },
  { bg: "#fef3c7", color: "#92400e" },
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#ede9fe", color: "#5b21b6" },
  { bg: "#fce7f3", color: "#9d174d" },
];

const LEVEL_STYLE = {
  ERROR: { bg: "#fee2e2", color: "#b91c1c" },
  WARN: { bg: "#fef3c7", color: "#92400e" },
};

const HISTORY_FILTERS = [
  { key: "all", label: "전체" },
  { key: "SUCCESS", label: "성공" },
  { key: "FAIL", label: "실패" },
];

function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name) {
  if (!name) return "?";
  return name.slice(0, 2);
}

function avatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function classNames(...names) {
  return names.filter(Boolean).join(" ");
}

function ToggleSwitch({ active, onClick, title }) {
  return (
    <button
      className={classNames(styles.switch, active && styles.switchOn)}
      type="button"
      title={title}
      onClick={onClick}
    >
      <span className={styles.switchKnob} />
    </button>
  );
}
// ─────────────────────────────────────────
// 수신자 추가/수정 모달
// ─────────────────────────────────────────
function RecipientModal({ initial, recipients, onSave, onClose }) {
  const [newEmail, setNewEmail] = useState("");
  const isEdit = Boolean(initial);

  const handleSave = () => {
    if (!newEmail) {
      alert("이메일은 필수입니다.");
      return;
    }
    if (recipients.some((r) => r.email === newEmail)) {
      alert("이미 등록된 이메일입니다.");
      return;
    }
    onSave({ email: newEmail });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>
          {isEdit ? "수신자 수정" : "수신자 추가"}
        </h2>

        {!isEdit && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>등록된 수신자</label>
              <div
                className={styles.input}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {recipients.length === 0 ? (
                  <span style={{ color: "var(--app-muted)" }}>수신자 없음</span>
                ) : (
                  recipients.map((r) => <div key={r.id}>{r.email}</div>)
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>추가할 이메일 *</label>
              <input
                className={styles.input}
                type="email"
                value={newEmail}
                placeholder="example@company.com"
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSave();
                  }
                }}
              />
            </div>
          </>
        )}

        <div className={styles.modalActions}>
          <button
            className={classNames(styles.modalButton, styles.cancelButton)}
            type="button"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className={classNames(styles.modalButton, styles.saveButton)}
            type="button"
            onClick={handleSave}
          >
            {isEdit ? "저장" : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className={styles.summaryCard}>
      <div className={styles.summaryLabel}>{label}</div>
      <div className={styles.summaryValue}>{value}</div>
    </div>
  );
}

function RecipientList({ recipients, onToggleActive, onEdit, onDelete }) {
  return (
    <div className={styles.panel}>
      {recipients.length === 0 && (
        <div className={styles.empty}>수신자가 없습니다.</div>
      )}

      {recipients.map((recipient) => {
        const avatar = avatarColor(recipient.id);

        return (
          <div
            key={recipient.id}
            className={classNames(
              styles.recipientRow,
              !recipient.active && styles.inactive,
            )}
          >
            <div
              className={styles.avatar}
              style={{
                "--avatar-bg": avatar.bg,
                "--avatar-color": avatar.color,
              }}
            >
              {getInitials(recipient.email)}
            </div>

            <div className={styles.recipientInfo}>
              <div className={styles.recipientMeta}>{recipient.email}</div>
            </div>

            <button
              className={styles.dangerButton}
              type="button"
              onClick={() => onDelete(recipient.id)}
            >
              삭제
            </button>

            {/* <ToggleSwitch
              active={recipient.active}
              title={recipient.active ? "비활성화" : "활성화"}
              onClick={() => onToggleActive(recipient.id)}
            /> */}

            {/* <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => onEdit(recipient)}
            >
              수정
            </button> */}
            {/* <button className={styles.dangerButton} type="button" onClick={() => onDelete(recipient.id)}>
              삭제
            </button> */}
          </div>
        );
      })}
    </div>
  );
}

function LevelBadge({ level }) {
  const style = LEVEL_STYLE[level] ?? LEVEL_STYLE.WARN;
  return (
    <span
      className={styles.levelBadge}
      style={{ "--level-bg": style.bg, "--level-color": style.color }}
    >
      {level}
    </span>
  );
}

function HistoryDetail({ history }) {
  return (
    <tr>
      <td className={styles.detailCell} colSpan={3}>
        <div className={styles.detailPanel}>
          <div className={styles.detailGrid}>
            {[
              ["Mail ID", history.mailId],
              ["트리거 레벨", history.triggerLevel],
              ["연결 로그 ID", history.relatedLogId],
            ].map(([label, value]) => (
              <div key={label}>
                <div className={styles.detailLabel}>{label}</div>
                <div className={styles.detailValue}>
                  {label === "트리거 레벨" ? (
                    <LevelBadge level={value} />
                  ) : (
                    value
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
}

function HistoryTable({ histories, expandedMail, onToggle }) {
  return (
    <div className={styles.panel}>
      <table className={styles.table}>
        <colgroup>
          <col className={styles.sentAtCol} />
          <col className={styles.emailCol} />
          <col />
        </colgroup>
        <thead>
          <tr>
            {["발송 시각", "발송 주소", "제목"].map((header) => (
              <th key={header} style={{ textAlign: "center" }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {histories.length === 0 && (
            <tr>
              <td className={styles.empty} colSpan={3}>
                발송 이력이 없습니다.
              </td>
            </tr>
          )}

          {histories.map((history) => {
            const isOpen = expandedMail === history.mailId;

            return (
              <>
                <tr
                  key={history.mailId}
                  className={classNames(
                    styles.historyRow,
                    isOpen && styles.historyRowOpen,
                  )}
                  onClick={() => onToggle(history.mailId)}
                >
                  <td
                    className={styles.timeCell}
                    style={{ textAlign: "center" }}
                  >
                    {formatDateTime(history.sentAt)}
                  </td>
                  <td
                    className={styles.emailCell}
                    style={{ textAlign: "center" }}
                  >
                    {history.senderEmail}
                  </td>
                  <td
                    className={styles.subjectCell}
                    style={{ textAlign: "left" }}
                  >
                    {history.subject}
                  </td>
                </tr>

                {isOpen && (
                  <HistoryDetail
                    key={`detail-${history.mailId}`}
                    history={history}
                  />
                )}
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
export default function Notifications() {
  const [recipients, setRecipients] = useState(DUMMY_RECIPIENTS);
  const [modal, setModal] = useState(null);
  const [historyStatus, setHistoryStatus] = useState("all");
  const [expandedMail, setExpandedMail] = useState(null);

  const filteredHistory = useMemo(() => {
    return DUMMY_HISTORY.filter((history) => {
      if (historyStatus !== "all" && history.status !== historyStatus)
        return false;
      return true;
    });
  }, [historyStatus]);

  const activeCount = recipients.filter((recipient) => recipient.active).length;
  const successCount = DUMMY_HISTORY.filter(
    (history) => history.status === "SUCCESS",
  ).length;

  const handleSaveRecipient = (form) => {
    if (modal.mode === "add") {
      setRecipients((prev) => [
        ...prev,
        { ...form, id: Date.now(), name: "", team: "", active: true },
      ]);
    } else {
      setRecipients((prev) =>
        prev.map((recipient) =>
          recipient.id === modal.data.id
            ? { ...recipient, ...form }
            : recipient,
        ),
      );
    }
    setModal(null);
  };

  const handleToggleActive = (id) => {
    setRecipients((prev) =>
      prev.map((recipient) =>
        recipient.id === id
          ? { ...recipient, active: !recipient.active }
          : recipient,
      ),
    );
  };

  const handleDelete = (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setRecipients((prev) => prev.filter((recipient) => recipient.id !== id));
  };

  const handleToggleHistory = (mailId) => {
    setExpandedMail((current) => (current === mailId ? null : mailId));
  };

  return (
    <>
      {modal && (
        <RecipientModal
          initial={modal.mode === "edit" ? modal.data : null}
          recipients={recipients}
          onSave={handleSaveRecipient}
          onClose={() => setModal(null)}
        />
      )}

      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>알림 설정</h1>
          <p className={styles.subtitle}>
            장애 알림 수신자 관리 및 발송 이력 조회
          </p>
        </header>

        {/* <div className={styles.summaryGrid}>
          <SummaryCard label="전체 수신자" value={recipients.length} />
          <SummaryCard label="활성 수신자" value={activeCount} />
          <SummaryCard label="발송 성공 (7일)" value={successCount} />
        </div> */}

        <div className={styles.contentGrid}>
          <section>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>알림 수신자</span>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => setModal({ mode: "add" })}
              >
                + 추가
              </button>
            </div>

            <RecipientList
              recipients={recipients}
              onToggleActive={handleToggleActive}
              onEdit={(recipient) =>
                setModal({ mode: "edit", data: recipient })
              }
              onDelete={handleDelete}
            />
          </section>

          <section>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>발송 히스토리</span>
              <span className={styles.sectionMeta}>최근 7일</span>
            </div>

            {/* 발송 히스토리: 전체, 성공, 실패 필터 */}
            {/* <div className={styles.filterBar}>
              {HISTORY_FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  className={classNames(styles.chip, historyStatus === filter.key && styles.chipActive)}
                  type="button"
                  onClick={() => setHistoryStatus(filter.key)}
                >
                  {filter.label}
                </button>
              ))}
            </div> */}

            <HistoryTable
              histories={filteredHistory}
              expandedMail={expandedMail}
              onToggle={handleToggleHistory}
            />

            <div className={styles.footerNote}>
              {filteredHistory.length}건 표시 중 · 페이지네이션은 API 연동 시
              추가
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
