import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { DOCUMENT_CATEGORY_LABELS, type CreateCaseInput } from '../types';
import { ArrowLeft, FileText, FolderOpen, Scale, Plus, Trash2, Save, Edit, Send, X, Upload } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

type TabType = 'documents' | 'legal' | 'evidence' | 'ai';

export function CaseDetail() {
  const {
    cases, selectedCaseId, documents, legalDocuments, evidence,
    selectCase, updateCase, addDocument, deleteDocument,
    saveLegalDocument, deleteLegalDocument,
    addEvidence, deleteEvidence,
    addAiMessage, aiMessages, clearAiMessages,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabType>('documents');
  const [editingCase, setEditingCase] = useState(false);
  const [caseForm, setCaseForm] = useState<CreateCaseInput>({
    title: '',
    case_number: '',
    case_type: 'civil',
    status: 'pending',
    court: '',
    opposite_party: '',
    handler: '',
    filing_date: '',
    court_date: '',
    deadline: '',
    description: '',
    tags: '',
  });

  const [showDocForm, setShowDocForm] = useState(false);
  const [docForm, setDocForm] = useState({ title: '', docType: '', content: '' });
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [evidenceForm, setEvidenceForm] = useState({
    name: '', evidenceType: '', authenticity: '', legality: '', relevance: '', analysis: ''
  });

  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  useEffect(() => {
    if (selectedCase) {
      setCaseForm({
        title: selectedCase.title,
        case_number: selectedCase.case_number || '',
        case_type: selectedCase.case_type,
        status: selectedCase.status,
        court: selectedCase.court || '',
        opposite_party: selectedCase.opposite_party || '',
        handler: selectedCase.handler || '',
        filing_date: selectedCase.filing_date || '',
        court_date: selectedCase.court_date || '',
        deadline: selectedCase.deadline || '',
        description: selectedCase.description || '',
        tags: selectedCase.tags || '',
      });
    }
  }, [selectedCase]);

  const handleSaveCase = async () => {
    if (selectedCaseId) {
      await updateCase(selectedCaseId, caseForm);
      setEditingCase(false);
    }
  };

  const handleAddFile = async () => {
    if (!selectedCaseId) return;
    
    const file = await open({
      multiple: true,
      filters: [{ name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'] }]
    });

    if (file) {
      const files = Array.isArray(file) ? file : [file];
      for (const f of files) {
        const filename = f.split(/[/\\]/).pop() || 'unknown';
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        await addDocument(selectedCaseId, 'evidence', filename, f, ext, 0);
      }
    }
  };

  const handleSaveDoc = async () => {
    if (!selectedCaseId) return;
    await saveLegalDocument(selectedCaseId, docForm.docType || null, docForm.title, docForm.content, editingDocId || undefined);
    setShowDocForm(false);
    setDocForm({ title: '', docType: '', content: '' });
    setEditingDocId(null);
  };

  const handleEditDoc = (doc: typeof legalDocuments[0]) => {
    setDocForm({ title: doc.title, docType: doc.doc_type || '', content: doc.content || '' });
    setEditingDocId(doc.id);
    setShowDocForm(true);
  };

  const handleSaveEvidence = async () => {
    if (!selectedCaseId) return;
    await addEvidence(
      selectedCaseId,
      evidenceForm.name,
      undefined,
      evidenceForm.evidenceType || undefined,
      evidenceForm.authenticity || undefined,
      evidenceForm.legality || undefined,
      evidenceForm.relevance || undefined,
      evidenceForm.analysis || undefined
    );
    setShowEvidenceForm(false);
    setEvidenceForm({ name: '', evidenceType: '', authenticity: '', legality: '', relevance: '', analysis: '' });
  };

  const handleAiSubmit = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg = aiInput;
    addAiMessage('user', userMsg);
    setAiInput('');
    setAiLoading(true);

    const caseInfo = selectedCase ? `${selectedCase.title}${selectedCase.case_number ? `（${selectedCase.case_number}）` : ''}` : '';
    const docInfo = legalDocuments.length > 0 ? `\n📄 法律文书：${legalDocuments.length}份` : '';
    const evidenceInfo = evidence.length > 0 ? `\n🔍 证据材料：${evidence.length}份` : '';

    try {
      await invoke<string>('get_app_data_dir');
      addAiMessage('assistant', `收到你的问题：${userMsg}\n\n当前案件：${caseInfo}${docInfo}${evidenceInfo}\n\n我可以帮你：\n📝 起草法律文书\n🔍 分析证据三性\n⚖️ 法律咨询\n\n请告诉我具体需求？`);
    } catch {
      addAiMessage('assistant', `收到你的问题：${userMsg}\n\n请问有什么可以帮助你的？`);
    }
    setAiLoading(false);
  };

  if (!selectedCase) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">请选择一个案件</p>
      </div>
    );
  }

  const tabs = [
    { id: 'documents', label: '卷宗材料', count: documents.length },
    { id: 'legal', label: '法律文书', count: legalDocuments.length },
    { id: 'evidence', label: '证据审核', count: evidence.length },
    { id: 'ai', label: 'AI 助手' },
  ];

  return (
    <div className="h-full flex flex-col bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => selectCase(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex-1">
              {editingCase ? (
                <input
                  type="text"
                  value={caseForm.title}
                  onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}
                  className="text-xl font-semibold w-full border-b-2 border-blue-500 focus:outline-none pb-1"
                />
              ) : (
                <h1 className="text-xl font-semibold text-gray-900">{selectedCase.title}</h1>
              )}
              {selectedCase.case_number && (
                <p className="text-gray-500 text-sm mt-1">{selectedCase.case_number}</p>
              )}
            </div>

            {editingCase ? (
              <button onClick={handleSaveCase} className="btn btn-primary">
                <Save size={18} /> 保存
              </button>
            ) : (
              <button onClick={() => setEditingCase(true)} className="btn btn-secondary">
                <Edit size={18} /> 编辑
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        
        {/* Documents tab */}
        {activeTab === 'documents' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">卷宗材料</h2>
                <p className="text-gray-500 text-sm mt-1">管理案件相关的文件材料</p>
              </div>
              <button onClick={handleAddFile} className="btn btn-primary">
                <Upload size={18} /> 上传文件
              </button>
            </div>
            
            {documents.length === 0 ? (
              <div className="empty-state card p-12">
                <FolderOpen size={56} />
                <p className="text-gray-500 text-lg mt-4">暂无卷宗材料</p>
                <p className="text-gray-400 text-sm mt-1">点击"上传文件"添加案件材料</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText size={20} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{doc.filename}</p>
                      <p className="text-sm text-gray-500">{DOCUMENT_CATEGORY_LABELS[doc.category as keyof typeof DOCUMENT_CATEGORY_LABELS]}</p>
                    </div>
                    <button onClick={() => deleteDocument(doc.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Legal documents tab */}
        {activeTab === 'legal' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">法律文书</h2>
                <p className="text-gray-500 text-sm mt-1">创建和管理案件相关法律文书</p>
              </div>
              <button onClick={() => { setShowDocForm(true); setEditingDocId(null); setDocForm({ title: '', docType: '', content: '' }); }} className="btn btn-primary">
                <Plus size={18} /> 新建文书
              </button>
            </div>

            {showDocForm && (
              <div className="card p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">{editingDocId ? '编辑文书' : '新建文书'}</h3>
                  <button onClick={() => { setShowDocForm(false); setEditingDocId(null); }} className="p-1 hover:bg-gray-100 rounded">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="文书标题"
                      value={docForm.title}
                      onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="文书类型（如：起诉状、答辩状）"
                      value={docForm.docType}
                      onChange={(e) => setDocForm({ ...docForm, docType: e.target.value })}
                      className="input"
                    />
                  </div>
                  <textarea
                    placeholder="文书内容..."
                    value={docForm.content}
                    onChange={(e) => setDocForm({ ...docForm, content: e.target.value })}
                    className="input font-mono text-sm"
                    rows={12}
                  />
                  <div className="flex gap-3">
                    <button onClick={handleSaveDoc} className="btn btn-primary">
                      <Save size={18} /> 保存
                    </button>
                    <button onClick={() => { setShowDocForm(false); setEditingDocId(null); }} className="btn btn-secondary">
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {legalDocuments.length === 0 ? (
              <div className="empty-state card p-12">
                <FileText size={56} />
                <p className="text-gray-500 text-lg mt-4">暂无法律文书</p>
                <p className="text-gray-400 text-sm mt-1">点击"新建文书"开始创建</p>
              </div>
            ) : (
              <div className="space-y-2">
                {legalDocuments.map((doc) => (
                  <div key={doc.id} className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <FileText size={20} className="text-green-600" />
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => handleEditDoc(doc)}>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-sm text-gray-500">{doc.doc_type || '未分类'} · v{doc.version}</p>
                    </div>
                    <button onClick={() => deleteLegalDocument(doc.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Evidence tab */}
        {activeTab === 'evidence' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">证据管理</h2>
                <p className="text-gray-500 text-sm mt-1">管理证据材料并分析证据三性</p>
              </div>
              <button onClick={() => setShowEvidenceForm(true)} className="btn btn-primary">
                <Plus size={18} /> 添加证据
              </button>
            </div>

            {showEvidenceForm && (
              <div className="card p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">添加证据</h3>
                  <button onClick={() => setShowEvidenceForm(false)} className="p-1 hover:bg-gray-100 rounded">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">证据名称</label>
                    <input
                      type="text"
                      placeholder="例如：合同原件、转账记录"
                      value={evidenceForm.name}
                      onChange={(e) => setEvidenceForm({ ...evidenceForm, name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">证据类型</label>
                    <select
                      value={evidenceForm.evidenceType}
                      onChange={(e) => setEvidenceForm({ ...evidenceForm, evidenceType: e.target.value })}
                      className="input"
                    >
                      <option value="">选择类型</option>
                      <option value="physical">物证</option>
                      <option value="documentary">书证</option>
                      <option value="testimonial">证人证言</option>
                      <option value="circumstantial">间接证据</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">真实性</label>
                    <select
                      value={evidenceForm.authenticity}
                      onChange={(e) => setEvidenceForm({ ...evidenceForm, authenticity: e.target.value })}
                      className="input"
                    >
                      <option value="">选择状态</option>
                      <option value="verified">已核实</option>
                      <option value="unverified">未核实</option>
                      <option value="disputed">有争议</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">合法性</label>
                    <select
                      value={evidenceForm.legality}
                      onChange={(e) => setEvidenceForm({ ...evidenceForm, legality: e.target.value })}
                      className="input"
                    >
                      <option value="">选择状态</option>
                      <option value="legal">合法</option>
                      <option value="illegal">非法</option>
                      <option value="questionable">存疑</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">关联性</label>
                    <select
                      value={evidenceForm.relevance}
                      onChange={(e) => setEvidenceForm({ ...evidenceForm, relevance: e.target.value })}
                      className="input"
                    >
                      <option value="">选择状态</option>
                      <option value="relevant">有关联</option>
                      <option value="irrelevant">无关联</option>
                      <option value="questionable">存疑</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">证据分析</label>
                    <textarea
                      placeholder="输入证据分析内容..."
                      value={evidenceForm.analysis}
                      onChange={(e) => setEvidenceForm({ ...evidenceForm, analysis: e.target.value })}
                      className="input"
                      rows={2}
                    />
                  </div>
                  <div className="col-span-2 flex gap-3">
                    <button onClick={handleSaveEvidence} className="btn btn-primary">保存</button>
                    <button onClick={() => setShowEvidenceForm(false)} className="btn btn-secondary">取消</button>
                  </div>
                </div>
              </div>
            )}

            {evidence.length === 0 ? (
              <div className="empty-state card p-12">
                <Scale size={56} />
                <p className="text-gray-500 text-lg mt-4">暂无证据</p>
                <p className="text-gray-400 text-sm mt-1">点击"添加证据"开始管理</p>
              </div>
            ) : (
              <div className="space-y-4">
                {evidence.map((ev) => (
                  <div key={ev.id} className="card p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{ev.evidence_name}</h3>
                      <button onClick={() => deleteEvidence(ev.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {ev.evidence_type && <span className="badge badge-gray">{ev.evidence_type}</span>}
                      {ev.authenticity && (
                        <span className={`badge ${
                          ev.authenticity === 'verified' ? 'evidence-verified' :
                          ev.authenticity === 'disputed' ? 'evidence-disputed' : 'evidence-unverified'
                        }`}>真实性：{ev.authenticity === 'verified' ? '已核实' : ev.authenticity === 'disputed' ? '有争议' : '未核实'}</span>
                      )}
                      {ev.legality && (
                        <span className={`badge ${
                          ev.legality === 'legal' ? 'evidence-legal' :
                          ev.legality === 'illegal' ? 'evidence-illegal' : 'evidence-questionable'
                        }`}>合法性：{ev.legality === 'legal' ? '合法' : ev.legality === 'illegal' ? '非法' : '存疑'}</span>
                      )}
                      {ev.relevance && (
                        <span className={`badge ${
                          ev.relevance === 'relevant' ? 'evidence-relevant' :
                          ev.relevance === 'irrelevant' ? 'evidence-irrelevant' : 'evidence-questionable'
                        }`}>关联性：{ev.relevance === 'relevant' ? '有关联' : ev.relevance === 'irrelevant' ? '无关联' : '存疑'}</span>
                      )}
                    </div>
                    {ev.analysis && <p className="text-sm text-gray-600">{ev.analysis}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI tab */}
        {activeTab === 'ai' && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold">AI 助手</h2>
                <p className="text-gray-500 text-sm mt-1">智能辅助法律工作</p>
              </div>
              <button onClick={clearAiMessages} className="text-sm text-gray-500 hover:text-gray-700">清空对话</button>
            </div>
            
            <div className="flex-1 overflow-auto card p-4 mb-4 bg-white">
              {aiMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                    <Edit size={32} className="text-blue-500" />
                  </div>
                  <p className="text-gray-600 text-lg mb-2">法律 AI 助手</p>
                  <p className="text-gray-400 text-sm max-w-md">我可以帮你起草法律文书、分析证据三性、整理卷宗材料、解答法律问题</p>
                  <div className="grid grid-cols-2 gap-4 mt-6 text-left text-sm text-gray-500">
                    <div className="flex items-center gap-2">📝 起草法律文书</div>
                    <div className="flex items-center gap-2">🔍 分析证据三性</div>
                    <div className="flex items-center gap-2">📁 整理卷宗材料</div>
                    <div className="flex items-center gap-2">⚖️ 法律咨询解答</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={msg.role === 'user' ? 'chat-user' : 'chat-assistant'}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="chat-assistant">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAiSubmit()}
                placeholder="输入你的问题或需求..."
                className="input flex-1"
              />
              <button 
                onClick={handleAiSubmit} 
                disabled={aiLoading || !aiInput.trim()}
                className="btn btn-primary px-6"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
