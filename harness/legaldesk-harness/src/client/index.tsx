import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import css from './workbench.module.css'

export const inject = ['slots', 'sessions']
export function apply(ctx: any): void {
  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action', id: 'legaldesk-workbench', order: -20,
    inject: () => ({ openSession: (id: string) => ctx.sessions.open(id) }),
  }, LegalDeskEntry))
}

type Section = 'overview' | 'materials' | 'agents' | 'runs' | 'review'
type Overview = { agents: AgentDef[]; matters: Matter[]; materials?: Material[]; snapshots?: Snapshot[]; runs?: LegalRun[]; artifacts?: Artifact[] }
type Matter = { id: string; title: string; reference_no: string; status: string; material_count: number; run_count: number }
type Material = { id: string; name: string; media_type: string; byte_size: number; sha256: string; imported_at: string; parse_status: string; parser: string; parser_version: string; parse_error?: string }
type Snapshot = { id: string; label: string; material_count: number; created_at: string }
type AgentDef = { key: string; name: string; description: string }
type LegalRun = { id: string; agent_key: string; harness_session_id: string; status: string; created_at: string; error?: string; provider: string; model: string; input_tokens: number; cache_read_tokens: number; cache_write_tokens: number; output_tokens: number; reasoning_tokens: number; request_count: number; estimated_cost_microusd: number | null; pricing_version: string }
type Artifact = { id: string; title: string; content: string; status: string; reviewer_note: string; harness_session_id: string; agent_key: string }

function LegalDeskEntry({ wide, openSession }: { wide: boolean; openSession: (id: string) => void }) {
  const [open, setOpen] = useState(() => new URLSearchParams(window.location.search).get('legaldesk') === '1')
  return <><button className={css.entry} type="button" onClick={() => setOpen(true)} aria-label="打开法律工作台"><ScaleIcon />{wide && <span>法律工作台</span>}</button>{open && createPortal(<Workbench onClose={() => setOpen(false)} openSession={openSession} />, document.body)}</>
}

