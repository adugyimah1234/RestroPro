import ApiClient from '../helpers/ApiClient';

const API_BASE = '/branches';

export const getBranches = () => ApiClient.get(API_BASE);
export const createBranch = (data) => ApiClient.post(API_BASE, data);
export const updateBranch = (id, data) => ApiClient.put(`${API_BASE}/${id}`, data);
export const deleteBranch = (id) => ApiClient.delete(`${API_BASE}/${id}`);