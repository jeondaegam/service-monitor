import { useMemo, useState } from "react";

import styles from "./MailManagePage.module.css";
// ─────────────────────────────────────────
// 하드코딩 더미 데이터
// API 붙일 때 교체 위치:
//   수신자 → GET /api/mail/recipients
//   히스토리 → GET /api/mail/history?page=0&size=10
// ─────────────────────────────────────────
const DUMMY_RECIPIENTS = [
  { id: 1, email: "kim.junho@company.com", name: "김준호", team: "운영팀", active: true },
  { id: 2, email: "lee.soyeon@company.com", name: "이소연", team: "개발팀", active: true },
  { id: 3, email: "park.junhee@company.com", name: "박준희", team: "인프라팀", active: false },
  { id: 4, email: "choi.minjun@company.com", name: "최민준", team: "운영팀", active: true },
];

const DUMMY_HISTORY = [
  {
    mailId: "mail_001",
    subject: "[CRITICAL] API Gateway 장애 발생",
    sentAt: "2025-05-01T14:03:22Z",
    status: "SUCCESS",
    recipientCount: 3,
    triggerLevel: "ERROR",
    relatedLogId: "log_001",
  },
  {
    mailId: "mail_002",
    subject: "[WARN] DB 응답 지연 감지",
    sentAt: "2025-05-01T13:47:10Z",
    status: "SUCCESS",
    recipientCount: 3,
    triggerLevel: "WARN",
    relatedLogId: "log_008",
  },
  {
    mailId: "mail_003",
    subject: "[CRITICAL] Auth 서비스 오류",
    sentAt: "2025-05-01T12:15:44Z",
    status: "FAIL",
    recipientCount: 0,
    triggerLevel: "ERROR",
    relatedLogId: "log_005",
  },
  {
    mailId: "mail_004",
    subject: "[WARN] 응답시간 임계치 초과",
    sentAt: "2025-05-01T11:30:05Z",
    status: "SUCCESS",
    recipientCount: 4,
    triggerLevel: "WARN",
    relatedLogId: "log_004",
  },
  {
    mailId: "mail_005",
    subject: "[CRITICAL] Redis 세션 스토어 다운",
    sentAt: "2025-04-30T22:08:33Z",
    status: "SUCCESS",
    recipientCount: 3,
    triggerLevel: "ERROR",
    relatedLogId: "log_005",
  },
  {
    mailId: "mail_006",
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
function RecipientModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial ?? { email: "", name: "", team: "", active: true },
  );
  const isEdit = Boolean(initial);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.email || !form.name) {
      alert("이메일과 이름은 필수입니다.");
      return;
    }
    onSave(form);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <h2 className={styles.modalTitle}>{isEdit ? "수신자 수정" : "수신자 추가"}</h2>

        {[
          { label: "이메일 *", key: "email", type: "email", placeholder: "example@company.com" },
          { label: "이름 *", key: "name", type: "text", placeholder: "홍길동" },
          { label: "팀", key: "team", type: "text", placeholder: "운영팀" },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} className={styles.field}>
            <label className={styles.label}>{label}</label>
            <input
              className={styles.input}
              type={type}
              value={form[key]}
              placeholder={placeholder}
              onChange={(event) => set(key, event.target.value)}
            />
          </div>
        ))}

        <div className={styles.modalSwitchRow}>
          <span className={styles.label}>활성화</span>
          <ToggleSwitch active={form.active} onClick={() => set("active", !form.active)} />
          <span className={classNames(styles.switchText, form.active && styles.switchTextActive)}>
            {form.active ? "활성" : "비활성"}
          </span>
        </div>

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
      {recipients.length === 0 && <div className={styles.empty}>수신자가 없습니다.</div>}

      {recipients.map((recipient) => {
        const avatar = avatarColor(recipient.id);

        return (
          <div
            key={recipient.id}
            className={classNames(styles.recipientRow, !recipient.active && styles.inactive)}
          >
            <div
              className={styles.avatar}
              style={{ "--avatar-bg": avatar.bg, "--avatar-color": avatar.color }}
            >
              {getInitials(recipient.name)}
            </div>

            <div className={styles.recipientInfo}>
              <div className={styles.recipientName}>{recipient.name}</div>
              <div className={styles.recipientMeta}>
                {recipient.email} · {recipient.team}
              </div>
            </div>

            <ToggleSwitch
              active={recipient.active}
              title={recipient.active ? "비활성화" : "활성화"}
              onClick={() => onToggleActive(recipient.id)}
            />

            <button className={styles.secondaryButton} type="button" onClick={() => onEdit(recipient)}>
              수정
            </button>
            <button className={styles.dangerButton} type="button" onClick={() => onDelete(recipient.id)}>
              삭제
            </button>
          </div>
        );
      })}
    </div>
  );
}