function Workbench({ onClose, openSession }: { onClose: () => void; openSession: (id: string) => void }) {
  const [data, setData] = useState<Overview>({ agents: [], matters: [] })
  const [matterId, setMatterId] = useState<string>()
  const [section, setSection] = useState<Section>('overview')
  const [selected, setSelected] = useState<string[]>([])
  const [snapshotId, setSnapshotId] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [creatingMatter, setCreatingMatter] = useState(false)
  const matter = data.matters.find(item => item.id === matterId)
  const refresh = async (id = matterId) => { const next = await request<Overview>(`overview${id ? `?matterId=${encodeURIComponent(id)}` : ''}`); setData(next); if (!id && next.matters[0]) setMatterId(next.matters[0].id); setLoading(false) }
  useEffect(() => { void refresh() }, [])
  useEffect(() => { if (matterId) { setSelected([]); setSnapshotId(undefined); void refresh(matterId) } }, [matterId])
  useEffect(() => { if (!matterId || !data.runs?.some(run => run.status === 'running')) return; const timer = window.setInterval(() => { void refresh(matterId) }, 2500); return () => window.clearInterval(timer) }, [matterId, data.runs])
  const perform = async (work: () => Promise<void>) => { setBusy(true); setMessage(''); try { await work() } catch (error) { setMessage(error instanceof Error ? error.message : String(error)) } finally { setBusy(false) } }

  return <div className={css.app} role="dialog" aria-modal="true" aria-label="法律工作台">
    <a className={css.skipLink} href="#legaldesk-main">跳到主要内容</a>
    <aside className={css.rail}>
      <div className={css.brand}><span className={css.brandMark}>L</span><span><strong>LegalDesk</strong><small>法律 Agent 工作台</small></span></div>
      <nav className={css.nav} aria-label="法律工作台导航">
        <NavButton active={section === 'overview'} icon={<GridIcon />} label="案件概览" onClick={() => setSection('overview')} />
        <NavButton active={section === 'materials'} icon={<FileIcon />} label="材料与快照" count={data.materials?.length} onClick={() => setSection('materials')} />
        <NavButton active={section === 'agents'} icon={<AgentIcon />} label="法律 Agent" onClick={() => setSection('agents')} />
        <NavButton active={section === 'runs'} icon={<RunIcon />} label="运行记录" count={data.runs?.length} onClick={() => setSection('runs')} />
        <NavButton active={section === 'review'} icon={<ReviewIcon />} label="草稿审核" count={data.artifacts?.filter(item => item.status === 'pending_review').length} onClick={() => setSection('review')} />
      </nav>
      <div className={css.caseDirectory}><div className={css.directoryHead}><span>案件</span><button type="button" onClick={() => setCreatingMatter(true)} aria-label="新建案件"><PlusIcon /></button></div><div className={css.caseList}>{data.matters.map(item => <button type="button" key={item.id} className={`${css.caseItem} ${item.id === matterId ? css.caseActive : ''}`} onClick={() => { setMatterId(item.id); setSection('overview') }}><span className={css.caseInitial}>{item.title.slice(0, 1)}</span><span><strong>{item.title}</strong><small>{item.material_count} 份材料 · {item.run_count} 次运行</small></span></button>)}</div></div>
      <button className={css.backHarness} type="button" onClick={onClose} aria-label="返回 Harness"><BackIcon /><span>返回 Harness</span></button>
    </aside>
    <section className={css.workspace}>
      <header className={css.topbar}><div className={css.context}><span>当前案件</span><strong>{matter?.title ?? '未选择案件'}</strong>{matter?.reference_no && <small>{matter.reference_no}</small>}</div><div className={css.localStatus}><span className={css.statusDot} />本机存储<span className={css.divider} />人工审核开启</div></header>
      <main className={css.content} id="legaldesk-main" tabIndex={-1}>
        {message && <div className={css.alert} role="alert"><AlertIcon /><span>{message}</span><button type="button" onClick={() => setMessage('')}>关闭</button></div>}
        {loading ? <LoadingState /> : !matter ? <NoMatter onCreate={() => setCreatingMatter(true)} /> : <>{section === 'overview' && <OverviewPage matter={matter} data={data} go={setSection} />}{section === 'materials' && <MaterialsPage data={data} matterId={matter.id} selected={selected} setSelected={setSelected} snapshotId={snapshotId} setSnapshotId={setSnapshotId} busy={busy} perform={perform} refresh={() => refresh(matter.id)} />}{section === 'agents' && <AgentsPage data={data} matterId={matter.id} snapshotId={snapshotId} setSnapshotId={setSnapshotId} busy={busy} perform={perform} refresh={() => refresh(matter.id)} />}{section === 'runs' && <RunsPage data={data} openSession={openSession} />}{section === 'review' && <ReviewPage data={data} busy={busy} perform={perform} refresh={() => refresh(matter.id)} />}</>}
      </main>
    </section>
    {creatingMatter && <MatterForm busy={busy} onCancel={() => setCreatingMatter(false)} onSubmit={(title, referenceNo) => perform(async () => { const row = await request<Matter>('matters', { title, referenceNo }); await refresh(); setMatterId(row.id); setCreatingMatter(false); setSection('overview') })} />}
  </div>
}

