import { useState, useEffect } from 'react';
import { useAppStore } from './store';
import { CaseList } from './pages/CaseList';
import { CaseDetail } from './pages/CaseDetail';
import { TemplatePage } from './pages/TemplatePage';
import { Dashboard } from './pages/Dashboard';
import { Scale, Briefcase, FileText, Settings, Upload, X, File, ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';

type Page = 'dashboard' | 'upload' | 'cases' | 'templates' | 'settings';

interface UploadedFile {
  name: string;
  path: string;
  size: number;
  type: string;
}

interface CaseSuggestion {
  title: string;
  caseType: string;
  court: string;
  oppositeParty: string;
  description: string;
}

interface AiConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { selectedCaseId, fetchCases, createCase } = useAppStore();
  
  // Upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<CaseSuggestion | null>(null);
  
  // AI Settings
  const [aiConfig, setAiConfig] = useState<AiConfig>({
    apiKey: localStorage.getItem('ai_api_key') || '',
    apiUrl: localStorage.getItem('ai_api_url') || 'https://api.openai.com/v1',
    model: localStorage.getItem('ai_model') || 'gpt-4o-mini',
  });
  const [configSaved, setConfigSaved] = useState(false);
  
  // Save AI config
  const handleSaveAiConfig = () => {
    localStorage.setItem('ai_api_key', aiConfig.apiKey);
    localStorage.setItem('ai_api_url', aiConfig.apiUrl);
    localStorage.setItem('ai_model', aiConfig.model);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleUpload = async () => {
    const files = await open({
      multiple: true,
      filters: [{ name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'xlsx', 'pptx', 'txt', 'md', 'jpg', 'jpeg', 'png'] }]
    });
    
    if (files) {
      const fileList = (Array.isArray(files) ? files : [files]).map(f => ({
        name: f.split(/[/\\]/).pop() || 'unknown',
        path: f,
        size: 0,
        type: f.split('.').pop()?.toLowerCase() || ''
      }));
      setUploadedFiles(fileList);
      
      // Auto analyze
      setIsAnalyzing(true);
      setTimeout(() => {
        // Simulate AI analysis
        setAiAnalysis({
          title: fileList[0]?.name.replace(/\.[^/.]+$/, '') || '新案件',
          caseType: 'civil',
          court: '',
          oppositeParty: '',
          description: `根据上传的文件分析，案件涉及相关法律材料${fileList.length}份，建议创建案件进行管理。`
        });
        setIsAnalyzing(false);
      }, 2000);
    }
  };

  const handleCreateFromAnalysis = async () => {
    if (aiAnalysis) {
      await createCase({
        title: aiAnalysis.title,
        case_type: aiAnalysis.caseType,
        status: 'pending',
        court: aiAnalysis.court,
        opposite_party: aiAnalysis.oppositeParty,
        description: aiAnalysis.description
      });
      setCurrentPage('cases');
      setUploadedFiles([]);
      setAiAnalysis(null);
    }
  };

  const handleSelectExistingCase = () => {
    setCurrentPage('cases');
    setUploadedFiles([]);
    setAiAnalysis(null);
  };

  return (
    <div className="h-screen flex bg-[#f5f5f7]">
      {/* Sidebar */}
      <div className="sidebar w-64 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Scale size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">LegalDesk</h1>
              <p className="text-xs text-gray-500">法律工作者助手</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`sidebar-item w-full ${currentPage === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              工作台
            </button>
            <button
              onClick={() => setCurrentPage('upload')}
              className={`sidebar-item w-full ${currentPage === 'upload' ? 'active' : ''}`}
            >
              <Upload size={18} />
              上传文件
            </button>
            <button
              onClick={() => setCurrentPage('cases')}
              className={`sidebar-item w-full ${currentPage === 'cases' ? 'active' : ''}`}
            >
              <Briefcase size={18} />
              案件管理
            </button>
            <button
              onClick={() => setCurrentPage('templates')}
              className={`sidebar-item w-full ${currentPage === 'templates' ? 'active' : ''}`}
            >
              <FileText size={18} />
              文书模板
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className={`sidebar-item w-full ${currentPage === 'settings' ? 'active' : ''}`}
            >
              <Settings size={18} />
              设置
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles size={14} className="text-blue-500" />
            <span>AI 助手已就绪</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Dashboard Page */}
        {currentPage === 'dashboard' && <Dashboard />}

        {/* Upload Page */}
        {currentPage === 'upload' && (
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl font-semibold mb-2">添加案件文件</h1>
              <p className="text-gray-500 mb-8">添加本地文件引用，AI 将自动分析并整理案件信息</p>

              {/* Upload zone */}
              <div 
                className={`upload-zone ${uploadedFiles.length > 0 ? 'border-blue-500 bg-blue-50' : ''}`}
                onClick={handleUpload}
              >
                {uploadedFiles.length === 0 ? (
                  <>
                    <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-700 mb-2">点击或拖拽文件到此处添加</p>
                    <p className="text-gray-500">支持 PDF、Word、图片等格式（仅保存文件引用，不复制文件）</p>
                  </>
                ) : (
                  <div className="space-y-3">
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                        <File size={20} className="text-blue-500" />
                        <span className="flex-1 text-left">{file.name}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setUploadedFiles(f => f.filter((_, idx) => idx !== i)); }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <X size={16} className="text-gray-400" />
                        </button>
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 mt-4">点击继续添加更多文件</p>
                  </div>
                )}
              </div>

              {/* Analysis result */}
              {isAnalyzing && (
                <div className="card p-8 mt-6 text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-lg font-medium">AI 正在分析文件...</p>
                  <p className="text-gray-500 text-sm mt-1">请稍候</p>
                </div>
              )}

              {aiAnalysis && !isAnalyzing && (
                <div className="card p-6 mt-6 animate-fadeIn">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={20} className="text-blue-500" />
                    <h3 className="font-semibold">AI 分析结果</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">建议案件名称</label>
                      <p className="font-medium">{aiAnalysis.title}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">案件类型</label>
                      <p className="font-medium">
                        {aiAnalysis.caseType === 'civil' ? '民事' : 
                         aiAnalysis.caseType === 'criminal' ? '刑事' : 
                         aiAnalysis.caseType === 'administrative' ? '行政' : '其他'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">案件描述</label>
                      <p className="text-gray-600">{aiAnalysis.description}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button onClick={handleCreateFromAnalysis} className="btn btn-primary flex-1">
                      <ArrowRight size={18} />
                      创建案件
                    </button>
                    <button onClick={handleSelectExistingCase} className="btn btn-secondary flex-1">
                      选择已有案件
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cases Page */}
        {currentPage === 'cases' && (
          selectedCaseId ? <CaseDetail /> : <CaseList />
        )}

        {/* Templates Page */}
        {currentPage === 'templates' && <TemplatePage />}

        {/* Settings Page */}
        {currentPage === 'settings' && (
          <div className="p-8 overflow-auto">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-semibold mb-8">设置</h1>
              
              <div className="card p-6 mb-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-500" />
                  AI 配置
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">API Key</label>
                    <input
                      type="password"
                      placeholder="请输入 API Key"
                      value={aiConfig.apiKey}
                      onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">API 地址</label>
                    <input
                      type="text"
                      placeholder="https://api.openai.com/v1"
                      value={aiConfig.apiUrl}
                      onChange={(e) => setAiConfig({ ...aiConfig, apiUrl: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">模型</label>
                    <select
                      value={aiConfig.model}
                      onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                      className="input"
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                      <option value="claude-3-haiku">Claude 3 Haiku</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={handleSaveAiConfig} className="btn btn-primary">
                      保存配置
                    </button>
                    {configSaved && <span className="text-green-600 text-sm">配置已保存</span>}
                  </div>
                </div>
              </div>

              <div className="card p-6 mb-6">
                <h2 className="font-semibold mb-4">数据管理</h2>
                <div className="flex gap-3">
                  <button className="btn btn-secondary">导出数据</button>
                  <button className="btn btn-secondary">导入数据</button>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-semibold mb-4">关于</h2>
                <p className="text-gray-600">LegalDesk v0.1.0</p>
                <p className="text-gray-500 text-sm mt-1">法律工作者 AI 助手</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
