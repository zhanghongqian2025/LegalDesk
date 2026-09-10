const AGENTS = Object.freeze({
  'material-organizer': Object.freeze({
    id: 'material-organizer',
    name: '材料整理 Agent',
    purpose: '分类材料、形成目录，并识别缺失、重复和冲突材料。',
    requiredSections: Object.freeze(['材料目录', '已确认事实', '推断', '待核验事项', '缺失或重复材料']),
    rules: Object.freeze([
      '必须区分材料明示事实、基于材料的推断和待核验事项。',
      '每个事实或推断必须引用材料标识；没有来源时标记为待核验。',
      '不得作出实体法律结论。',
    ]),
  }),
  'evidence-reviewer': Object.freeze({
    id: 'evidence-reviewer',
    name: '证据审阅 Agent',
    purpose: '围绕真实性、合法性和关联性提供审阅线索与补证建议。',
    requiredSections: Object.freeze(['证据概览', '真实性线索', '合法性线索', '关联性线索', '补证建议', '需人工判断']),
    rules: Object.freeze([
      '不得替代法院或承办人作出最终证据认定。',
      '每项审阅意见必须引用材料标识并说明依据。',
      '无法从材料确认的内容必须放入需人工判断。',
    ]),
  }),
  'document-drafter': Object.freeze({
    id: 'document-drafter',
    name: '文书起草 Agent',
    purpose: '基于用户任务和明确选择的材料生成可审核文书草稿。',
    requiredSections: Object.freeze(['文书草稿', '材料引用', '待确认项', '起草说明']),
    rules: Object.freeze([
      '不得编造事实、证据、法条、案例、主体信息或日期。',
      '材料未载明的信息使用清晰的待确认占位符。',
      '输出必须标记为待人工审核草稿，不得声称可直接提交或发送。',
    ]),
  }),
})

export function listLegalAgents() {
  return Object.values(AGENTS)
}

export function getLegalAgent(id) {
  const agent = AGENTS[id]
  if (!agent) {
    throw new Error(`未知法律 Agent：${JSON.stringify(id)}`)
  }
  return agent
}