function OverviewPage({ matter, data, go }: { matter: Matter; data: Overview; go: (section: Section) => void }) {
  const pending = data.artifacts?.filter(item => item.status === 'pending_review').length ?? 0; const lastRun = data.runs?.[0]
  const next = (data.materials?.length ?? 0) === 0 ? 'materials' : (data.snapshots?.length ?? 0) === 0 ? 'materials' : 'agents'
  return <div className={css.page}><PageHeading eyebrow="案件工作空间" title={matter.title} description="案件材料、Agent 运行与审核记录均隔离保存在当前案件边界内。" />
    <div className={css.metrics}><Metric value={data.materials?.length ?? 0} label="案件材料" hint="已导入本机" /><Metric value={data.snapshots?.length ?? 0} label="材料快照" hint="不可变版本" /><Metric value={data.runs?.length ?? 0} label="Agent 运行" hint={lastRun ? statusText(lastRun.status) : '尚未运行'} /><Metric value={pending} label="待审核草稿" hint={pending ? '需要律师处理' : '当前无待办'} emphasis={pending > 0} /></div>
    <section className={css.primaryPanel}><div className={css.panelIntro}><span className={css.stepLabel}>建议下一步</span><h2>{next === 'agents' ? '选择法律 Agent 开始工作' : (data.materials?.length ?? 0) === 0 ? '导入第一份案件材料' : '固化本次工作材料快照'}</h2><p>Agent 只会收到你明确纳入快照的材料，运行结果不会自动成为最终法律意见。</p></div><button className={css.primaryButton} type="button" onClick={() => go(next)}>继续办理<ArrowIcon /></button></section>
    <div className={css.overviewGrid}><section className={css.surface}><SectionHead title="最近运行" action="查看全部" onAction={() => go('runs')} />{lastRun ? <RunSummary run={lastRun} agents={data.agents} /> : <EmptyLine text="尚未启动法律 Agent" />}</section><section className={css.surface}><SectionHead title="审核待办" action="进入审核" onAction={() => go('review')} />{pending ? <div className={css.todo}><span>{pending}</span><div><strong>份草稿等待人工审核</strong><small>批准或退回修改后才会完成审核闭环</small></div></div> : <EmptyLine text="当前没有待审核草稿" />}</section></div>
  </div>
}

function MaterialsPage({ data, matterId, selected, setSelected, snapshotId, setSnapshotId, busy, perform, refresh }: any) {
  return <div className={css.page}><PageHeading eyebrow="案件材料" title="材料与快照" description="导入材料后，明确选择本次工作范围并固化不可变快照。" actions={<label className={css.primaryButton}>导入材料<input type="file" multiple onChange={event => void perform(async () => { const files = Array.from(event.target.files ?? []) as File[]; for (const file of files) await request('materials', { matterId, name: file.name, mediaType: file.type, data: await fileBase64(file) }); event.target.value = ''; await refresh() })} /></label>} />
    <section className={css.surface}><div className={css.tableToolbar}><div><strong>{data.materials?.length ?? 0} 份材料</strong><span>已选 {selected.length} 份</span></div><button className={css.secondaryButton} type="button" disabled={busy || selected.length === 0} onClick={() => void perform(async () => { const snap = await request<Snapshot>('snapshots', { matterId, materialIds: selected }); await refresh(); setSnapshotId(snap.id) })}>创建材料快照</button></div><div className={css.materialTable} role="table" aria-label="案件材料">{(data.materials ?? []).map((item: Material) => <label className={css.materialRow} key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => setSelected((list: string[]) => list.includes(item.id) ? list.filter(id => id !== item.id) : [...list, item.id])} /><span className={css.fileGlyph}><FileIcon /></span><span className={css.fileName}><strong>{item.name}</strong><small>{item.media_type || '未知类型'} · {parseText(item)}</small></span><span><strong>{formatBytes(item.byte_size)}</strong><small>文件大小</small></span><span className={css.hash}><code>{item.sha256.slice(0, 12)}…</code><small>SHA-256</small></span></label>)}{(data.materials ?? []).length === 0 && <EmptyBlock title="尚无案件材料" description="导入合同、证据清单或事实说明，文件会复制到本机受管目录。" />}</div></section>
    <section className={css.surface}><SectionHead title="材料快照" /><div className={css.snapshotList}>{(data.snapshots ?? []).map((item: Snapshot) => <button type="button" key={item.id} className={`${css.snapshotItem} ${snapshotId === item.id ? css.snapshotActive : ''}`} onClick={() => setSnapshotId(item.id)}><span className={css.snapshotIcon}><SnapshotIcon /></span><span><strong>{item.label}</strong><small>{item.material_count} 份材料 · {formatDate(item.created_at)}</small></span>{snapshotId === item.id && <span className={css.selectedTag}>已选</span>}</button>)}</div></section>
  </div>
}

