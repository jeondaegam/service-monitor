import { useState, useMemo } from "react";

// ─────────────────────────────────────────
// 하드코딩 더미 데이터
// API 붙일 때 교체 위치:
//   수신자 → GET /api/mail/recipients
//   히스토리 → GET /api/mail/history?page=0&size=10
// ─────────────────────────────────────────
const DUMMY_RECIPIENTS = [
  { id: 1, email: "kim.junho@company.com",   name: "김준호", team: "운영팀", active: true  },
  { id: 2, email: "lee.soyeon@company.com",  name: "이소연", team: "개발팀", active: true  },
  { id: 3, email: "park.junhee@company.com", name: "박준희", team: "인프라팀", active: false },
  { id: 4, email: "choi.minjun@company.com", name: "최민준", team: "운영팀", active: true  },
];

const DUMMY_HISTORY = [
  { mailId: "mail_001", subject: "[CRITICAL] API Gateway 장애 발생", sentAt: "2025-05-01T14:03:22Z", status: "SUCCESS", recipientCount: 3, triggerLevel: "ERROR",  relatedLogId: "log_001" },
  { mailId: "mail_002", subject: "[WARN] DB 응답 지연 감지",         sentAt: "2025-05-01T13:47:10Z", status: "SUCCESS", recipientCount: 3, triggerLevel: "WARN",   relatedLogId: "log_008" },
  { mailId: "mail_003", subject: "[CRITICAL] Auth 서비스 오류",      sentAt: "2025-05-01T12:15:44Z", status: "FAIL",    recipientCount: 0, triggerLevel: "ERROR",  relatedLogId: "log_005" },
  { mailId: "mail_004", subject: "[WARN] 응답시간 임계치 초과",       sentAt: "2025-05-01T11:30:05Z", status: "SUCCESS", recipientCount: 4, triggerLevel: "WARN",   relatedLogId: "log_004" },
  { mailId: "mail_005", subject: "[CRITICAL] Redis 세션 스토어 다운", sentAt: "2025-04-30T22:08:33Z", status: "SUCCESS", recipientCount: 3, triggerLevel: "ERROR",  relatedLogId: "log_005" },
  { mailId: "mail_006", subject: "[WARN] Connection pool 경고",      sentAt: "2025-04-30T18:55:21Z", status: "FAIL",    recipientCount: 0, triggerLevel: "WARN",   relatedLogId: "log_003" },
];

// ─────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────
function formatDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function getInitials(name) {
  if (!name) return "?";
  return name.slice(0, 2);
}

const AVATAR_COLORS = [
  { bg: "#DBEAFE", color: "#1E40AF" },
  { bg: "#FEF3C7", color: "#92400E" },
  { bg: "#D1FAE5", color: "#065F46" },
  { bg: "#EDE9FE", color: "#5B21B6" },
  { bg: "#FCE7F3", color: "#9D174D" },
];

function avatarColor(id) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

