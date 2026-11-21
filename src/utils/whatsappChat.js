// Constants + formatters for WhatsApp Live Chat.
// Centralised so screens/components contain no magic values.

export const CHAT_POLL_INTERVAL = {
  CONVERSATIONS: 8000,
  MESSAGES: 3000,
};

export const CHAT_PAGE_SIZE = {
  CONVERSATIONS: 50,
  MESSAGES: 100,
};

// Mirrors the tabs in the Dashboard's ConversationList.
export const CHAT_TABS = [
  { id: "ALL", label: "All" },
  { id: "MINE", label: "Mine" },
  { id: "UNASSIGNED", label: "New" },
  { id: "RESOLVED", label: "Resolved" },
];

// Mirrors the <select> in the Dashboard's ChatCanvas header.
export const CHAT_STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "PENDING", label: "Pending Customer" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export const CURRENCY_SYMBOL = "₹";

// WhatsApp-style colours that are intentionally NOT theme-driven
// (bubbles must stay light so the fixed dark bubble text stays readable).
export const CHAT_COLORS = {
  outboundBubble: "#dcf8c6",
  inboundBubble: "#ffffff",
  bubbleText: "#111827",
  bubbleMeta: "#6b7280",
  read: "#2563eb",
  windowOpenBg: "#dcfce7",
  windowOpenText: "#166534",
  windowClosedBg: "#fee2e2",
  windowClosedText: "#991b1b",
  badgeNeutralBg: "#f3f4f6",
  badgeNeutralText: "#4b5563",
  badgeAssignedBg: "#e0e7ff",
  badgeAssignedText: "#3730a3",
  badgeWarnBg: "#fef3c7",
  badgeWarnText: "#92400e",
  link: "#2563eb",
  noteAccent: "#10b981",
};

/** Builds query variables for the conversation list; omits empty params. */
export const buildConversationVariables = (activeTab, searchQuery) => {
  const variables = { first: CHAT_PAGE_SIZE.CONVERSATIONS };
  if (activeTab === "MINE") variables.assignedToMe = true;
  else if (activeTab === "UNASSIGNED") variables.status = "UNASSIGNED";
  else if (activeTab === "RESOLVED") variables.status = "RESOLVED";

  const trimmed = searchQuery?.trim();
  if (trimmed) variables.search = trimmed;
  return variables;
};

export const formatTime = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const formatDate = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatMoney = (amount) =>
  `${CURRENCY_SYMBOL} ${Number(amount || 0).toFixed(2)}`;

export const getStaffName = (staff) => staff?.firstName || staff?.email || "Staff";

/** Replaces {{customer_name}} placeholders in a canned response. */
export const applyCannedPlaceholders = (text, conversation) => {
  const name =
    conversation?.customerName ||
    conversation?.customer?.firstName ||
    "Customer";
  return (text || "").replace(/{{customer_name}}/gi, name);
};

export const getDeliveryTick = (status) => {
  switch (status) {
    case "read":
    case "delivered":
      return "✓✓";
    case "sent":
      return "✓";
    case "failed":
      return "⚠️";
    default:
      return "⏳";
  }
};
