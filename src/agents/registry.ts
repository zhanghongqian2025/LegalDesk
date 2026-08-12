import registry from './registry.json';
import type { AgentDefinition } from '../types';

export const PI_REQUIRED_VERSION = registry.runtime.requiredVersion;
export const AGENT_REGISTRY: AgentDefinition[] = registry.agents;

export function getAgentDefinition(agentId: string): AgentDefinition | undefined {
  return AGENT_REGISTRY.find((agent) => agent.id === agentId);
}
