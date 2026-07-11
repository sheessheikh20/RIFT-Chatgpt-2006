import { create } from 'zustand';
import type {
  Conversation,
  ConversationFolder,
  Message,
  MessageSendRequest,
  MessageSendResponse,
  KnowledgePackMissingError,
} from '../types';
import * as api from '../api';

interface SendMessageResult {
  response: MessageSendResponse;
  knowledgePackError?: never;
}

interface SendMessageKnowledgeError {
  response?: never;
  knowledgePackError: KnowledgePackMissingError;
}

export type SendMessageOutcome = SendMessageResult | SendMessageKnowledgeError;

interface ConversationStore {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isSending: boolean;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  error: string | null;

  // Actions
  loadConversations: (folder?: ConversationFolder, search?: string) => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  createConversation: (title: string, folder?: ConversationFolder) => Promise<Conversation>;
  updateConversation: (id: string, updates: { title?: string; folder?: ConversationFolder }) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (request: MessageSendRequest) => Promise<SendMessageOutcome>;
  clearMessages: () => void;
  clearError: () => void;
  setActiveConversationId: (id: string | null) => void;
}

export const useConversationStore = create<ConversationStore>()((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isSending: false,
  isLoadingConversations: false,
  isLoadingMessages: false,
  error: null,

  loadConversations: async (folder?, search?) => {
    set({ isLoadingConversations: true, error: null });
    try {
      const conversations = await api.fetchConversations(folder, search);
      set({ conversations, isLoadingConversations: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load conversations';
      set({ error: msg, isLoadingConversations: false });
    }
  },

  selectConversation: async (id: string) => {
    set({ activeConversationId: id, isLoadingMessages: true, messages: [] });
    try {
      const messages = await api.fetchMessages(id);
      set({ messages, isLoadingMessages: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load messages';
      set({ error: msg, isLoadingMessages: false });
    }
  },

  createConversation: async (title, folder = 'Inbox') => {
    const conv = await api.createConversation(title, folder);
    set(state => ({ conversations: [conv, ...state.conversations] }));
    return conv;
  },

  updateConversation: async (id, updates) => {
    const updated = await api.updateConversation(id, updates);
    set(state => ({
      conversations: state.conversations.map(c => (c.id === id ? updated : c)),
    }));
  },

  deleteConversation: async (id) => {
    await api.deleteConversation(id);
    set(state => ({
      conversations: state.conversations.filter(c => c.id !== id),
      activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
      messages: state.activeConversationId === id ? [] : state.messages,
    }));
  },

  sendMessage: async (request: MessageSendRequest): Promise<SendMessageOutcome> => {
    const { activeConversationId } = get();
    if (!activeConversationId) {
      throw new Error('No active conversation selected');
    }

    // Optimistically append the user message
    const optimisticUserMsg: Message = {
      id: `optimistic-${Date.now()}`,
      role: 'user',
      content: request.content,
      assistantProfile: null,
      createdAt: new Date().toISOString(),
    };
    set(state => ({
      messages: [...state.messages, optimisticUserMsg],
      isSending: true,
      error: null,
    }));

    try {
      const response = await api.sendMessage(activeConversationId, request);

      // Append the real assistant message
      const assistantMsg: Message = {
        id: response.id,
        role: 'assistant',
        content: response.content,
        assistantProfile: request.assistantProfile,
        createdAt: response.createdAt,
      };

      set(state => ({
        // Replace optimistic user msg with real messages from server
        messages: [
          ...state.messages.filter(m => m.id !== optimisticUserMsg.id),
          { ...optimisticUserMsg, id: `user-${response.id}` },
          assistantMsg,
        ],
        isSending: false,
      }));

      // Refresh conversation list to update timestamps
      get().loadConversations();

      return { response };
    } catch (err: unknown) {
      // Remove optimistic message on error
      set(state => ({
        messages: state.messages.filter(m => m.id !== optimisticUserMsg.id),
        isSending: false,
      }));

      // Check for 428 KNOWLEDGE_PACK_MISSING
      if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 428) {
        return { knowledgePackError: err as unknown as KnowledgePackMissingError };
      }

      const msg = err instanceof Error ? err.message : 'Failed to send message';
      set({ error: msg });
      throw err;
    }
  },

  clearMessages: () => set({ messages: [], activeConversationId: null }),
  clearError: () => set({ error: null }),
  setActiveConversationId: (id) => set({ activeConversationId: id }),
}));
