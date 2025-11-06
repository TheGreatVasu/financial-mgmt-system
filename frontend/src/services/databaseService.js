import apiClient from './apiClient';

export async function getDatabaseStatus(token) {
  const response = await apiClient.get('/admin/database/status', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export async function runMigrations(token) {
  const response = await apiClient.post('/admin/database/migrations/run', {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export async function rollbackMigrations(token) {
  const response = await apiClient.post('/admin/database/migrations/rollback', {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export async function runSeeds(token) {
  const response = await apiClient.post('/admin/database/seeds/run', {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export async function getTableStructure(token, tableName) {
  const response = await apiClient.get(`/admin/database/tables/${tableName}/structure`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