function AgentsPage({ data, matterId, snapshotId, setSnapshotId, busy, perform, refresh }: any) {
  return <div className={css.page}><PageHeading eyebrow="受控工作流" title="法律 Agent" description="选择一个材料快照和专业角色。每次启动都会创建独立 Harness Session。" /><div className={css.snapshotChooser}><label htmlFor="run-snapshot">运行材料快照</label><select id="run-snapshot" value={snapshotId ?? ''} onChange={event => setSnapshotId(event.target.value || undefined)}><option value="">请选择已固化的材料快照</option>{(data.snapshots ?? []).map((item: Snapshot) => <option value={item.id} key={item.id}>{item.label} · {item.material_count} 份材料</option>)}</select><small>{snapshotId ? 'Agent 将只能读取该快照中的材料。' : '必须先选择快照，才能启动 Agent。'}</small></div><div className={css.agentList}>{data.agents.map((agent: AgentDef, index: number) => <article className={css.agentRow} key={agent.key}><span className={css.agentIndex}>0{index + 1}</span><span className={css.agentSymbol}>{index === 0 ? <OrganizeIcon /> : index === 1 ? <EvidenceIcon /> : <DraftIcon />}</span><div><h2>{agent.name}</h2><p>{agent.description}</p></div><div className={css.agentMeta}><span>独立 Session</span><span>输出需人工审核</span></div><button className={css.primaryButton} type="button" disabled={busy || !snapshotId} onClick={() => void perform(async () => { await request('runs', { matterId, snapshotId, agentKey: agent.key }); await refresh() })}>{busy ? '正在启动…' : '启动 Agent'}<ArrowIcon /></button></article>)}</div></div>
}

function RunsPage({ data, openSession }: { data: Overview; openSession: (id: string) => void }) {
  return <div className={css.page}><PageHeading eyebrow="执行与追踪" title="运行记录" description="Legal Run 与 Harness Session 一一关联，并记录模型、Token 与可配置成本估算。" /><section className={css.surface}><div className={css.runTable}><div className={css.tableHeader}><span>法律 Agent</span><span>Harness Session</span><span>用量 / 创建时间</span><span>状态</span><span /></div>{(data.runs ?? []).map(run => <div className={css.runTableRow} key={run.id}><span><strong>{agentName(data.agents, run.agent_key)}</strong><small>{run.model ? `${run.provider || 'provider'} · ${run.model}` : `${run.id.slice(0, 20)}…`}</small></span><code>{run.harness_session_id}</code><span><strong>{runUsage(run)}</strong><small>{formatDate(run.created_at)}</small></span><StatusBadge status={run.status} /><button type="button" onClick={() => openSession(run.harness_session_id)}>打开 Session<ArrowIcon /></button>{run.error && <p className={css.runError}>{run.error}</p>}</div>)}{(data.runs ?? []).length === 0 && <EmptyBlock title="尚无运行记录" description="选择材料快照和法律 Agent 后，运行会在这里显示。" />}</div></section></div>
}

function ReviewPage({ data, busy, perform, refresh }: any) {
  return <div className={css.page}><PageHeading eyebrow="人工质量控制" title="草稿审核" description="模型产物默认是待审核草稿；只有人工可以批准或退回修改。" /><div className={css.reviewList}>{(data.artifacts ?? []).map((item: Artifact) => <ArtifactCard key={item.id} item={item} busy={busy} review={(status, note) => perform(async () => { await request('reviews', { artifactId: item.id, status, note }); await refresh() })} />)}{(data.artifacts ?? []).length === 0 && <section className={css.surface}><EmptyBlock title="当前没有草稿" description="Agent 完成工作后，产物会以“待审核”状态出现在这里。" /></section>}</div></div>
}

