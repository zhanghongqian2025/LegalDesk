import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { Plus, Trash2, Save, FileText, X } from 'lucide-react';

export function TemplatePage() {
  const { templates, fetchTemplates, saveTemplate, deleteTemplate } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', content: '', variables: '', editingId: '' });

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSave = async () => {
    await saveTemplate(
      form.name,
      form.category || null,
      form.content,
      form.variables || null,
      form.editingId || undefined
    );
    setShowForm(false);
    setForm({ name: '', category: '', content: '', variables: '', editingId: '' });
  };

  const handleEdit = (t: typeof templates[0]) => {
    setForm({
      name: t.name,
      category: t.category || '',
      content: t.content,
      variables: t.variables || '',
      editingId: t.id
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定删除此模板吗？')) {
      await deleteTemplate(id);
    }
  };

  return (
    <div className="h-full flex flex-col p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">文书模板</h1>
          <p className="text-gray-500 mt-1">管理你的自定义法律文书模板</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm({ name: '', category: '', content: '', variables: '', editingId: '' }); }}
          className="btn btn-primary"
        >
          <Plus size={18} /> 新建模板
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">{form.editingId ? '编辑模板' : '新建模板'}</h3>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} />
            </button>
          </div>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">模板名称</label>
                <input
                  type="text"
                  placeholder="例如：民事起诉状"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">分类</label>
                <input
                  type="text"
                  placeholder="例如：起诉状、合同"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">变量（用逗号分隔）</label>
              <input
                type="text"
                placeholder="例如：原告,被告,案由,诉讼请求"
                value={form.variables}
                onChange={(e) => setForm({ ...form, variables: e.target.value })}
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">变量会在生成文书时提示用户填写</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">模板内容</label>
              <textarea
                placeholder="模板内容... 使用 {变量名} 表示需要替换的部分"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="input font-mono text-sm"
                rows={15}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="btn btn-primary">
                <Save size={18} /> 保存
              </button>
              <button onClick={() => setShowForm(false)} className="btn btn-secondary">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {templates.length === 0 ? (
          <div className="empty-state card p-12">
            <FileText size={64} />
            <p className="text-gray-500 text-lg mt-4">暂无模板</p>
            <p className="text-gray-400 text-sm mt-1">创建模板以快速生成法律文书</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((t) => (
              <div key={t.id} className="card p-5 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 cursor-pointer" onClick={() => handleEdit(t)}>
                    <h3 className="font-semibold text-lg text-gray-900">{t.name}</h3>
                    {t.category && <span className="text-sm text-gray-500">{t.category}</span>}
                  </div>
                  <button 
                    onClick={() => handleDelete(t.id)} 
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {t.variables && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {t.variables.split(',').map((v, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">
                        {v.trim()}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-400 line-clamp-3 font-mono bg-gray-50 p-3 rounded">
                  {t.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
