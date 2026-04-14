// 类型定义

export interface Case {
  id: string;
  title: string;
  case_number?: string;
  case_type: string;
  status: string;
  court?: string;
  opposite_party?: string;
  handler?: string;
  filing_date?: string;
  court_date?: string;
  deadline?: string;
  description?: string;
  tags?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCaseInput {
  title: string;
  case_number?: string;
  case_type: string;
  status: string;
  court?: string;
  opposite_party?: string;
  handler?: string;
  filing_date?: string;
  court_date?: string;
  deadline?: string;
  description?: string;
  tags?: string;
}

export interface Document {
  id: string;
  case_id: string;
  category: string;
  filename: string;
  filepath: string;
  file_type?: string;
  file_size?: number;
  tags?: string;
  notes?: string;
  created_at: string;
}

export interface LegalDocument {
  id: string;
  case_id: string;
  doc_type?: string;
  title: string;
  content?: string;
  template_id?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  case_id: string;
  doc_id?: string;
  evidence_name: string;
  evidence_type?: string;
  authenticity?: string;
  legality?: string;
  relevance?: string;
  analysis?: string;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  category?: string;
  content: string;
  variables?: string;
  created_at: string;
  updated_at: string;
}

export type CaseType = 'civil' | 'criminal' | 'administrative' | 'arbitration' | 'non_litigation';
export type CaseStatus = 'pending' | 'in_progress' | 'closed' | 'archived';
export type DocumentCategory = 'evidence' | 'document' | 'record' | 'letter';
export type EvidenceType = 'physical' | 'documentary' | 'testimonial' | 'circumstantial';
export type EvidenceAuthenticity = 'verified' | 'unverified' | 'disputed';
export type EvidenceLegality = 'legal' | 'illegal' | 'questionable';
export type EvidenceRelevance = 'relevant' | 'irrelevant' | 'questionable';

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  civil: '民事',
  criminal: '刑事',
  administrative: '行政',
  arbitration: '仲裁',
  non_litigation: '非诉',
};

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  pending: '待处理',
  in_progress: '办理中',
  closed: '已结案',
  archived: '已归档',
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  evidence: '证据材料',
  document: '法律文书',
  record: '庭审记录',
  letter: '往来函件',
};

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  physical: '物证',
  documentary: '书证',
  testimonial: '证人证言',
  circumstantial: '间接证据',
};

export const EVIDENCE_AUTHENTICITY_LABELS: Record<EvidenceAuthenticity, string> = {
  verified: '已核实',
  unverified: '未核实',
  disputed: '有争议',
};

export const EVIDENCE_LEGALITY_LABELS: Record<EvidenceLegality, string> = {
  legal: '合法',
  illegal: '非法',
  questionable: '存疑',
};

export const EVIDENCE_RELEVANCE_LABELS: Record<EvidenceRelevance, string> = {
  relevant: '有关联',
  irrelevant: '无关联',
  questionable: '存疑',
};
