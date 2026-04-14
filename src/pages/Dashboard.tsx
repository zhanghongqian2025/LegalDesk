import { useEffect } from 'react';
import { useAppStore } from '../store';
import { CASE_TYPE_LABELS } from '../types';
import { Scale, Briefcase, FileText, Clock, AlertTriangle, TrendingUp, Calendar, Plus } from 'lucide-react';

export function Dashboard() {
  const { cases, fetchCases, selectCase } = useAppStore();

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Stats
  const totalCases = cases.length;
  const pendingCases = cases.filter(c => c.status === 'pending').length;
  const inProgressCases = cases.filter(c => c.status === 'in_progress').length;
  const closedCases = cases.filter(c => c.status === 'closed').length;

  const byType = cases.reduce<Record<string, number>>((acc, c) => {
    acc[c.case_type] = (acc[c.case_type] || 0) + 1;
    return acc;
  }, {});

  // Upcoming deadlines (court dates within 14 days)
  const now = new Date();
  const upcomingDeadlines = cases
    .filter(c => c.court_date || c.deadline)
    .map(c => ({
      ...c,
      deadlineDate: c.court_date ? new Date(c.court_date) : c.deadline ? new Date(c.deadline) : null,
    }))
    .filter(c => c.deadlineDate && c.deadlineDate >= now)
    .sort((a, b) => (a.deadlineDate?.getTime() || 0) - (b.deadlineDate?.getTime() || 0))
    .slice(0, 5);

  // Recent cases
  const recentCases = [...cases].slice(0, 5);

  const getDaysUntil = (date: Date | null) => {
    if (!date) return '';
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return '已过期';
    if (diff === 0) return '今天';
    if (diff === 1) return '明天';
    return `${diff}天后`;
  };

  const getDeadlineClass = (date: Date | null) => {
    if (!date) return '';
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'text-red-600 bg-red-50';
    if (diff <= 3) return 'text-orange-600 bg-orange-50';
    if (diff <= 7) return 'text-yellow-600 bg-yellow-50';
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">工作台</h1>
          <p className="text-gray-500 mt-1">欢迎回来，以下是您的工作概览</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Briefcase size={20} className="text-blue-500" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{totalCases}</span>
            </div>
            <p className="text-gray-500 text-sm">总案件数</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                <Clock size={20} className="text-yellow-500" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{pendingCases}</span>
            </div>
            <p className="text-gray-500 text-sm">待处理</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <TrendingUp size={20} className="text-green-500" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{inProgressCases}</span>
            </div>
            <p className="text-gray-500 text-sm">办理中</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <FileText size={20} className="text-purple-500" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{closedCases}</span>
            </div>
            <p className="text-gray-500 text-sm">已结案</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Upcoming Deadlines */}
          <div className="col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-orange-500" />
                  <h2 className="font-semibold text-lg">近期日程</h2>
                </div>
                <span className="text-sm text-gray-500">未来14天</span>
              </div>

              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar size={40} className="mx-auto mb-2 opacity-50" />
                  <p>暂无近期日程</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => selectCase(c.id)}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className={`w-16 text-center rounded-lg py-2 px-1 ${getDeadlineClass(c.deadlineDate)}`}>
                        <div className="text-xs font-medium">
                          {c.deadlineDate?.toLocaleDateString('zh-CN', { month: 'short' })}
                        </div>
                        <div className="text-lg font-bold">
                          {c.deadlineDate?.getDate()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{c.title}</p>
                        <p className="text-sm text-gray-500">
                          {c.court_date ? `开庭：${c.court_date}` : c.deadline ? `截止：${c.deadline}` : ''}
                        </p>
                      </div>
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${getDeadlineClass(c.deadlineDate)}`}>
                        {getDaysUntil(c.deadlineDate)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Case Distribution */}
          <div className="col-span-1">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Scale size={18} className="text-blue-500" />
                <h2 className="font-semibold text-lg">案件分布</h2>
              </div>
              {totalCases === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>暂无数据</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(byType).map(([type, count]) => {
                    const pct = Math.round((count / totalCases) * 100);
                    const colors: Record<string, string> = {
                      civil: 'bg-blue-500',
                      criminal: 'bg-red-500',
                      administrative: 'bg-yellow-500',
                      arbitration: 'bg-purple-500',
                      non_litigation: 'bg-green-500',
                    };
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            {CASE_TYPE_LABELS[type as keyof typeof CASE_TYPE_LABELS] || type}
                          </span>
                          <span className="font-medium text-gray-900">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors[type] || 'bg-gray-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Status breakdown */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-500 mb-3">状态分布</p>
                    {[
                      { label: '待处理', count: pendingCases, color: 'bg-yellow-500' },
                      { label: '办理中', count: inProgressCases, color: 'bg-blue-500' },
                      { label: '已结案', count: closedCases, color: 'bg-green-500' },
                    ].map(({ label, count, color }) => (
                      <div key={label} className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color}`} />
                          <span className="text-gray-600">{label}</span>
                        </div>
                        <span className="font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Cases */}
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-lg">最近案件</h2>
          </div>
          {recentCases.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Plus size={40} className="mx-auto mb-2 opacity-50" />
              <p>暂无案件，点击侧边栏"案件管理"开始创建</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {recentCases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectCase(c.id)}
                  className="p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`badge text-xs ${
                      c.status === 'pending' ? 'badge-yellow' :
                      c.status === 'in_progress' ? 'badge-blue' :
                      c.status === 'closed' ? 'badge-green' : 'badge-gray'
                    }`}>
                      {c.status === 'pending' ? '待处理' : c.status === 'in_progress' ? '办理中' : c.status === 'closed' ? '已结案' : '已归档'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {CASE_TYPE_LABELS[c.case_type as keyof typeof CASE_TYPE_LABELS]}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 truncate">{c.title}</p>
                  {c.court && <p className="text-sm text-gray-500 truncate mt-1">{c.court}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}