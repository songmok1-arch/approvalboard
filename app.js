// 승인보드 — Supabase 연동 공통 로직

const supabaseClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);

function genShareCode(len = 6) {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  return out;
}

async function createBoard(title) {
  const share_code = genShareCode();
  const { data, error } = await supabaseClient
    .from("apb_boards")
    .insert({ title, share_code })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function loadBoardByCode(code) {
  const { data, error } = await supabaseClient
    .from("apb_boards")
    .select("*")
    .eq("share_code", code)
    .single();
  if (error) throw error;
  return data;
}

async function loadFeedbackItems(boardId) {
  const { data, error } = await supabaseClient
    .from("apb_feedback_items")
    .select("*")
    .eq("board_id", boardId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

async function addFeedbackItem(boardId, { title, description }) {
  const { data, error } = await supabaseClient
    .from("apb_feedback_items")
    .insert({ board_id: boardId, title, description: description || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function updateFeedbackStatus(id, status) {
  const { error } = await supabaseClient.from("apb_feedback_items").update({ status }).eq("id", id);
  if (error) throw error;
}

async function deleteFeedbackItem(id) {
  const { error } = await supabaseClient.from("apb_feedback_items").delete().eq("id", id);
  if (error) throw error;
}

async function loadFeedbackComments(feedbackItemIds) {
  if (!feedbackItemIds.length) return [];
  const { data, error } = await supabaseClient
    .from("apb_feedback_comments")
    .select("*")
    .in("feedback_item_id", feedbackItemIds)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

async function addFeedbackComment(feedbackItemId, { author_name, comment }) {
  const { data, error } = await supabaseClient
    .from("apb_feedback_comments")
    .insert({ feedback_item_id: feedbackItemId, author_name, comment })
    .select()
    .single();
  if (error) throw error;
  return data;
}

function statusLabel(status) {
  return { pending: "대기중", approved: "승인됨", rejected: "반려됨" }[status] || status;
}
function nextStatus(status) {
  return { pending: "approved", approved: "rejected", rejected: "pending" }[status] || "pending";
}

function exportMarkdown(board, items) {
  const lines = [`# ${board.title} — 승인 요청 현황`, ""];
  items.forEach((f) => {
    lines.push(`- ${f.title} (${statusLabel(f.status)})`);
  });
  return lines.join("\n");
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch (e2) {
      document.body.removeChild(ta);
      return false;
    }
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// 최근 만든 보드 (이 브라우저에서만 기억됨 — 로그인/서버 없이 localStorage만 사용)
const RECENT_BOARDS_KEY = "apb_recent_boards";
const RECENT_BOARDS_MAX = 10;

function getRecentBoards() {
  try {
    const raw = localStorage.getItem(RECENT_BOARDS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveRecentBoard(title, share_code) {
  try {
    let list = getRecentBoards().filter((b) => b.share_code !== share_code);
    list.unshift({ title, share_code, created_at: Date.now() });
    list = list.slice(0, RECENT_BOARDS_MAX);
    localStorage.setItem(RECENT_BOARDS_KEY, JSON.stringify(list));
  } catch (e) {
    // localStorage를 못 쓰는 환경(시크릿 모드 등)이면 조용히 무시
  }
}

function removeRecentBoard(share_code) {
  try {
    const list = getRecentBoards().filter((b) => b.share_code !== share_code);
    localStorage.setItem(RECENT_BOARDS_KEY, JSON.stringify(list));
  } catch (e) {
    // localStorage를 못 쓰는 환경이면 조용히 무시
  }
}

function clearRecentBoards() {
  try {
    localStorage.removeItem(RECENT_BOARDS_KEY);
  } catch (e) {
    // localStorage를 못 쓰는 환경이면 조용히 무시
  }
}

function handleRemoveRecentBoard(share_code, containerId, cardId) {
  removeRecentBoard(share_code);
  renderRecentBoards(containerId, cardId);
}

function handleClearRecentBoards(containerId, cardId) {
  clearRecentBoards();
  renderRecentBoards(containerId, cardId);
}

function renderRecentBoards(containerId, cardId) {
  const list = getRecentBoards();
  const card = document.getElementById(cardId);
  const container = document.getElementById(containerId);
  if (!card || !container) return;
  if (list.length === 0) {
    card.style.display = "none";
    container.innerHTML = "";
    return;
  }
  const rows = list
    .map((b) => {
      const d = new Date(b.created_at);
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
      const code = encodeURIComponent(b.share_code);
      return `<div style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid var(--line);">
        <a href="board.html?b=${code}" style="font-size:0.92rem;">${escapeHtml(b.title)}</a>
        <span style="display:flex; align-items:center; gap:8px;">
          <span class="item-meta">${dateStr}</span>
          <button type="button" class="btn danger-text" style="padding:2px 6px;" onclick="handleRemoveRecentBoard('${b.share_code}', '${containerId}', '${cardId}')">목록에서 지우기</button>
        </span>
      </div>`;
    })
    .join("");
  const clearRow = `<div style="text-align:right; padding-top:8px;">
    <button type="button" class="btn ghost" onclick="handleClearRecentBoards('${containerId}', '${cardId}')">목록 모두 지우기</button>
  </div>`;
  container.innerHTML = rows + clearRow;
  card.style.display = "block";
}
