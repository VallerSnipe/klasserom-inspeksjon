import api from './axios';

export const getAllClassrooms = async () => {
  const { data } = await api.get('/classrooms');
  return data;
};

export const getClassroomInspections = async (id, params = {}) => {
  const { data } = await api.get(`/classrooms/${id}/inspections`, { params });
  return data;
};

export const getClassroomLatestStatus = async (id) => {
  const { data } = await api.get(`/classrooms/${id}/status`);
  return data;
};
