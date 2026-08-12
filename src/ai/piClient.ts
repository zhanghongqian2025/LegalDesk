import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type {
  AgentArtifact,
  AgentEventEnvelope,
  AgentRun,
  PiRuntimeStatus,
  StartAgentRunInput,
} from '../types';

const AGENT_EVENT = 'legaldesk-agent-event';

export function getPiStatus(): Promise<PiRuntimeStatus> {
  return invoke<PiRuntimeStatus>('get_pi_status');
}

export function startAgentRun(input: StartAgentRunInput): Promise<AgentRun> {
  return invoke<AgentRun>('start_agent_run', { input });
}

export function cancelAgentRun(runId: string): Promise<void> {
  return invoke('cancel_agent_run', { runId });
}

export function getAgentRuns(caseId?: string): Promise<AgentRun[]> {
  return invoke<AgentRun[]>('get_agent_runs', { caseId: caseId || null });
}

export function getAgentArtifacts(runId: string): Promise<AgentArtifact[]> {
  return invoke<AgentArtifact[]>('get_agent_artifacts', { runId });
}

export function listenAgentEvents(
  handler: (event: AgentEventEnvelope) => void,
): Promise<UnlistenFn> {
  return listen<AgentEventEnvelope>(AGENT_EVENT, (event) => handler(event.payload));
}
