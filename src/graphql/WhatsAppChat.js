import { gql } from "@apollo/client";

// Copied 1:1 from Saleor Dashboard: src/whatsappChat/chatQueries.ts + chatMutations.ts
// Kept in its own file so the existing graphql/Query.js and Mutation.js are untouched.
// Intentionally omitted (defined in the Dashboard but never used by its UI):
//   GET_WHATSAPP_CHAT_STATS, CREATE_CANNED_RESPONSE, DELETE_CANNED_RESPONSE

export const GET_WHATSAPP_CONVERSATIONS = gql`
  query GetWhatsAppConversations(
    $status: ConversationStatus
    $assignedToMe: Boolean
    $search: String
    $first: Int
  ) {
    whatsAppConversations(
      status: $status
      assignedToMe: $assignedToMe
      search: $search
      first: $first
    ) {
      id
      rawId
      customerPhone
      customerName
      status
      unreadCount
      isWindowOpen
      windowExpiresAt
      lastInboundAt
      lastMessageAt
      assignedStaff {
        id
        email
        firstName
        lastName
      }
      lastMessage {
        id
        content
        direction
        messageType
        status
        createdAt
        isAutomated
      }
    }
  }
`;

export const GET_WHATSAPP_CONVERSATION_DETAIL = gql`
  query GetWhatsAppConversationDetail($id: ID!) {
    whatsAppConversation(id: $id) {
      id
      rawId
      customerPhone
      customerName
      status
      unreadCount
      isWindowOpen
      windowExpiresAt
      lastInboundAt
      lastMessageAt
      channelSlug
      createdAt
      assignedStaff {
        id
        email
        firstName
        lastName
      }
      customer {
        id
        email
        firstName
        lastName
        dateJoined
        defaultShippingAddress {
          streetAddress1
          city
          postalCode
        }
      }
      notes {
        id
        author {
          id
          firstName
          email
        }
        note
        createdAt
      }
    }
  }
`;

export const GET_WHATSAPP_MESSAGES = gql`
  query GetWhatsAppMessages($conversationId: ID!, $first: Int) {
    whatsAppMessages(conversationId: $conversationId, first: $first) {
      id
      rawId
      metaMessageId
      direction
      messageType
      content
      mediaUrl
      mediaContentType
      isAutomated
      status
      errorCode
      errorMessage
      createdAt
      senderStaff {
        id
        firstName
        email
      }
    }
  }
`;

export const GET_WHATSAPP_CANNED_RESPONSES = gql`
  query GetWhatsAppCannedResponses {
    whatsAppCannedResponses {
      id
      shortcut
      title
      messageContent
      category
      isActive
      order
    }
  }
`;

// export const GET_WHATSAPP_TEMPLATES = gql`
//   query GetWhatsAppTemplates {
//     whatsAppTemplates {
//       name
//       displayName
//       category
//       languageCode
//     }
//   }
// `;
export const GET_WHATSAPP_TEMPLATES = gql`
  query GetWhatsAppTemplates {
    whatsappTemplates(isActive: true) {
      name
      displayName
      category
      languageCode
      status
    }
  }
`;

export const SEND_WHATSAPP_MESSAGE = gql`
  mutation SendWhatsAppMessage($input: SendWhatsAppMessageInput!) {
    whatsAppSendMessage(input: $input) {
      message {
        id
        rawId
        metaMessageId
        direction
        messageType
        content
        mediaUrl
        status
        createdAt
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const SEND_WHATSAPP_TEMPLATE_MESSAGE = gql`
  mutation SendWhatsAppTemplateMessage($input: SendWhatsAppTemplateInput!) {
    whatsAppSendTemplateMessage(input: $input) {
      message {
        id
        rawId
        metaMessageId
        direction
        messageType
        content
        status
        createdAt
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const UPDATE_WHATSAPP_CONVERSATION = gql`
  mutation UpdateWhatsAppConversation(
    $id: ID!
    $input: WhatsAppConversationUpdateInput!
  ) {
    whatsAppConversationUpdate(id: $id, input: $input) {
      conversation {
        id
        status
        assignedStaff {
          id
          firstName
          email
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;

export const MARK_WHATSAPP_CONVERSATION_READ = gql`
  mutation MarkWhatsAppConversationRead($id: ID!) {
    whatsAppConversationMarkRead(id: $id) {
      success
      errors {
        field
        message
        code
      }
    }
  }
`;

export const ADD_WHATSAPP_INTERNAL_NOTE = gql`
  mutation AddWhatsAppInternalNote($conversationId: ID!, $note: String!) {
    whatsAppAddInternalNote(conversationId: $conversationId, note: $note) {
      note {
        id
        note
        createdAt
        author {
          id
          firstName
          email
        }
      }
      errors {
        field
        message
        code
      }
    }
  }
`;
