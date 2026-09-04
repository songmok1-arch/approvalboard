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