function ArtifactCard({ item, busy, review }: { item: Artifact; busy: boolean; review: (status: string, note: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false); const [note, setNote] = useState('')
  return <article className={css.reviewCard}><header><div><StatusBadge status={item.status} /><h2>{item.title}</h2><p>{agentName([], item.agent_key)} · Session {item.harness_session_id}</p></div><button type="button" onClick={() => setExpanded(value => !value)} aria-expanded={expanded}>{expanded ? '收起草稿' : '展开审核'}<ChevronIcon up={expanded} /></button></header>{expanded && <div className={css.reviewBody}><pre>{item.content}</pre>{item.status === 'pending_review' && <div className={css.reviewForm}><label htmlFor={`note-${item.id}`}>审核意见</label><textarea id={`note-${item.id}`} value={note} onChange={event => setNote(event.target.value)} placeholder="记录核对结果；退回修改时请说明原因。" /><div><button className={css.secondaryButton} disabled={busy || !note.trim()} type="button" onClick={() => void review('changes_requested', note)}>退回修改</button><button className={css.primaryButton} disabled={busy} type="button" onClick={() => void review('approved', note)}>批准草稿</button></div></div>}</div>}</article>
}

function MatterForm({ busy, onCancel, onSubmit }: { busy: boolean; onCancel: () => void; onSubmit: (title: string, referenceNo: string) => Promise<void> }) {
  const [title, setTitle] = useState(''); const [referenceNo, setReferenceNo] = useState(''); const valid = title.trim().length > 0
  return <div className={css.sheetBackdrop}><form className={css.sheet} onSubmit={event => { event.preventDefault(); if (valid) void onSubmit(title, referenceNo) }}><header><div><span>NEW MATTER</span><h2>新建案件</h2></div><button type="button" onClick={onCancel} aria-label="关闭新建案件表单"><CloseIcon /></button></header><div className={css.formBody}><label htmlFor="matter-title">案件名称<span>*</span></label><input id="matter-title" autoFocus value={title} onChange={event => setTitle(event.target.value)} placeholder="例如：某公司买卖合同纠纷" /><small>名称用于本机案件目录和工作台识别。</small><label htmlFor="matter-reference">案件编号</label><input id="matter-reference" value={referenceNo} onChange={event => setReferenceNo(event.target.value)} placeholder="可选，例如：2026-民商-001" /></div><footer><button className={css.secondaryButton} type="button" onClick={onCancel}>取消</button><button className={css.primaryButton} type="submit" disabled={!valid || busy}>{busy ? '正在创建…' : '创建案件'}</button></footer></form></div>
}

function NavButton({ active, icon, label, count, onClick }: { active: boolean; icon: React.ReactNode; label: string; count?: number; onClick: () => void }) { return <button type="button" className={`${css.navItem} ${active ? css.navActive : ''}`} aria-current={active ? 'page' : undefined} onClick={onClick}>{icon}<span>{label}</span>{count !== undefined && count > 0 && <small>{count}</small>}</button> }
function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) { return <header className={css.pageHeading}><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actions}</header> }
function Metric({ value, label, hint, emphasis }: { value: number; label: string; hint: string; emphasis?: boolean }) { return <div className={`${css.metric} ${emphasis ? css.metricEmphasis : ''}`}><strong>{value}</strong><span>{label}</span><small>{hint}</small></div> }
function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) { return <div className={css.sectionHead}><h2>{title}</h2>{action && <button type="button" onClick={onAction}>{action}<ArrowIcon /></button>}</div> }
function RunSummary({ run, agents }: { run: LegalRun; agents: AgentDef[] }) { return <div className={css.runSummary}><span className={css.agentSymbol}><RunIcon /></span><div><strong>{agentName(agents, run.agent_key)}</strong><code>{run.harness_session_id}</code></div><StatusBadge status={run.status} /></div> }
function StatusBadge({ status }: { status: string }) { return <span className={`${css.badge} ${css[`badge_${status}`] ?? ''}`}><span />{statusText(status)}</span> }
function EmptyLine({ text }: { text: string }) { return <p className={css.emptyLine}>{text}</p> }
function EmptyBlock({ title, description }: { title: string; description: string }) { return <div className={css.emptyBlock}><span><FileIcon /></span><strong>{title}</strong><p>{description}</p></div> }
function LoadingState() { return <div className={css.loading}><span /><span /><span /></div> }
function NoMatter({ onCreate }: { onCreate: () => void }) { return <div className={css.noMatter}><span className={css.largeMark}>L</span><span>CASE-FIRST WORKFLOW</span><h1>从一个清晰的案件边界开始。</h1><p>材料、Agent Session、草稿和审核记录都必须归属于案件。</p><button className={css.primaryButton} type="button" onClick={onCreate}>新建第一个案件<ArrowIcon /></button></div> }

