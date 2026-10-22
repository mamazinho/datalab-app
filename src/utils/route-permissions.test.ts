import { describe, expect, it } from 'vitest';
import type { IRoutePermission } from '../services/datalab-api/usersResource';
import {
  AGENT_ROUTE_PERMISSIONS,
  MCP_SERVER_ROUTE_PERMISSIONS,
  isAgentsRoutePermission,
  matchesRoutePermission,
  normalizeRoutePath,
  toRoutePermission,
} from './route-permissions';

const buildPermission = (overrides: Partial<IRoutePermission> = {}): IRoutePermission => ({
  id: '11111111-1111-1111-1111-111111111111',
  method: 'POST',
  path: '/v1/agents/',
  name: 'create_agent',
  description: '',
  tag: 'agents',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('normalizeRoutePath', () => {
  it('strips the v1 prefix and normalizes slashes', () => {
    expect(normalizeRoutePath('/v1/agents')).toBe('/agents/');
    expect(normalizeRoutePath('agents//')).toBe('/agents/');
  });

  it('unifies parameter placeholders', () => {
    expect(normalizeRoutePath('/v1/agents/{agent_id}/company-state/')).toBe(
      '/agents/{param}/company-state/',
    );
    expect(normalizeRoutePath('agents/{id}/')).toBe(normalizeRoutePath('/v1/agents/{agent_id}'));
  });

  it('falls back to "/" for an empty or prefix-only path', () => {
    expect(normalizeRoutePath('')).toBe('/');
    expect(normalizeRoutePath('/v1/')).toBe('/');
  });
});

describe('matchesRoutePermission', () => {
  it('matches by name when the backend sent one', () => {
    const permission = buildPermission({ name: 'create_agent', method: 'GET', path: '/outra/' });

    expect(matchesRoutePermission(permission, { name: 'create_agent', method: 'POST', path: 'agents/' })).toBe(true);
  });

  it('matches by method plus normalized path when there is no name', () => {
    expect(matchesRoutePermission(buildPermission(), AGENT_ROUTE_PERMISSIONS.create)).toBe(true);
  });

  it('ignores method casing', () => {
    const permission = buildPermission({ method: 'post' });

    expect(matchesRoutePermission(permission, AGENT_ROUTE_PERMISSIONS.create)).toBe(true);
  });

  it('does not match when the method differs', () => {
    const permission = buildPermission({ method: 'DELETE' });

    expect(matchesRoutePermission(permission, AGENT_ROUTE_PERMISSIONS.create)).toBe(false);
  });

  it('tells the MCP server routes apart from the agent ones', () => {
    const updateMcpServer = buildPermission({
      name: 'agent:update-mcp-server',
      method: 'PATCH',
      path: '/v1/agents/mcp-servers/{mcp_server_id}/',
    });
    const updateAgent = buildPermission({
      name: 'agent:update',
      method: 'PATCH',
      path: '/v1/agents/{agent_id}/',
    });

    expect(matchesRoutePermission(updateMcpServer, MCP_SERVER_ROUTE_PERMISSIONS.update)).toBe(true);
    expect(matchesRoutePermission(updateMcpServer, AGENT_ROUTE_PERMISSIONS.update)).toBe(false);
    expect(matchesRoutePermission(updateAgent, MCP_SERVER_ROUTE_PERMISSIONS.update)).toBe(false);
  });

  it('separates listing from creating MCP servers on the same path', () => {
    const listMcpServers = buildPermission({ name: 'agent:list-mcp-servers', method: 'GET', path: '/v1/agents/mcp-servers/' });

    expect(matchesRoutePermission(listMcpServers, MCP_SERVER_ROUTE_PERMISSIONS.list)).toBe(true);
    expect(matchesRoutePermission(listMcpServers, MCP_SERVER_ROUTE_PERMISSIONS.create)).toBe(false);
  });
});

describe('toRoutePermission', () => {
  it('accepts the flattened permission', () => {
    const permission = buildPermission();

    expect(toRoutePermission(permission)).toBe(permission);
  });

  it('accepts the permission nested under route_permission', () => {
    const permission = buildPermission();

    expect(toRoutePermission({ id: 'x', route_permission: permission })).toBe(permission);
  });

  it.each([
    ['null', null],
    ['string', 'agents'],
    ['object without method/path', { name: 'create_agent' }],
    ['invalid route_permission', { route_permission: null }],
  ])('discards invalid entry: %s', (_case, entry) => {
    expect(toRoutePermission(entry)).toBeNull();
  });
});

describe('isAgentsRoutePermission', () => {
  it('recognizes it by tag', () => {
    expect(isAgentsRoutePermission(buildPermission({ tag: 'agents', path: '/v1/outra/' }))).toBe(true);
  });

  it('recognizes it by path when the tag is empty', () => {
    expect(isAgentsRoutePermission(buildPermission({ tag: null, path: '/v1/agents/{agent_id}/' }))).toBe(true);
  });

  it('counts the MCP server routes as agents routes', () => {
    expect(isAgentsRoutePermission(buildPermission({ tag: null, path: '/v1/agents/mcp-servers/' }))).toBe(true);
  });

  it('rejects a route from another resource', () => {
    expect(isAgentsRoutePermission(buildPermission({ tag: 'companies', path: '/v1/companies/' }))).toBe(false);
  });
});
