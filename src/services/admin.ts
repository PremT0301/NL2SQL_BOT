import api from './api';
import type { DashboardStats } from '../models/types';

export const adminService = {
    getStats: async (): Promise<DashboardStats> => {
        const response = await api.get('/admin/stats');
        return response.data;
    }
};
