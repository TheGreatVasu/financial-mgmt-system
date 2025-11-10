const { JWT } = require('google-auth-library');

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

function getServiceAccountCredentials() {
	const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
	const privateKey = process.env.GOOGLE_PRIVATE_KEY
		? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
		: undefined;

	if (!clientEmail || !privateKey) {
		throw new Error('Google service account credentials are not configured (GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY).');
	}
	return { clientEmail, privateKey };
}

async function getAuthorizedClient() {
	const { clientEmail, privateKey } = getServiceAccountCredentials();
	const client = new JWT({
		email: clientEmail,
		key: privateKey,
		scopes: [SHEETS_SCOPE]
	});
	// Ensure token is fetched once up-front
	await client.authorize();
	return client;
}

async function getSheetValues(spreadsheetId, range) {
	if (!spreadsheetId) throw new Error('spreadsheetId is required');
	if (!range) throw new Error('range is required');

	const client = await getAuthorizedClient();
	const url = `${SHEETS_BASE_URL}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;
	const res = await client.request({ url, method: 'GET' });
	return res.data; // { range, majorDimension, values }
}

async function updateSheetValues(spreadsheetId, range, values, valueInputOption = 'RAW') {
	if (!spreadsheetId) throw new Error('spreadsheetId is required');
	if (!range) throw new Error('range is required');
	if (!Array.isArray(values)) throw new Error('values must be an array of arrays');

	const client = await getAuthorizedClient();
	const url = `${SHEETS_BASE_URL}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=${encodeURIComponent(valueInputOption)}`;
	const res = await client.request({
		url,
		method: 'PUT',
		data: {
			values
		}
	});
	return res.data; // update response
}

module.exports = {
	getSheetValues,
	updateSheetValues
};


