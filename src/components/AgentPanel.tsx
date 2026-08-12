import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, CheckCircle2, CircleAlert, LoaderCircle, Play, Square } from 'lucide-react';
import { AGENT_REGISTRY, getAgentDefinition } from '../agents/registry';
import {
  cancelAgentRun,
  getAgentArtifacts,
  getAgentRuns,
  getPiStatus,
  listenAgentEvents,
  startAgentRun,
} from '../ai/piClient';
import type { AgentArtifact, AgentRun, Document, PiRuntimeStatus } from '../types';

interface AgentPanelProps {
  caseId: string;
  documents: Document[];
}

function runLabel(status: AgentRun['status']) {
  const labels: Record<AgentRun['status'], string> = {
    starting: '启动中',
    running: '运行中',
    completed: '待复核',
    cancelled: '已取消',
    failed: '失败',
  };
  return labels[status];
}

export function AgentPanel({ caseId, documents }: AgentPanelProps) {
  const [runtime, setRuntime] = useState<PiRuntimeStatus | null>(null);
  const [agentId, setAgentId] = useState(AGENT_REGISTRY[0].id);
  const [instruction, setInstruction] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [artifacts, setArtifacts] = useState<AgentArtifact[]>([]);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const activeRunIdRef = useRef<string | null>(null);
  const startPendingRef = useRef(false);
  const latestStatusRef = useRef<Record<string, AgentRun['status']>>({});

  const selectedAgent = useMemo(() => getAgentDefinition(agentId), [agentId]);
  const supportedDocumentIds = useMemo(
    () => new Set(
      documents
        .filter((document) => /\.(txt|md|markdown|csv|json|xml|html?|log)$/i.test(document.filepath || document.filename))
        .map((document) => document.id),
    ),
    [documents],
  );
  const busy = activeRun?.status === 'starting' || activeRun?.status === 'running';

  useEffect(() => {
    void Promise.all([getPiStatus(), getAgentRuns(caseId)]).then(([piStatus, history]) => {
      setRuntime(piStatus);
      setRuns(history);
    });
  }, [caseId]);

  useEffect(() => {
    let disposed = false;
    let unlisten: (() => void) | undefined;

    void listenAgentEvents((event) => {
      if (disposed) return;
      if (!activeRunIdRef.current && startPendingRef.current) {
        activeRunIdRef.current = event.run_id;
      }
      if (!activeRunIdRef.current || event.run_id !== activeRunIdRef.current) return;

      if (event.event_type === 'message_update') {
        const assistantEvent = event.data.assistantMessageEvent as Record<string, unknown> | undefined;
        if (assistantEvent?.type === 'text_delta' && typeof assistantEvent.delta === 'string') {
          setOutput((current) => current + assistantEvent.delta);
        }
      }

      if (event.event_type === 'run_status') {
        const status = event.data.status;
        if (typeof status === 'string') {
          latestStatusRef.current[event.run_id] = status as AgentRun['status'];
          setActiveRun((current) => current ? { ...current, status: status as AgentRun['status'] } : current);
          if (status === 'completed' || status === 'cancelled' || status === 'failed') {
            activeRunIdRef.current = null;
            startPendingRef.current = false;
            void getAgentRuns(caseId).then(setRuns);
            if (status === 'completed') {
              void getAgentArtifacts(event.run_id).then(setArtifacts);
            }
          }
        }
        if (typeof event.data.error === 'string') setError(event.data.error);
      }
    }).then((stop) => {
      if (disposed) stop();
      else unlisten = stop;
    });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [caseId]);

  const toggleDocument = (documentId: string) => {
    setSelectedDocuments((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    );
  };

  const handleStart = async () => {
    setError(null);
    setOutput('');
    setArtifacts([]);
    startPendingRef.current = true;
    try {
      const run = await startAgentRun({
        case_id: caseId,
        agent_id: agentId,
        instruction: instruction.trim(),
        document_ids: selectedDocuments,
      });
      const currentRun = { ...run, status: latestStatusRef.current[run.id] || run.status };
      activeRunIdRef.current = currentRun.status === 'running' || currentRun.status === 'starting' ? run.id : null;
      startPendingRef.current = activeRunIdRef.current !== null;
      setActiveRun(currentRun);
      setRuns((current) => [currentRun, ...current]);
    } catch (runError) {
      activeRunIdRef.current = null;
      startPendingRef.current = false;
      setError(runError instanceof Error ? runError.message : String(runError));
    }
  };

  const handleCancel = async () => {
    if (!activeRun) return;
    try {
      await cancelAgentRun(activeRun.id);
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : String(cancelError));
    }
  };

  const handleInspectRun = async (run: AgentRun) => {
    if (busy) return;
    setError(run.error || null);
    setActiveRun(run);
    try {
      const savedArtifacts = await getAgentArtifacts(run.id);
      setArtifacts(savedArtifacts);
      setOutput(savedArtifacts.map((artifact) => artifact.content).join('\n\n'));
    } catch (artifactError) {
      setArtifacts([]);
      setOutput('');
      setError(artifactError instanceof Error ? artifactError.message : String(artifactError));
    }
  };

  return (
    <div className="agent-panel-grid">
      <section className="agent-console" aria-labelledby="agent-console-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CASE-BOUND RUN</p>
            <h2 id="agent-console-heading">启动专业智能体</h2>
          </div>
          <span className={`runtime-pill ${runtime?.ready ? 'ready' : 'blocked'}`}>
            {runtime?.ready ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}
            {runtime?.ready ? `Pi ${runtime.version}` : 'Pi 未就绪'}
          </span>
        </div>

        <fieldset className="agent-choice mt-5" disabled={busy}>
          <legend>选择智能体</legend>
          <div className="agent-choice-grid">
            {AGENT_REGISTRY.map((agent) => (
              <label key={agent.id} className={agentId === agent.id ? 'selected' : ''}>
                <input
                  type="radio"
                  name="agent"
                  value={agent.id}
                  checked={agentId === agent.id}
                  onChange={() => setAgentId(agent.id)}
                />
                <span>{agent.name}</span>
                <small>{agent.summary}</small>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="document-picker mt-5" disabled={busy}>
          <legend>允许生成快照的材料</legend>
          <p>Pi 不获得文件工具。首版仅支持 UTF-8 文本，每份 256 KiB、本次合计 1 MiB；不勾选时只发送案件基本信息和任务要求。</p>
          {documents.length === 0 ? (
            <div className="document-empty">当前案件还没有已托管材料。</div>
          ) : (
            <div className="document-options">
              {documents.map((document) => (
                <label key={document.id} className={!supportedDocumentIds.has(document.id) ? 'unsupported' : ''}>
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(document.id)}
                    onChange={() => toggleDocument(document.id)}
                    disabled={!supportedDocumentIds.has(document.id)}
                  />
                  <span>{document.filename}</span>
                  <small>{supportedDocumentIds.has(document.id) ? document.category : '暂不支持提取'}</small>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <div className="mt-5">
          <label htmlFor="agent-instruction" className="block text-sm font-medium text-gray-800 mb-2">
            本次任务要求
          </label>
          <textarea
            id="agent-instruction"
            className="input agent-instruction"
            rows={4}
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder={`例如：${selectedAgent?.outcome || '说明需要交付的工作成果'}`}
            disabled={busy}
          />
        </div>

        {error && <div className="agent-error mt-4" role="alert">{error}</div>}

        <div className="flex items-center gap-3 mt-5">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void handleStart()}
            disabled={!runtime?.ready || busy || !instruction.trim()}
          >
            {busy ? <LoaderCircle size={17} className="animate-spin" /> : <Play size={17} />}
            {busy ? '正在运行' : '开始运行'}
          </button>
          {busy && (
            <button type="button" className="btn btn-secondary" onClick={() => void handleCancel()}>
              <Square size={15} />
              停止
            </button>
          )}
          <span className="text-xs text-gray-500">输出只保存为待复核草稿</span>
        </div>

        {(output || busy || artifacts.length > 0) && (
          <section className="agent-output mt-6" aria-live="polite" aria-label="智能体输出">
            <div className="agent-output-header">
              <div className="flex items-center gap-2"><Bot size={16} /> 运行输出</div>
              {activeRun && (
                <span>{runLabel(activeRun.status)}{artifacts[0] ? ` · ${artifacts[0].review_status === 'pending' ? '待人工审核' : artifacts[0].review_status}` : ''}</span>
              )}
            </div>
            <pre>{output || '正在建立案件上下文…'}</pre>
          </section>
        )}
      </section>

      <aside className="run-history" aria-labelledby="run-history-heading">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">AUDIT TRAIL</p>
            <h2 id="run-history-heading">运行记录</h2>
          </div>
          <span className="count-label">{runs.length}</span>
        </div>
        {runs.length === 0 ? (
          <p className="run-history-empty">尚无智能体运行记录。</p>
        ) : (
          <ol>
            {runs.map((run) => (
              <li key={run.id}>
                <button type="button" onClick={() => void handleInspectRun(run)} disabled={busy}>
                  <strong>{getAgentDefinition(run.agent_id)?.name || run.agent_id}</strong>
                  <span>{new Date(run.started_at).toLocaleString('zh-CN')}</span>
                </button>
                <span className={`run-status ${run.status}`}>{runLabel(run.status)}</span>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}