const LEVEL_STYLE = {
  ERROR: { bg: "#FEE2E2", color: "#B91C1C" },
  WARN:  { bg: "#FEF3C7", color: "#92400E" },
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

// ─────────────────────────────────────────
// 수신자 추가/수정 모달
// ─────────────────────────────────────────
function RecipientModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial ?? { email: "", name: "", team: "", active: true }
  );
  const isEdit = !!initial;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.email || !form.name) return alert("이메일과 이름은 필수입니다.");
    onSave(form);
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
    }}
      onClick={onClose}
    >
      <div
        style={{
          background: UI.panel, borderRadius: 14, padding: 28, width: 380,
          border: `1px solid ${UI.border}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 20px", color: UI.text }}>
          {isEdit ? "수신자 수정" : "수신자 추가"}
        </h2>

        {[
          { label: "이메일 *", key: "email", type: "email",  placeholder: "example@company.com" },
          { label: "이름 *",   key: "name",  type: "text",   placeholder: "홍길동" },
          { label: "팀",       key: "team",  type: "text",   placeholder: "운영팀" },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: UI.muted, display: "block", marginBottom: 4 }}>{label}</label>
            <input
              type={type}
              value={form[key]}
              placeholder={placeholder}
              onChange={(e) => set(key, e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", fontSize: 13,
                border: `1px solid ${UI.border}`, borderRadius: 8, outline: "none",
                background: UI.panelAlt, color: UI.text,
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}

        <div style={{ marginBottom: 22, display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ fontSize: 12, color: UI.muted }}>활성화</label>
          <div
            onClick={() => set("active", !form.active)}
            style={{
              width: 40, height: 22, borderRadius: 11,
              background: form.active ? "#6366F1" : "#D1D5DB",
              position: "relative", cursor: "pointer", transition: "background 0.2s",
            }}
          >
            <div style={{
              position: "absolute", top: 3,
              left: form.active ? 20 : 3,
              width: 16, height: 16, borderRadius: "50%",
              background: "#fff", transition: "left 0.2s",
            }} />
          </div>
          <span style={{ fontSize: 12, color: form.active ? "#4338CA" : "#9CA3AF" }}>
            {form.active ? "활성" : "비활성"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13,
              border: `1px solid ${UI.border}`, background: UI.panel, color: UI.text, cursor: "pointer",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 18px", borderRadius: 8, fontSize: 13,
              border: "none", background: "#6366F1", color: "#fff",
              fontWeight: 600, cursor: "pointer",
            }}
          >
            {isEdit ? "저장" : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 메인 페이지
// ─────────────────────────────────────────
export default function MailManagePage() {
  const [recipients, setRecipients] = useState(DUMMY_RECIPIENTS);
  const [modal, setModal] = useState(null); // null | { mode: "add" | "edit", data?: recipient }

  const [histKeyword,   setHistKeyword]   = useState("");
  const [histStatus,    setHistStatus]    = useState("all"); // all | SUCCESS | FAIL
  const [expandedMail,  setExpandedMail]  = useState(null);

  // ── 수신자 액션 ──────────────────────────
  // API 붙일 때:
  //   추가 → POST /api/mail/recipients
  //   수정 → PUT  /api/mail/recipients/{id}
  //   삭제 → DEL  /api/mail/recipients/{id}
  const handleSaveRecipient = (form) => {
    if (modal.mode === "add") {
      setRecipients((p) => [...p, { ...form, id: Date.now() }]);
    } else {
      setRecipients((p) =>
        p.map((r) => (r.id === modal.data.id ? { ...r, ...form } : r))
      );
    }
    setModal(null);
  };

  const handleToggleActive = (id) => {
    setRecipients((p) =>
      p.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
    // API: PUT /api/mail/recipients/{id}  body: { active: !current }
  };

  const handleDelete = (id) => {
    if (!window.confirm("정말 삭제하시겠어요?")) return;
    setRecipients((p) => p.filter((r) => r.id !== id));
    // API: DELETE /api/mail/recipients/{id}
  };

  // ── 히스토리 필터 ─────────────────────────
  const filteredHistory = useMemo(() => {
    return DUMMY_HISTORY.filter((h) => {
      if (histStatus !== "all" && h.status !== histStatus) return false;
      if (histKeyword && !h.subject.includes(histKeyword)) return false;
      return true;
    });
  }, [histStatus, histKeyword]);

  // ── 공용 스타일 헬퍼 ─────────────────────
  const chipStyle = (active) => ({
    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
    cursor: "pointer", border: "1px solid",
    borderColor: active ? "#6366F1" : UI.border,
    background: active ? UI.active : UI.panel,
    color: active ? "#6366F1" : UI.muted,
    transition: "all 0.15s",
  });

  const activeCount   = recipients.filter((r) => r.active).length;
  const successCount  = DUMMY_HISTORY.filter((h) => h.status === "SUCCESS").length;
  const failCount     = DUMMY_HISTORY.filter((h) => h.status === "FAIL").length;

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hist-row:hover td { background: var(--app-hover); cursor: pointer; }
        .hist-row.expanded td { background: var(--app-active); }
        .recip-row:hover { background: var(--app-hover); }
      `}</style>

      {/* 모달 */}
      {modal && (
        <RecipientModal
          initial={modal.mode === "edit" ? modal.data : null}
          onSave={handleSaveRecipient}
          onClose={() => setModal(null)}
        />
      )}

      <div style={{ padding: "28px 32px", fontFamily: "system-ui, sans-serif", maxWidth: 1100, margin: "0 auto", color: UI.text }}>

        {/* ── 헤더 ── */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: UI.text, margin: 0 }}>메일 관리</h1>
          <p style={{ fontSize: 13, color: UI.muted, marginTop: 4 }}>
            장애 알림 수신자 관리 및 발송 이력 조회
          </p>
        </div>

        {/* ── 요약 카드 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "전체 수신자",    value: recipients.length, color: "#6366F1", bg: "#EEF2FF" },
            { label: "활성 수신자",    value: activeCount,       color: "#059669", bg: "#D1FAE5" },
            { label: "발송 성공 (30일)", value: successCount,    color: "#0284C7", bg: "#E0F2FE" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{
              background: UI.panel, border: `1px solid ${UI.border}`,
              borderRadius: 12, padding: "16px 20px",
            }}>
              <div style={{ fontSize: 12, color: UI.muted, marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* ── 2-column 레이아웃 ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 20, alignItems: "start" }}>

          {/* ── 왼쪽: 수신자 관리 ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: UI.text }}>알림 수신자</span>
              <button
                onClick={() => setModal({ mode: "add" })}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: "none", background: "#6366F1", color: "#fff", cursor: "pointer",
                }}
              >
                + 추가
              </button>
            </div>

            <div style={{ background: UI.panel, border: `1px solid ${UI.border}`, borderRadius: 12, overflow: "hidden" }}>
              {recipients.length === 0 && (
                <div style={{ padding: 32, textAlign: "center", color: UI.softText, fontSize: 14 }}>
                  수신자가 없습니다.
                </div>
              )}
              {recipients.map((r, idx) => {
                const ac = avatarColor(r.id);
                return (
                  <div
                    key={r.id}
                    className="recip-row"
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px",
                      borderBottom: idx < recipients.length - 1 ? `1px solid ${UI.border}` : "none",
                      opacity: r.active ? 1 : 0.5,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {/* 아바타 */}
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: ac.bg, color: ac.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                    }}>
                      {getInitials(r.name)}
                    </div>

                    {/* 정보 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: UI.text }}>{r.name}</div>
                      <div style={{
                        fontSize: 11, color: UI.muted,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {r.email} · {r.team}
                      </div>
                    </div>

                    {/* 상태 토글 */}
                    <div
                      onClick={() => handleToggleActive(r.id)}
                      title={r.active ? "비활성화" : "활성화"}
                      style={{
                        width: 34, height: 20, borderRadius: 10,
                        background: r.active ? "#6366F1" : "#D1D5DB",
                        position: "relative", cursor: "pointer",
                        transition: "background 0.2s", flexShrink: 0,
                      }}
                    >
                      <div style={{
                        position: "absolute", top: 2,
                        left: r.active ? 16 : 2,
                        width: 16, height: 16, borderRadius: "50%",
                        background: "#fff", transition: "left 0.2s",
                      }} />
                    </div>

                    {/* 수정 버튼 */}
                    <button
                      onClick={() => setModal({ mode: "edit", data: r })}
                      style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11,
                        border: `1px solid ${UI.border}`, background: UI.panel,
                        color: UI.text, cursor: "pointer", flexShrink: 0,
                      }}
                    >
                      수정
                    </button>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={() => handleDelete(r.id)}
                      style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11,
                        border: "1px solid #FECACA", background: "#FEF2F2",
                        color: "#B91C1C", cursor: "pointer", flexShrink: 0,
                      }}
                    >
                      삭제
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 오른쪽: 발송 히스토리 ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: UI.text }}>발송 히스토리</span>
              <span style={{ fontSize: 12, color: UI.softText }}>최근 30일</span>
            </div>

            {/* 히스토리 필터 */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
              {[
                { key: "all",     label: "전체" },
                { key: "SUCCESS", label: "성공" },
                { key: "FAIL",    label: "실패" },
              ].map(({ key, label }) => (
                <button key={key} style={chipStyle(histStatus === key)} onClick={() => setHistStatus(key)}>
                  {label}
                </button>
              ))}
              {/* <input
                placeholder="제목 검색..."
                value={histKeyword}
                onChange={(e) => setHistKeyword(e.target.value)}
                style={{
                  marginLeft: "auto", padding: "5px 10px", fontSize: 12,
                  border: "1px solid #D1D5DB", borderRadius: 8, outline: "none", width: 140,
                }}
              /> */}
            </div>

            {/* 히스토리 테이블 */}
            <div style={{ background: UI.panel, border: `1px solid ${UI.border}`, borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: 90 }} />
                  <col />
                  <col style={{ width: 52 }} />
                  <col style={{ width: 46 }} />
                </colgroup>
                <thead>
                  <tr style={{ background: UI.panelAlt, borderBottom: `1px solid ${UI.border}` }}>
                    {["발송 시각", "제목", "결과", "수신자"].map((h) => (
                      <th key={h} style={{
                        textAlign: "left", fontSize: 11, fontWeight: 600,
                        color: UI.muted, padding: "9px 12px",
                        letterSpacing: "0.05em", textTransform: "uppercase",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center", padding: 32, color: UI.softText, fontSize: 13 }}>
                        발송 이력이 없습니다.
                      </td>
                    </tr>
                  )}
                  {filteredHistory.map((h) => {
                    const isOpen = expandedMail === h.mailId;
                    const ls = LEVEL_STYLE[h.triggerLevel] ?? LEVEL_STYLE.WARN;
                    return (
                      <>
                        <tr
                          key={h.mailId}
                          className={`hist-row${isOpen ? " expanded" : ""}`}
                          onClick={() => setExpandedMail(isOpen ? null : h.mailId)}
                        >
                          <td style={{ padding: "9px 12px", fontSize: 11, fontFamily: "monospace", color: UI.muted, borderBottom: isOpen ? "none" : `1px solid ${UI.border}` }}>
                            {formatDateTime(h.sentAt)}
                          </td>
                          <td style={{
                            padding: "9px 12px", fontSize: 12, color: UI.text,
                            borderBottom: isOpen ? "none" : `1px solid ${UI.border}`,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {h.subject}
                          </td>
                          <td style={{ padding: "9px 12px", borderBottom: isOpen ? "none" : `1px solid ${UI.border}` }}>
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                              background: h.status === "SUCCESS" ? "#D1FAE5" : "#FEE2E2",
                              color:      h.status === "SUCCESS" ? "#065F46" : "#B91C1C",
                            }}>
                              {h.status === "SUCCESS" ? "성공" : "실패"}
                            </span>
                          </td>
                          <td style={{ padding: "9px 12px", fontSize: 12, color: UI.muted, textAlign: "center", borderBottom: isOpen ? "none" : `1px solid ${UI.border}` }}>
                            {h.status === "SUCCESS" ? `${h.recipientCount}명` : "—"}
                          </td>
                        </tr>

                        {/* 인라인 상세 */}
                        {isOpen && (
                          <tr key={`detail-${h.mailId}`}>
                            <td colSpan={4} style={{ padding: 0, borderBottom: `1px solid ${UI.border}` }}>
                              <div style={{
                                background: UI.active,
                                borderLeft: "3px solid #6366F1",
                                padding: "14px 16px",
                                animation: "slideDown 0.15s ease",
                              }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
                                  {[
                                    ["Mail ID",      h.mailId],
                                    ["트리거 레벨",   h.triggerLevel],
                                    ["수신자 수",     h.status === "SUCCESS" ? `${h.recipientCount}명` : "발송 실패"],
                                    ["연관 로그 ID",  h.relatedLogId],
                                  ].map(([k, v]) => (
                                    <div key={k}>
                                      <div style={{ fontSize: 11, color: UI.muted, marginBottom: 2 }}>{k}</div>
                                      <div style={{
                                        fontSize: 12, fontFamily: "monospace", color: UI.text,
                                        display: "flex", alignItems: "center", gap: 6,
                                      }}>
                                        {k === "트리거 레벨" ? (
                                          <span style={{
                                            fontSize: 10, fontWeight: 600, padding: "2px 8px",
                                            borderRadius: 20, background: ls.bg, color: ls.color,
                                          }}>{v}</span>
                                        ) : v}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {h.status === "FAIL" && (
                                  <div style={{
                                    marginTop: 12, padding: "8px 12px", borderRadius: 8,
                                    background: "#FEE2E2", color: "#B91C1C", fontSize: 12,
                                  }}>
                                    발송 실패 — SMTP 연결 오류 또는 수신자 목록이 비어있을 수 있습니다.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: UI.softText, textAlign: "right" }}>
              {filteredHistory.length}건 표시 중 · 페이지네이션은 API 연동 후 추가
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
