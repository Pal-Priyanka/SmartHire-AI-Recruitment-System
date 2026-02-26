const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const USER_API_END_POINT = `${BASE_URL}/users`;
export const AUTH_API_END_POINT = `${BASE_URL}/auth`;
export const JOB_API_END_POINT = `${BASE_URL}/jobs`;
export const APPLICATION_API_END_POINT = `${BASE_URL}/applications`;
export const COMPANY_API_END_POINT = `${BASE_URL}/companies`;
export const INTERVIEW_API_END_POINT = `${BASE_URL}/interviews`;
export const ANALYTICS_API_END_POINT = `${BASE_URL}/analytics`;
export const NOTIFICATION_API_END_POINT = `${BASE_URL}/notifications`;