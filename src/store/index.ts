import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { Case, CreateCaseInput, Document, LegalDocument, Evidence, Template } from '../types';

interface AppState {
  // 案件列表
  cases: Case[];
  selectedCaseId: string | null;
  loading: boolean;
  
  // 当前案件的文档
  documents: Document[];
  legalDocuments: LegalDocument[];
  evidence: Evidence[];
  
  // 模板
  templates: Template[];
  
  // AI 对话
  aiMessages: { role: 'user' | 'assistant'; content: string }[];
  
  // Actions
  fetchCases: () => Promise<void>;
  createCase: (input: CreateCaseInput) => Promise<Case>;
  updateCase: (id: string, input: CreateCaseInput) => Promise<Case>;
  deleteCase: (id: string) => Promise<void>;
  selectCase: (id: string | null) => void;
  
  fetchDocuments: (caseId: string) => Promise<void>;
  addDocument: (caseId: string, category: string, filename: string, filepath: string, fileType?: string, fileSize?: number) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  
  fetchLegalDocuments: (caseId: string) => Promise<void>;
  saveLegalDocument: (caseId: string, docType: string | null, title: string, content: string | null, id?: string) => Promise<LegalDocument>;
  deleteLegalDocument: (id: string) => Promise<void>;
  
  fetchEvidence: (caseId: string) => Promise<void>;
  addEvidence: (caseId: string, name: string, docId?: string, evidenceType?: string, authenticity?: string, legality?: string, relevance?: string, analysis?: string) => Promise<Evidence>;
  updateEvidence: (id: string, name: string, evidenceType?: string, authenticity?: string, legality?: string, relevance?: string, analysis?: string) => Promise<Evidence>;
  deleteEvidence: (id: string) => Promise<void>;
  
  fetchTemplates: () => Promise<void>;
  saveTemplate: (name: string, category: string | null, content: string, variables: string | null, id?: string) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
  
  // AI 对话
  addAiMessage: (role: 'user' | 'assistant', content: string) => void;
  clearAiMessages: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  cases: [],
  selectedCaseId: null,
  loading: false,
  documents: [],
  legalDocuments: [],
  evidence: [],
  templates: [],
  aiMessages: [],

  fetchCases: async () => {
    set({ loading: true });
    try {
      const cases = await invoke<Case[]>('get_cases');
      set({ cases, loading: false });
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      set({ loading: false });
    }
  },

  createCase: async (input: CreateCaseInput) => {
    const newCase = await invoke<Case>('create_case', { input });
    set((state) => ({ cases: [newCase, ...state.cases] }));
    return newCase;
  },

  updateCase: async (id: string, input: CreateCaseInput) => {
    const updated = await invoke<Case>('update_case', { id, input });
    set((state) => ({
      cases: state.cases.map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  deleteCase: async (id: string) => {
    await invoke('delete_case', { id });
    set((state) => ({
      cases: state.cases.filter((c) => c.id !== id),
      selectedCaseId: state.selectedCaseId === id ? null : state.selectedCaseId,
    }));
  },

  selectCase: (id: string | null) => {
    set({ selectedCaseId: id });
    if (id) {
      get().fetchDocuments(id);
      get().fetchLegalDocuments(id);
      get().fetchEvidence(id);
    } else {
      set({ documents: [], legalDocuments: [], evidence: [] });
    }
  },

  fetchDocuments: async (caseId: string) => {
    try {
      const documents = await invoke<Document[]>('get_documents', { caseId });
      set({ documents });
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  },

  addDocument: async (caseId: string, category: string, filename: string, filepath: string, fileType?: string, fileSize?: number) => {
    const doc = await invoke<Document>('add_document', {
      caseId, category, filename, filepath, fileType, fileSize,
    });
    set((state) => ({ documents: [doc, ...state.documents] }));
    return doc;
  },

  deleteDocument: async (id: string) => {
    await invoke('delete_document', { id });
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) }));
  },

  fetchLegalDocuments: async (caseId: string) => {
    try {
      const legalDocuments = await invoke<LegalDocument[]>('get_legal_documents', { caseId });
      set({ legalDocuments });
    } catch (error) {
      console.error('Failed to fetch legal documents:', error);
    }
  },

  saveLegalDocument: async (caseId: string, docType: string | null, title: string, content: string | null, id?: string) => {
    const doc = await invoke<LegalDocument>('save_legal_document', {
      caseId, docType, title, content, id: id || null,
    });
    const state = get();
    if (id) {
      set({ legalDocuments: state.legalDocuments.map((d) => (d.id === id ? doc : d)) });
    } else {
      set({ legalDocuments: [doc, ...state.legalDocuments] });
    }
    return doc;
  },

  deleteLegalDocument: async (id: string) => {
    await invoke('delete_legal_document', { id });
    set((state) => ({ legalDocuments: state.legalDocuments.filter((d) => d.id !== id) }));
  },

  fetchEvidence: async (caseId: string) => {
    try {
      const evidence = await invoke<Evidence[]>('get_evidence', { caseId });
      set({ evidence });
    } catch (error) {
      console.error('Failed to fetch evidence:', error);
    }
  },

  addEvidence: async (caseId: string, name: string, docId?: string, evidenceType?: string, authenticity?: string, legality?: string, relevance?: string, analysis?: string) => {
    const ev = await invoke<Evidence>('add_evidence', {
      caseId, evidenceName: name, docId: docId || null, evidenceType: evidenceType || null, authenticity: authenticity || null, legality: legality || null, relevance: relevance || null, analysis: analysis || null,
    });
    set((state) => ({ evidence: [ev, ...state.evidence] }));
    return ev;
  },

  updateEvidence: async (id: string, name: string, evidenceType?: string, authenticity?: string, legality?: string, relevance?: string, analysis?: string) => {
    const ev = await invoke<Evidence>('update_evidence', {
      id, evidenceName: name, evidenceType: evidenceType || null, authenticity: authenticity || null, legality: legality || null, relevance: relevance || null, analysis: analysis || null,
    });
    set((state) => ({
      evidence: state.evidence.map((e) => (e.id === id ? ev : e)),
    }));
    return ev;
  },

  deleteEvidence: async (id: string) => {
    await invoke('delete_evidence', { id });
    set((state) => ({ evidence: state.evidence.filter((e) => e.id !== id) }));
  },

  fetchTemplates: async () => {
    try {
      const templates = await invoke<Template[]>('get_templates');
      set({ templates });
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  },

  saveTemplate: async (name: string, category: string | null, content: string, variables: string | null, id?: string) => {
    const template = await invoke<Template>('save_template', {
      name, category, content, variables, id: id || null,
    });
    const state = get();
    if (id) {
      set({ templates: state.templates.map((t) => (t.id === id ? template : t)) });
    } else {
      set({ templates: [...state.templates, template] });
    }
    return template;
  },

  deleteTemplate: async (id: string) => {
    await invoke('delete_template', { id });
    set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
  },

  addAiMessage: (role: 'user' | 'assistant', content: string) => {
    set((state) => ({ aiMessages: [...state.aiMessages, { role, content }] }));
  },

  clearAiMessages: () => {
    set({ aiMessages: [] });
  },
}));
