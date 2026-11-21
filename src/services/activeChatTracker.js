let currentActiveConversationId = null;

export const setActiveConversation = (id) => {
  currentActiveConversationId = id;
};

export const getActiveConversation = () => currentActiveConversationId;
