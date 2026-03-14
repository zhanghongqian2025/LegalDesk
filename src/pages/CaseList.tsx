import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { CASE_TYPE_LABELS, CASE_STATUS_LABELS, type CreateCaseInput } from '../types';
import { Plus, Search, FolderOpen, Trash2, FileText, Clock, Building, ChevronRight } from 'lucide-react';

export function CaseList() {
  const { cases, loading, fetchCases, createCase, deleteCase, selectCase } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState<CreateCaseInput>({
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

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const filteredCases = cases.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.case_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = !filterType || c.case_type === filterType;
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCase(formData);
    setShowForm(false);
    setFormData({
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
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定删除此案件吗？此操作不可恢复。')) {
      await deleteCase(id);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-yellow';
      case 'in_progress': return 'badge-blue';
      case 'closed': return 'badge-green';
      case 'archived': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'in_progress': return '办理中';
      case 'closed': return '已结案';
      case 'archived': return '已归档';
      default: return status;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">案件管理</h1>
            <p className="text-gray-500 mt-1">管理所有法律案件</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            <Plus size={18} />
            新建案件
          </button>
        </div>

        {/* Search and filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索案件名称或案号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-11"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input w-36"
          >
            <option value="">全部类型</option>
            {Object.entries(CASE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-32"
          >
            <option value="">全部状态</option>
            {Object.entries(CASE_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* New case form */}
      {showForm && (
        <div className="px-6 pb-6">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">新建案件</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">案件名称 *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    placeholder="例如：张某诉李某合同纠纷"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">案号</label>
                  <input
                    type="text"
                    value={formData.case_number || ''}
                    onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                    className="input"
                    placeholder="例如：(2024) 民初字第1234号"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">案件类型 *</label>
                  <select
                    value={formData.case_type}
                    onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
                    className="input"
                  >
                    {Object.entries(CASE_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">案件状态 *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input"
                  >
                    {Object.entries(CASE_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">法院</label>
                  <input
                    type="text"
                    value={formData.court || ''}
                    onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                    className="input"
                    placeholder="例如：北京市朝阳区人民法院"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">对方当事人</label>
                  <input
                    type="text"
                    value={formData.opposite_party || ''}
                    onChange={(e) => setFormData({ ...formData, opposite_party: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">立案日期</label>
                  <input
                    type="date"
                    value={formData.filing_date || ''}
                    onChange={(e) => setFormData({ ...formData, filing_date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">开庭日期</label>
                  <input
                    type="date"
                    value={formData.court_date || ''}
                    onChange={(e) => setFormData({ ...formData, court_date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">法务/律师</label>
                  <input
                    type="text"
                    value={formData.handler || ''}
                    onChange={(e) => setFormData({ ...formData, handler: e.target.value })}
                    className="input"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium mb-2 text-gray-700">案件描述</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={2}
                    placeholder="简要描述案件情况..."
                  />
                </div>
                <div className="col-span-3 flex gap-3">
                  <button type="submit" className="btn btn-primary">创建案件</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">取消</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cases list */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-3">加载中...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={56} />
            <p className="text-gray-500 text-lg mt-4">暂无案件</p>
            <p className="text-gray-400 text-sm mt-1">点击"新建案件"开始创建</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCases.map((c) => (
              <div
                key={c.id}
                onClick={() => selectCase(c.id)}
                className="case-card flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={24} className="text-blue-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{c.title}</h3>
                    <span className={`badge ${getStatusClass(c.status)}`}>
                      {getStatusLabel(c.status)}
                    </span>
                    <span className="badge badge-blue">
                      {CASE_TYPE_LABELS[c.case_type as keyof typeof CASE_TYPE_LABELS]}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {c.case_number && (
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {c.case_number}
                      </span>
                    )}
                    {c.court && (
                      <span className="flex items-center gap-1">
                        <Building size={14} />
                        {c.court}
                      </span>
                    )}
                    {c.court_date && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {c.court_date}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(e, c.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                
                <ChevronRight size={20} className="text-gray-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
