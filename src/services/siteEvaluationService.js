import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/site-evaluation-reports';
const COLLECTION_SESSIONS_URL = 'http://localhost:5000/collection-sessions';
const API_BASE_FETCH='http://localhost:5000/site-evaluation-reports'

// Fetch all collection sessions
export const fetchCollectionSessions = async () => {
  try {
    const response = await axios.get(COLLECTION_SESSIONS_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching collection sessions:', error);
    throw new Error('Failed to fetch collection sessions');
  }
};

// Create a new site evaluation report
export const createSiteEvaluationReport = async (reportData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, reportData);
    return response.data;
  } catch (error) {
    console.error('Error creating site evaluation report:', error);
    throw new Error('Failed to create site evaluation report');
  }
};

// Fetch all site evaluation reports
export const fetchSiteEvaluationReports = async () => {
  try {
    const response = await axios.get(`${API_BASE_FETCH}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching site evaluation reports:', error);
    throw new Error('Failed to fetch site evaluation reports');
  }
};

// Fetch a single site evaluation report by ID
export const fetchSiteEvaluationReportById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/site-evaluation-reports/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching site evaluation report:', error);
    throw new Error('Failed to fetch site evaluation report');
  }
};

// Update a site evaluation report
export const updateSiteEvaluationReport = async (id, reportData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/site-evaluation-reports/${id}`, reportData);
    return response.data;
  } catch (error) {
    console.error('Error updating site evaluation report:', error);
    throw new Error('Failed to update site evaluation report');
  }
};

// Delete a site evaluation report
export const deleteSiteEvaluationReport = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/site-evaluation-reports/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting site evaluation report:', error);
    throw new Error('Failed to delete site evaluation report');
  }
};