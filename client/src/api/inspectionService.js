import api from './axios';

export const createInspection = async (payload) => {
  const { data } = await api.post('/inspections', payload);
  return data;
};

// List inspections with related classroom and inspector
export const listInspections = async () => {
  const { data } = await api.get('/inspections');
  return data;
};

export const getInspection = async (id) => {
  const { data } = await api.get(`/inspections/${id}`);
  return data;
};

export const updateInspection = async (id, payload) => {
  const { data } = await api.put(`/inspections/${id}`, payload);
  return data;
};
