import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import {
  ArrowRight,
  Bot,
  Briefcase,
  Database,
  File,
  FileText,
  LayoutDashboard,
  Scale,
  Settings,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { PiStatusCard } from './components/PiStatusCard';
import { useAppStore } from './store';
import { AgentCenter } from './pages/AgentCenter';
import { CaseDetail } from './pages/CaseDetail';
import { CaseList } from './pages/CaseList';
import { Dashboard } from './pages/Dashboard';
import { TemplatePage } from './pages/TemplatePage';

type Page = 'dashboard' | 'intake' | 'cases' | 'agents' | 'templates' | 'settings';

interface UploadedFile {
  name: string;
  path: string;
  type: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const {
    selectedCaseId,
    fetchCases,
    createCase,
    fetchTemplates,
    selectCase,
    importFileToCase,
  } = useAppStore();
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const [dataIoMessage, setDataIoMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [intakeMessage, setIntakeMessage] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [matterTitle, setMatterTitle] = useState('');
  const [matterType, setMatterType] = useState('non_litigation');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    void fetchCases();
  }, [fetchCases]);

  const handlePickFiles = async () => {
    const files = await open({
      multiple: true,
      filters: [{ name: 'Documents', extensions: ['pdf', 'doc', 'docx', 'xlsx', 'pptx', 'txt', 'md', 'jpg', 'jpeg', 'png'] }],
    });

    if (!files) return;
    const additions = (Array.isArray(files) ? files : [files]).map((path) => ({
      name: path.split(/[/\\]/).pop() || 'unknown',
      path,
      type: path.split('.').pop()?.toLowerCase() || '',
    }));

    setUploadedFiles((current) => {
      const paths = new Set(current.map((file) => file.path));
      return [...current, ...additions.filter((file) => !paths.has(file.path))];
    });
    if (!matterTitle && additions[0]) {
      setMatterTitle(additions[0].name.replace(/\.[^/.]+$/, ''));
    }
    setIntakeMessage(null);
  };

  const handleCreateMatter = async () => {
    if (!matterTitle.trim() || uploadedFiles.length === 0 || isImporting) return;
    setIsImporting(true);
    setIntakeMessage(null);

    try {
      const created = await createCase({
        title: matterTitle.trim(),
        case_type: matterType,
        status: 'pending',
        description: `由资料入口创建，共导入 ${uploadedFiles.length} 份材料。`,
      });

      for (const file of uploadedFiles) {
        await importFileToCase(created.id, file.path, 'evidence');
      }

      selectCase(created.id);
      setUploadedFiles([]);
      setMatterTitle('');
      setCurrentPage('cases');
    } catch (error) {
      setIntakeMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsImporting(false);
    }
  };

  const openCase = (caseId: string) => {
    selectCase(caseId);
    setCurrentPage('cases');
  };

  const handleExportData = async () => {
    try {
      const json = await invoke<string>('export_app_data');
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      anchor.href = url;
      anchor.download = `legaldesk-backup-${stamp}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setDataIoMessage({ kind: 'success', text: '已导出业务数据 JSON' });
      setTimeout(() => setDataIoMessage(null), 3000);
    } catch (error) {
      setDataIoMessage({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
    }
  };

  const handleImportDataClick = () => {
    if (!window.confirm('导入会覆盖当前业务数据库。请确认已经保存现有备份，是否继续？')) return;
    importFileInputRef.current?.click();
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      await invoke('import_app_data', { json: await file.text() });
      await fetchCases();
      await fetchTemplates();
      selectCase(null);
      setDataIoMessage({ kind: 'success', text: '数据已从备份恢复' });
      setTimeout(() => setDataIoMessage(null), 3000);
    } catch (error) {
      setDataIoMessage({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
    }
  };

  const navItems: Array<{ id: Page; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
    { id: 'intake', label: '资料入口', icon: Upload },
    { id: 'cases', label: '案件与事项', icon: Briefcase },
    { id: 'agents', label: '智能体中心', icon: Bot },
    { id: 'templates', label: '文书模板', icon: FileText },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  return (
    <div className="h-screen flex app-shell">
      <aside className="sidebar w-64 flex flex-col" aria-label="主导航">
        <div className="brand-block">
          <div className="brand-mark"><Scale size={21} /></div>
          <div>
            <h1>LegalDesk</h1>
            <p>桌面法律工作平台</p>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`sidebar-item w-full ${currentPage === item.id ? 'active' : ''}`}
                aria-current={currentPage === item.id ? 'page' : undefined}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-boundary">
          <ShieldCheck size={16} />
          <div>
            <strong>本地优先</strong>
            <span>Pi 受控运行 · 全程留痕</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {currentPage === 'dashboard' && <Dashboard onOpenCase={openCase} />}

        {currentPage === 'intake' && (
          <main className="flex-1 overflow-auto p-8" tabIndex={-1}>
            <div className="max-w-4xl mx-auto">
              <header className="workbench-header">
                <div>
                  <p className="eyebrow">CONTROLLED INTAKE</p>
                  <h1>资料入口</h1>
                  <p>先建立案件或事项，再将材料复制到本地受管目录。智能体不会自动读取未选择的文件。</p>
                </div>
              </header>

              <section className="intake-panel mt-7" aria-labelledby="intake-heading">
                <div className="intake-form">
                  <h2 id="intake-heading">新建事项</h2>
                  <div>
                    <label htmlFor="matter-title">事项名称</label>
                    <input
                      id="matter-title"
                      className="input"
                      value={matterTitle}
                      onChange={(event) => setMatterTitle(event.target.value)}
                      placeholder="输入案件或非诉事项名称"
                    />
                  </div>
                  <div>
                    <label htmlFor="matter-type">事项类型</label>
                    <select
                      id="matter-type"
                      className="input"
                      value={matterType}
                      onChange={(event) => setMatterType(event.target.value)}
                    >
                      <option value="non_litigation">非诉事项</option>
                      <option value="civil">民事</option>
                      <option value="criminal">刑事</option>
                      <option value="administrative">行政</option>
                      <option value="arbitration">仲裁</option>
                    </select>
                  </div>
                  <div className="intake-note">
                    <Database size={17} />
                    文件将复制到 LegalDesk 数据目录，原文件移动后仍可使用。
                  </div>
                </div>

                <div className="intake-files">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2>本次导入材料</h2>
                      <p>{uploadedFiles.length > 0 ? `已选择 ${uploadedFiles.length} 份` : '尚未选择文件'}</p>
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={() => void handlePickFiles()}>
                      <Upload size={17} /> 选择文件
                    </button>
                  </div>

                  {uploadedFiles.length === 0 ? (
                    <button type="button" className="file-drop" onClick={() => void handlePickFiles()}>
                      <Upload size={28} />
                      <span>选择需要纳入事项的本地材料</span>
                      <small>PDF、Office、文本与常见图片格式</small>
                    </button>
                  ) : (
                    <ul className="file-queue">
                      {uploadedFiles.map((file) => (
                        <li key={file.path}>
                          <File size={17} />
                          <div><strong>{file.name}</strong><span>{file.type.toUpperCase() || 'FILE'}</span></div>
                          <button
                            type="button"
                            onClick={() => setUploadedFiles((current) => current.filter((item) => item.path !== file.path))}
                            aria-label={`移除 ${file.name}`}
                          >
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {intakeMessage && <div className="agent-error" role="alert">{intakeMessage}</div>}

                  <button
                    type="button"
                    className="btn btn-primary w-full mt-5"
                    onClick={() => void handleCreateMatter()}
                    disabled={!matterTitle.trim() || uploadedFiles.length === 0 || isImporting}
                  >
                    {isImporting ? '正在建立受管目录…' : '创建事项并导入材料'}
                    {!isImporting && <ArrowRight size={17} />}
                  </button>
                </div>
              </section>
            </div>
          </main>
        )}

        {currentPage === 'cases' && (selectedCaseId ? <CaseDetail /> : <CaseList />)}
        {currentPage === 'agents' && <AgentCenter onOpenCases={() => setCurrentPage('cases')} />}
        {currentPage === 'templates' && <TemplatePage />}

        {currentPage === 'settings' && (
          <main className="p-8 overflow-auto" tabIndex={-1}>
            <div className="max-w-3xl">
              <header className="workbench-header mb-7">
                <div>
                  <p className="eyebrow">LOCAL CONFIGURATION</p>
                  <h1>设置</h1>
                  <p>模型认证由 Pi 自己管理；LegalDesk 前端不保存或读取 API Key。</p>
                </div>
              </header>

              <div className="space-y-6">
                <PiStatusCard />

                <section className="card p-6" aria-labelledby="data-heading">
                  <h2 id="data-heading" className="font-semibold mb-2">数据管理</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    JSON 备份包含业务记录与智能体审计数据，不包含案件目录中的附件二进制文件。导入前请另外备份附件目录。
                  </p>
                  <input
                    ref={importFileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={() => void handleExportData()} className="btn btn-secondary">导出数据</button>
                    <button type="button" onClick={handleImportDataClick} className="btn btn-secondary">导入数据</button>
                    {dataIoMessage && (
                      <span className={`text-sm ${dataIoMessage.kind === 'success' ? 'text-green-700' : 'text-red-700'}`} role="status">
                        {dataIoMessage.text}
                      </span>
                    )}
                  </div>
                </section>

                <section className="card p-6" aria-labelledby="about-heading">
                  <h2 id="about-heading" className="font-semibold">关于</h2>
                  <p className="text-gray-700 mt-2">LegalDesk v0.2.0 · 桌面级法律工作平台</p>
                  <p className="text-gray-500 text-sm mt-1">本地优先、可私有部署、智能体运行可追溯，所有专业结论由法律人员最终复核。</p>
                </section>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
