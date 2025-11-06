import { createApiClient } from './apiClient';

export async function getDatabaseStatus(token) {
  const api = createApiClient(token);
  const response = await api.get('/admin/database/status');
  return response.data;
}

export async function runMigrations(token) {
  const api = createApiClient(token);
  const response = await api.post('/admin/database/migrations/run', {});
  return response.data;
}

export async function rollbackMigrations(token) {
  const api = createApiClient(token);
  const response = await api.post('/admin/database/migrations/rollback', {});
  return response.data;
}

export async function runSeeds(token) {
  const api = createApiClient(token);
  const response = await api.post('/admin/database/seeds/run', {});
  return response.data;
}

export async function getTableStructure(token, tableName) {
  const api = createApiClient(token);
  const response = await api.get(`/admin/database/tables/${tableName}/structure`);
  return response.data;
}

