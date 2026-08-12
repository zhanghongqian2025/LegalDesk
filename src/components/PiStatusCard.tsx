import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, RefreshCw, TerminalSquare } from 'lucide-react';
import { getPiStatus } from '../ai/piClient';
import type { PiRuntimeStatus } from '../types';

export function PiStatusCard() {
  const [status, setStatus] = useState<PiRuntimeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await getPiStatus());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ready = status?.ready === true;

  return (
    <section className="card p-6" aria-labelledby="pi-runtime-heading">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`status-icon ${ready ? 'status-icon-ready' : 'status-icon-warning'}`}>
            {ready ? <CheckCircle2 size={20} /> : <CircleAlert size={20} />}
          </div>
          <div>
            <h2 id="pi-runtime-heading" className="font-semibold text-gray-900">Pi 运行时</h2>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? '正在检测本机运行时…' : status?.message || '暂时无法读取运行时状态'}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={() => void refresh()}
          disabled={loading}
          aria-label="重新检测 Pi 运行时"
          title="重新检测"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <dl className="runtime-grid mt-5">
        <div>
          <dt>固定版本</dt>
          <dd>{status?.required_version || '0.84.1'}</dd>
        </div>
        <div>
          <dt>当前版本</dt>
          <dd>{status?.version || '未检测到'}</dd>
        </div>
        <div>
          <dt>执行入口</dt>
          <dd className="font-mono">{status?.binary || 'pi'}</dd>
        </div>
      </dl>

      {!ready && !loading && (
        <div className="runtime-help mt-5">
          <TerminalSquare size={17} />
          <div>
            <p className="font-medium text-gray-800">显式安装，不使用项目生命周期脚本</p>
            <code>npm install -g --ignore-scripts @earendil-works/pi-coding-agent@0.84.1</code>
          </div>
        </div>
      )}
    </section>
  );
}