async function request<T = unknown>(path: string, body?: unknown): Promise<T> { const response = await fetch(`/legaldesk/api/${path}`, body === undefined ? undefined : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); const value = await response.json(); if (!response.ok) throw new Error(value?.error?.message ?? `请求失败 (${response.status})`); return value }
function fileBase64(file: File): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(reader.error); reader.onload = () => resolve(String(reader.result).split(',')[1] ?? ''); reader.readAsDataURL(file) }) }
function formatBytes(value: number) { return value < 1024 ? `${value} B` : value < 1048576 ? `${(value / 1024).toFixed(1)} KB` : `${(value / 1048576).toFixed(1)} MB` }
function formatDate(value: string) { return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }
function parseText(item: Material) { return item.parse_status === 'ready' ? `${item.parser} 已解析` : item.parse_status === 'failed' ? '正文解析失败' : '文本可直接读取' }
function runUsage(run: LegalRun) { if (run.status === 'running') return '正在统计'; if (run.request_count === 0) return '未报告 Token'; const input = run.input_tokens + run.cache_read_tokens + run.cache_write_tokens; const cost = run.estimated_cost_microusd === null ? '未配置价格' : `$${(run.estimated_cost_microusd / 1_000_000).toFixed(4)}`; return `${formatTokens(input)} 输入 · ${formatTokens(run.output_tokens)} 输出 · ${cost}` }
function formatTokens(value: number) { return value < 1000 ? String(value) : `${(value / 1000).toFixed(value < 10000 ? 1 : 0)}K` }
function agentName(agents: AgentDef[], key: string) { return agents.find(item => item.key === key)?.name ?? ({ 'material-organizer': '材料整理 Agent', 'evidence-reviewer': '证据审查 Agent', 'document-drafter': '法律文书 Agent' }[key] ?? key) }
function statusText(status: string) { return ({ running: '运行中', completed: '已完成', failed: '失败', pending_review: '待审核', approved: '已批准', changes_requested: '已退回' }[status] ?? status) }

const Icon = ({ children, size = 18 }: { children: React.ReactNode; size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
const ScaleIcon = () => <Icon><path d="M12 3v18M5 7h14M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7ZM8 21h8" /></Icon>
const GridIcon = () => <Icon><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></Icon>
const FileIcon = () => <Icon><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></Icon>
const AgentIcon = () => <Icon><circle cx="12" cy="8" r="3" /><path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6M4 5l2 1M20 5l-2 1" /></Icon>
const RunIcon = () => <Icon><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4z" /></Icon>
const ReviewIcon = () => <Icon><path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h3" /><path d="m14 16 1.5 1.5L19 14" /></Icon>
const PlusIcon = () => <Icon><path d="M12 5v14M5 12h14" /></Icon>
const BackIcon = () => <Icon><path d="m15 18-6-6 6-6" /></Icon>
const ArrowIcon = () => <Icon size={15}><path d="M5 12h14m-5-5 5 5-5 5" /></Icon>
const AlertIcon = () => <Icon><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 17h.01" /></Icon>
const SnapshotIcon = () => <Icon><path d="M5 5h14v14H5zM8 8h8v8H8z" /></Icon>
const OrganizeIcon = () => <Icon size={22}><path d="M4 5h16M4 12h10M4 19h13" /><circle cx="18" cy="12" r="2" /></Icon>
const EvidenceIcon = () => <Icon size={22}><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5M7 10l2 2 4-4" /></Icon>
const DraftIcon = () => <Icon size={22}><path d="M5 3h10l4 4v14H5zM15 3v5h5M9 13h6M9 17h4" /></Icon>
const ChevronIcon = ({ up }: { up: boolean }) => <Icon size={15}><path d={up ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} /></Icon>
const CloseIcon = () => <Icon><path d="m6 6 12 12M18 6 6 18" /></Icon>
