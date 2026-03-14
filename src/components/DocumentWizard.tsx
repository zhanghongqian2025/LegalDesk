import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { DEFAULT_TEMPLATES } from '../data/templates';
import { FileText, X, ChevronRight, Sparkles, Save, ArrowLeft } from 'lucide-react';

interface DocumentWizardProps {
  caseId: string;
  onClose: () => void;
  onSaved: () => void;
}

export function DocumentWizard({ caseId, onClose, onSaved }: DocumentWizardProps) {
  const { templates, fetchTemplates, saveLegalDocument } = useAppStore();
  const [step, setStep] = useState<'select' | 'fill' | 'preview'>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof DEFAULT_TEMPLATES[0] | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [docTitle, setDocTitle] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleSelectTemplate = (template: typeof DEFAULT_TEMPLATES[0] | typeof templates[0]) => {
    setSelectedTemplate(template as any);
    setDocTitle(template.name);
    
    // 初始化变量
    const vars: Record<string, string> = {};
    const varList = template.variables?.split(',').map(v => v.trim()) || [];
    varList.forEach(v => {
      vars[v] = '';
    });
    setVariables(vars);
    setStep('fill');
  };

  const handleGenerate = () => {
    if (!selectedTemplate) return;
    
    let content = selectedTemplate.content;
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value || `【${key}】`);
    });
    setGeneratedContent(content);
    setStep('preview');
  };

  const handleSave = async () => {
    await saveLegalDocument(
      caseId,
      selectedTemplate?.category || '诉讼文书',
      docTitle,
      generatedContent
    );
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            {step !== 'select' && (
              <button onClick={() => setStep(step === 'preview' ? 'fill' : 'select')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {step === 'select' ? '选择文书模板' : step === 'fill' ? '填写文书内容' : '预览文书'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {step === 'select' ? '选择一个模板开始创建法律文书' : 
                 step === 'fill' ? '填写模板中的变量内容' : '确认文书内容后保存'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Step 1: Select Template */}
          {step === 'select' && (
            <div className="space-y-6">
              {/* 默认模板 */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-500" />
                  常用诉讼文书
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {DEFAULT_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="card p-4 text-left hover:border-blue-500 border-2 border-transparent transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText size={20} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-gray-500">{template.category}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 自定义模板 */}
              {templates.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">我的模板</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectTemplate(template)}
                        className="card p-4 text-left hover:border-blue-500 border-2 border-transparent transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <FileText size={20} className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-gray-500">{template.category || '自定义'}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Fill Variables */}
          {step === 'fill' && selectedTemplate && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">文书标题</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="input"
                  placeholder="输入文书标题"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Object.keys(variables).map((key) => (
                  <div key={key} className={Object.keys(variables).length <= 6 ? 'col-span-1' : ''}>
                    <label className="block text-sm font-medium mb-2">{key}</label>
                    <textarea
                      value={variables[key]}
                      onChange={(e) => setVariables({ ...variables, [key]: e.target.value })}
                      className="input"
                      rows={2}
                      placeholder={`请输入${key}`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={handleGenerate} className="btn btn-primary">
                  生成文书 <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FileText size={16} />
                <span>{docTitle}</span>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {generatedContent}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'preview' && (
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button onClick={() => setStep('fill')} className="btn btn-secondary">
              返回修改
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              <Save size={18} /> 保存文书
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
