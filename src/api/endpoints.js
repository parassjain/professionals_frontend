import api from './client';

// Auth
export const login = (email, password) =>
  api.post('/auth/login/', { email, password });

export const register = (data) =>
  api.post('/auth/registration/', data);

export const googleLogin = (code) =>
  api.post('/users/google/', { code });

export const refreshToken = (refresh) =>
  api.post('/auth/token/refresh/', { refresh });

export const logout = () =>
  api.post('/auth/logout/');

// Users
export const getCurrentUser = () =>
  api.get('/users/me/');

export const verifyEmail = (key) =>
  api.post('/auth/registration/verify-email/', { key });

export const getSiteStats = () =>
  api.get('/users/stats/');

export const updateCurrentUser = (data) =>
  api.patch('/users/me/', data);

export const updateCurrentUserWithFile = (formData) =>
  api.patch('/users/me/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getPublicUser = (id) =>
  api.get(`/users/${id}/`);

export const getUserContact = (public_id) =>
  api.get(`/users/${public_id}/contact/`);

export const getSocialLinks = () =>
  api.get('/users/social-links/');

export const addSocialLink = (data) =>
  api.post('/users/social-links/', data);

export const deleteSocialLink = (id) =>
  api.delete(`/users/social-links/${id}/`);

// Categories
export const getCategories = () =>
  api.get('/categories/');

export const getAllCategories = () =>
  api.get('/categories/all/');

export const getPopularServices = () =>
  api.get('/categories/popular/');

export const getCategory = (slug) =>
  api.get(`/categories/${slug}/`);

export const createCategory = (data) =>
  api.post('/categories/', data, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateCategory = (slug, data) =>
  api.patch(`/categories/${slug}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteCategory = (slug) =>
  api.delete(`/categories/${slug}/`);

// Professionals
export const getProfessionals = (params) =>
  api.get('/professionals/', { params });

export const getProfessional = (id) =>
  api.get(`/professionals/${id}/`);

export const createProfessionalProfile = (data) =>
  api.post('/professionals/', data);

export const updateProfessionalProfile = (id, data) =>
  api.patch(`/professionals/${id}/`, data);

export const deleteProfessionalProfile = (id) =>
  api.delete(`/professionals/${id}/`);

export const revealContact = (id) =>
  api.post(`/professionals/${id}/contact/`);

export const getMyProfessionalProfile = () =>
  api.get('/professionals/mine/');

export const adminListProfessionals = () =>
  api.get('/professionals/admin-list/');

export const adminCreateProfessional = (data) =>
  api.post('/professionals/admin-create/', data);

export const adminVerifyProfessional = (id, is_verified) =>
  api.patch(`/professionals/${id}/`, { is_verified });

export const addPortfolioImage = (proId, formData) =>
  api.post(`/professionals/${proId}/portfolio/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deletePortfolioImage = (proId, imgId) =>
  api.delete(`/professionals/${proId}/portfolio/${imgId}/`);

// Jobs
export const getJobs = (params) =>
  api.get('/jobs/', { params });

export const getMyJobs = () =>
  api.get('/jobs/mine/');

export const getJob = (id) =>
  api.get(`/jobs/${id}/`);

export const createJob = (data) =>
  api.post('/jobs/', data);

export const updateJob = (id, data) =>
  api.patch(`/jobs/${id}/`, data);

export const deleteJob = (id) =>
  api.delete(`/jobs/${id}/`);

// Reviews
export const getReviews = (params) =>
  api.get('/reviews/', { params });

export const getMyGivenReviews = () =>
  api.get('/reviews/my-given/');

export const getMyReceivedReviews = () =>
  api.get('/reviews/my-received/');

export const getReview = (id) =>
  api.get(`/reviews/${id}/`);

export const createReview = (data) =>
  api.post('/reviews/', data, { headers: { 'Content-Type': 'multipart/form-data' } });

export const updateReview = (id, data) =>
  api.patch(`/reviews/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteReview = (id) =>
  api.delete(`/reviews/${id}/`);

// Contact / Feedback
export const submitFeedback = (data) =>
  api.post('/contact/', data);
