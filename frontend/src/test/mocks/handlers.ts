import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3000';

export const handlers = [
  // Auth endpoints
  http.post(`${API_URL}/auth/signup`, () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: undefined,
      },
    });
  }),

  http.post(`${API_URL}/auth/login`, () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: undefined,
        activeCompanyId: 'company-1',
        activeCompany: {
          id: 'company-1',
          name: 'Test Company',
          logo: undefined,
          slug: 'test-company',
        },
      },
    });
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({});
  }),

  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      avatar: undefined,
      activeCompanyId: 'company-1',
      activeCompany: {
        id: 'company-1',
        name: 'Test Company',
        logo: undefined,
        slug: 'test-company',
      },
    });
  }),

  http.post(`${API_URL}/auth/accept-invite`, () => {
    return HttpResponse.json({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: undefined,
      },
    });
  }),

  // Company endpoints
  http.get(`${API_URL}/companies`, () => {
    return HttpResponse.json([
      {
        id: 'company-1',
        name: 'Test Company',
        logo: undefined,
        slug: 'test-company',
      },
    ]);
  }),

  http.get(`${API_URL}/companies/:id`, () => {
    return HttpResponse.json({
      id: 'company-1',
      name: 'Test Company',
      logo: undefined,
      slug: 'test-company',
    });
  }),

  http.post(`${API_URL}/companies`, () => {
    return HttpResponse.json({
      id: 'company-1',
      name: 'New Company',
      logo: undefined,
      slug: 'new-company',
    });
  }),

  // Invite endpoints
  http.get(`${API_URL}/invites/my-pending`, () => {
    return HttpResponse.json([]);
  }),
];

