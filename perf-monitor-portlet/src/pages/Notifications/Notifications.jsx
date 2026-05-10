import { useEffect, useState } from "react";

import styles from "./Notifications.module.css";
// ─────────────────────────────────────────
// 하드코딩 더미 데이터
// API 붙일 때 교체 위치:
//   수신자 → GET /api/mail/recipients
//   히스토리 → USE_EMAIL_HISTORY_API를 true로 변경
// ─────────────────────────────────────────
const USE_EMAIL_HISTORY_API = false;
const EMAIL_HISTORY_ENDPOINT = "/api/email/email-histories";

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
    elId: "mail_001",
    elEmail: "monitor@company.com",
    elTitle: "[CRITICAL] API Gateway 장애 발생",
    elSenddate: "2025-05-01T14:03:22Z",
  },
  {
    elId: "mail_002",
    elEmail: "monitor@company.com",
    elTitle: "[WARN] DB 응답 지연 감지",
    elSenddate: "2025-05-01T13:47:10Z",
  },
  {
    elId: "mail_003",
    elEmail: "alert@company.com",
    elTitle: "[CRITICAL] Auth 서비스 오류",
    elSenddate: "2025-05-01T12:15:44Z",
  },
  {
    elId: "mail_004",
    elEmail: "monitor@company.com",
    elTitle: "[WARN] 응답시간 임계치 초과",
    elSenddate: "2025-05-01T11:30:05Z",
  },
  {
    elId: "mail_005",
    elEmail: "alert@company.com",
    elTitle: "[CRITICAL] Redis 세션 스토어 다운",
    elSenddate: "2025-04-30T22:08:33Z",
  },
  {
    elId: "mail_006",
    elEmail: "monitor@company.com",
    elTitle: "[WARN] Connection pool 경고",
    elSenddate: "2025-04-30T18:55:21Z",
  },
];

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1e40af" },
  { bg: "#fef3c7", color: "#92400e" },
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#ede9fe", color: "#5b21b6" },
  { bg: "#fce7f3", color: "#9d174d" },
];

function formatDateTime(iso) {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
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

function normalizeEmailHistories(payload) {
  const histories = Array.isArray(payload)
    ? payload
    : (payload?.data ??
      payload?.content ??
      payload?.histories ??
      payload?.emailHistories ??
      []);

  return histories.map((history, index) => ({
    elId: history.elId ?? history.mailId ?? history.id ?? `mail_${index + 1}`,
    elEmail: history.elEmail ?? history.senderEmail ?? "",
    elTitle: history.elTitle ?? history.subject ?? "",
    elSenddate: history.elSenddate ?? history.sentAt ?? "",
  }));
}

async function fetchEmailHistories() {
  if (!USE_EMAIL_HISTORY_API) {
    return DUMMY_HISTORY;
  }

  const response = await fetch(EMAIL_HISTORY_ENDPOINT);
  if (!response.ok) {
    throw new Error("Failed to fetch email histories");
  }

  return normalizeEmailHistories(await response.json());
}

// function ToggleSwitch({ active, onClick, title }) {
//   return (
//     <button
//       className={classNames(styles.switch, active && styles.switchOn)}
//       type="button"
//       title={title}
//       onClick={onClick}
//     >
//       <span className={styles.switchKnob} />
//     </button>
//   );
// }
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
                className={classNames(styles.input, styles.recipientEmailList)}
              >
                {recipients.length === 0 ? (
                  <span className={styles.mutedText}>수신자 없음</span>
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

function RecipientList({ recipients, onDelete }) {
  return (
    <div className={styles.panel}>
      {recipients.length === 0 && (
        <div className={styles.empty}>수신자가 없습니다.</div>
      )}

      {recipients.map((recipient) => {
        const avatar = avatarColor(recipient.id);

        return (
          <div key={recipient.id} className={styles.recipientRow}>
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

function HistoryTable({ histories, loading, error }) {
  return (
    <div className={styles.panel}>
      <table className={`app-table app-table--fixed ${styles.table}`}>
        <colgroup>
          <col className={styles.historyMetaCol} />
          <col className={styles.historyMetaCol} />
          <col />
        </colgroup>
        <thead>
          <tr>
            {["발송 시각", "발송 주소", "제목"].map((header) => (
              <th key={header} className={styles.tableHeaderLeft}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td className={styles.empty} colSpan={3}>
                발송 이력을 불러오는 중입니다.
              </td>
            </tr>
          )}

          {!loading && error && (
            <tr>
              <td className={styles.empty} colSpan={3}>
                {error}
              </td>
            </tr>
          )}

          {!loading && !error && histories.length === 0 && (
            <tr>
              <td className={styles.empty} colSpan={3}>
                발송 이력이 없습니다.
              </td>
            </tr>
          )}

          {!loading &&
            !error &&
            histories.map((history) => (
              <tr key={history.elId} className={styles.historyRow}>
                <td className={classNames(styles.timeCell, styles.cellLeft)}>
                  {formatDateTime(history.elSenddate)}
                </td>
                <td className={classNames(styles.emailCell, styles.cellLeft)}>
                  {history.elEmail}
                </td>
                <td className={classNames(styles.subjectCell, styles.cellLeft)}>
                  {history.elTitle}
                </td>
              </tr>
            ))}
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
  const [histories, setHistories] = useState(() =>
    USE_EMAIL_HISTORY_API ? [] : DUMMY_HISTORY,
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadEmailHistories() {
      setHistoryLoading(USE_EMAIL_HISTORY_API);
      setHistoryError("");

      try {
        const nextHistories = await fetchEmailHistories();
        if (!ignore) {
          setHistories(nextHistories);
        }
      } catch (error) {
        console.error(error);
        if (!ignore) {
          setHistories([]);
          setHistoryError("발송 히스토리를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setHistoryLoading(false);
        }
      }
    }

    loadEmailHistories();

    return () => {
      ignore = true;
    };
  }, []);

  // const activeCount = recipients.filter((recipient) => recipient.active).length;

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

  // const handleToggleActive = (id) => {
  //   setRecipients((prev) =>
  //     prev.map((recipient) =>
  //       recipient.id === id
  //         ? { ...recipient, active: !recipient.active }
  //         : recipient,
  //     ),
  //   );
  // };

  const handleDelete = (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    setRecipients((prev) => prev.filter((recipient) => recipient.id !== id));
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

      <div className="app-page app-page--wide app-page--padded">
        <header className="app-page-header">
          <h1 className="app-page-title">알림 설정</h1>
          <p className="app-page-subtitle">
            장애 알림 수신자 관리 및 발송 이력 조회
          </p>
        </header>

        {/* <div className={styles.summaryGrid}>
          <SummaryCard label="전체 수신자" value={recipients.length} />
          <SummaryCard label="활성 수신자" value={activeCount} />
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

            <RecipientList recipients={recipients} onDelete={handleDelete} />
          </section>

          <section>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>발송 히스토리</span>
              {/* <span className={styles.sectionMeta}>최근 7일</span> */}
            </div>

            <HistoryTable
              histories={histories}
              loading={historyLoading}
              error={historyError}
            />

            {/* <div className={styles.footerNote}>
              {histories.length}건 표시 중 · 페이지네이션은 API 연동 시
              추가
            </div> */}
          </section>
        </div>
      </div>
    </>
  );
}
