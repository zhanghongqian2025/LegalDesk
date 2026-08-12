import { ArrowRight, Bot, FileSearch, FileText, ListTree, LockKeyhole } from 'lucide-react';
import { AGENT_REGISTRY } from '../agents/registry';
import { PiStatusCard } from '../components/PiStatusCard';

const agentIcons = {
  'matter-organizer': ListTree,
  'evidence-reviewer': FileSearch,
  'document-drafter': FileText,
};

interface AgentCenterProps {
  onOpenCases: () => void;
}

export function AgentCenter({ onOpenCases }: AgentCenterProps) {
  return (
    <main className="h-full overflow-auto p-8" tabIndex={-1}>
      <div className="max-w-6xl mx-auto">
        <header className="workbench-header">
          <div>
            <p className="eyebrow">AGENT WORKSPACE</p>
            <h1>法律智能体中心</h1>
            <p>智能体在具体案件中运行，只读取你明确选择的材料；输出先进入待复核草稿。</p>
          </div>
          <button type="button" onClick={onOpenCases} className="btn btn-primary">
            选择案件
            <ArrowRight size={17} />
          </button>
        </header>

        <div className="agent-layout mt-7">
          <section aria-labelledby="agent-list-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">FIRST RELEASE</p>
                <h2 id="agent-list-heading">首批专业智能体</h2>
              </div>
              <span className="count-label">{AGENT_REGISTRY.length} 个</span>
            </div>

            <div className="agent-list mt-4">
              {AGENT_REGISTRY.map((agent, index) => {
                const Icon = agentIcons[agent.id as keyof typeof agentIcons] || Bot;
                return (
                  <article key={agent.id} className="agent-row">
                    <div className="agent-index">0{index + 1}</div>
                    <div className="agent-icon"><Icon size={20} /></div>
                    <div className="agent-copy">
                      <h3>{agent.name}</h3>
                      <p>{agent.summary}</p>
                      <span>交付：{agent.outcome}</span>
                    </div>
                    <div className="permission-note">
                      <LockKeyhole size={14} />
                      只读材料
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="space-y-5">
            <PiStatusCard />
            <section className="boundary-panel" aria-labelledby="boundary-heading">
              <p className="eyebrow">BOUNDARY</p>
              <h2 id="boundary-heading">运行边界</h2>
              <ul>
                <li>Pi 核心保持上游原样，不在本项目内 fork。</li>
                <li>Pi 以零工具模式运行，只接收 LegalDesk 预先校验的材料内容快照。</li>
                <li>每次运行保留事件记录和最终草稿，供人工复核。</li>
                <li>智能体不替代律师判断，也不自动提交或改写业务数据。</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