function HistoryStatusBadge({ status }) {
  const isSuccess = status === "SUCCESS";
  return (
    <span className={classNames(styles.statusBadge, isSuccess ? styles.successBadge : styles.failBadge)}>
      {isSuccess ? "성공" : "실패"}
    </span>
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
      <td className={styles.detailCell} colSpan={4}>
        <div className={styles.detailPanel}>
          <div className={styles.detailGrid}>
            {[
              ["Mail ID", history.mailId],
              ["트리거 레벨", history.triggerLevel],
              [
                "수신자",
                history.status === "SUCCESS" ? `${history.recipientCount}명` : "발송 실패",
              ],
              ["연결 로그 ID", history.relatedLogId],
            ].map(([label, value]) => (
              <div key={label}>
                <div className={styles.detailLabel}>{label}</div>
                <div className={styles.detailValue}>
                  {label === "트리거 레벨" ? <LevelBadge level={value} /> : value}
                </div>
              </div>
            ))}
          </div>

          {history.status === "FAIL" && (
            <div className={styles.failMessage}>
              발송 실패: SMTP 연결 오류 또는 수신자 목록이 비어있을 수 있습니다.
            </div>
          )}
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
          <col />
          <col className={styles.statusCol} />
          <col className={styles.countCol} />
        </colgroup>
        <thead>
          <tr>
            {["발송 시각", "제목", "결과", "수신자"].map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {histories.length === 0 && (
            <tr>
              <td className={styles.empty} colSpan={4}>
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
                  className={classNames(styles.historyRow, isOpen && styles.historyRowOpen)}
                  onClick={() => onToggle(history.mailId)}
                >
                  <td className={styles.timeCell}>{formatDateTime(history.sentAt)}</td>
                  <td className={styles.subjectCell}>{history.subject}</td>
                  <td>
                    <HistoryStatusBadge status={history.status} />
                  </td>
                  <td className={styles.centerCell}>
                    {history.status === "SUCCESS" ? `${history.recipientCount}명` : "-"}
                  </td>
                </tr>

                {isOpen && <HistoryDetail key={`detail-${history.mailId}`} history={history} />}
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
export default function MailManagePage() {
  const [recipients, setRecipients] = useState(DUMMY_RECIPIENTS);
  const [modal, setModal] = useState(null);
  const [historyStatus, setHistoryStatus] = useState("all");
  const [expandedMail, setExpandedMail] = useState(null);

  const filteredHistory = useMemo(() => {
    return DUMMY_HISTORY.filter((history) => {
      if (historyStatus !== "all" && history.status !== historyStatus) return false;
      return true;
    });
  }, [historyStatus]);

  const activeCount = recipients.filter((recipient) => recipient.active).length;
  const successCount = DUMMY_HISTORY.filter((history) => history.status === "SUCCESS").length;

  const handleSaveRecipient = (form) => {
    if (modal.mode === "add") {
      setRecipients((prev) => [...prev, { ...form, id: Date.now() }]);
    } else {
      setRecipients((prev) =>
        prev.map((recipient) =>
          recipient.id === modal.data.id ? { ...recipient, ...form } : recipient,
        ),
      );
    }
    setModal(null);
  };

  const handleToggleActive = (id) => {
    setRecipients((prev) =>
      prev.map((recipient) =>
        recipient.id === id ? { ...recipient, active: !recipient.active } : recipient,
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
          onSave={handleSaveRecipient}
          onClose={() => setModal(null)}
        />
      )}

      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>메일 관리</h1>
          <p className={styles.subtitle}>장애 알림 수신자 관리 및 발송 이력 조회</p>
        </header>

        <div className={styles.summaryGrid}>
          <SummaryCard label="전체 수신자" value={recipients.length} />
          <SummaryCard label="활성 수신자" value={activeCount} />
          <SummaryCard label="발송 성공 (7일)" value={successCount} />
        </div>

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
              onEdit={(recipient) => setModal({ mode: "edit", data: recipient })}
              onDelete={handleDelete}
            />
          </section>

          <section>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>발송 히스토리</span>
              <span className={styles.sectionMeta}>최근 30일</span>
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
              {filteredHistory.length}건 표시 중 · 페이지네이션은 API 연동 시 추가
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
