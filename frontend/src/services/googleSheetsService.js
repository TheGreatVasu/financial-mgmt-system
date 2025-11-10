import { createApiClient } from './apiClient';

export function createGoogleSheetsService(token) {
  const api = createApiClient(token);
  return {
    fetchValues(spreadsheetId, range) {
      return api.get('/google-sheets/values', { params: { spreadsheetId, range } })
        .then(res => res.data?.data);
    },
    updateValues(spreadsheetId, range, values, valueInputOption = 'RAW') {
      return api.put('/google-sheets/values', { spreadsheetId, range, values, valueInputOption })
        .then(res => res.data?.data);
    }
  };
}


