
import { apiClient } from './api-client';

// Keep the export named api for backward compatibility across existing services
export const api = apiClient.instance;

// Also export the default apiClient instance
export default apiClient;

