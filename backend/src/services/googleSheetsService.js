const { OAuth2Client } = require('google-auth-library');
const { getGoogleTokens } = require('./userRepo');

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

// Get Google OAuth client for token refresh
function getOAuthClient() {
	const clientId = process.env.GOOGLE_CLIENT_ID;
	const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
	
	if (!clientId || !clientSecret) {
		throw new Error('Google OAuth credentials not configured (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET).');
	}
	
	return new OAuth2Client(clientId, clientSecret);
}

// Refresh access token using refresh token
async function refreshAccessToken(refreshToken) {
	try {
		const oauth2Client = getOAuthClient();
		oauth2Client.setCredentials({ refresh_token: refreshToken });
		const { credentials } = await oauth2Client.refreshAccessToken();
		return credentials.access_token;
	} catch (error) {
		console.error('Error refreshing access token:', error);
		throw new Error('Failed to refresh access token. Please re-authenticate.');
	}
}

// Get valid access token for user (refresh if needed)
async function getValidAccessToken(userId) {
	const tokens = await getGoogleTokens(userId);
	
	if (!tokens || !tokens.accessToken) {
		throw new Error('Google access token not found. Please connect your Google account.');
	}
	
	// Check if token is expired
	if (tokens.expiresAt) {
		const expiresAt = new Date(tokens.expiresAt);
		const now = new Date();
		// Refresh if expires within 5 minutes
		if (expiresAt <= new Date(now.getTime() + 5 * 60 * 1000)) {
			if (tokens.refreshToken) {
				const newAccessToken = await refreshAccessToken(tokens.refreshToken);
				// Update stored token (expires in 1 hour typically)
				const { updateGoogleTokens } = require('./userRepo');
				await updateGoogleTokens(userId, {
					accessToken: newAccessToken,
					expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour from now
				});
				return newAccessToken;
			} else {
				throw new Error('Access token expired and no refresh token available. Please re-authenticate.');
			}
		}
	}
	
	return tokens.accessToken;
}

// Make authenticated request to Google Sheets API
async function makeSheetsRequest(userId, method, url, data = null) {
	const accessToken = await getValidAccessToken(userId);
	
	const axios = require('axios');
	const config = {
		method,
		url,
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	};
	
	if (data) {
		config.data = data;
	}
	
	try {
		const response = await axios(config);
		return response.data;
	} catch (error) {
		if (error.response?.status === 401) {
			throw new Error('Google authentication expired. Please reconnect your Google account.');
		}
		throw error;
	}
}

async function getSheetValues(userId, spreadsheetId, range) {
	if (!spreadsheetId) throw new Error('spreadsheetId is required');
	if (!range) throw new Error('range is required');
	if (!userId) throw new Error('userId is required');

	const url = `${SHEETS_BASE_URL}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;
	return await makeSheetsRequest(userId, 'GET', url);
}

async function updateSheetValues(userId, spreadsheetId, range, values, valueInputOption = 'RAW') {
	if (!spreadsheetId) throw new Error('spreadsheetId is required');
	if (!range) throw new Error('range is required');
	if (!Array.isArray(values)) throw new Error('values must be an array of arrays');
	if (!userId) throw new Error('userId is required');

	const url = `${SHEETS_BASE_URL}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?valueInputOption=${encodeURIComponent(valueInputOption)}`;
	return await makeSheetsRequest(userId, 'PUT', url, { values });
}

module.exports = {
	getSheetValues,
	updateSheetValues
};


