import api from './axios';

export const getAllInspectors = async () => {
  const { data } = await api.get('/inspectors');
  return data;
};
