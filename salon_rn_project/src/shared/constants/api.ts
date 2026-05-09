export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_SIGNUP: '/auth/signup',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_RESET_PASSWORD: '/auth/reset-password',

  // Users
  USERS: '/users',
  USER_PROFILE: '/users/profile',
  USER_ROLES: '/user-roles',

  // Salons
  SALONS: '/salons',
  SALON_BY_ID: (id: string) => `/salons/${id}`,
  SALON_STAFF: (id: string) => `/salons/${id}/staff`,
  SALON_SERVICES: (id: string) => `/salons/${id}/services`,
  SALON_CUSTOMERS: (id: string) => `/salons/${id}/customers`,
  SALON_STATS: (id: string) => `/salons/${id}/stats`,

  // Services
  SERVICES: '/services',
  SERVICE_BY_ID: (id: string) => `/services/${id}`,
  SERVICE_CATEGORIES: '/service-categories',

  // Staff
  STAFF: '/staff',
  STAFF_BY_ID: (id: string) => `/staff/${id}`,
  STAFF_SCHEDULE: (id: string) => `/staff/${id}/schedule`,
  STAFF_PERFORMANCE: (id: string) => `/staff/${id}/performance`,

  // Bookings
  BOOKINGS: '/bookings',
  BOOKING_BY_ID: (id: string) => `/bookings/${id}`,
  AVAILABLE_SLOTS: '/bookings/available-slots',

  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER_BY_ID: (id: string) => `/customers/${id}`,
  CUSTOMER_HISTORY: (id: string) => `/customers/${id}/history`,

  // Reports
  REPORTS_REVENUE: '/reports/revenue',
  REPORTS_BOOKINGS: '/reports/bookings',
  REPORTS_STAFF: '/reports/staff',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ROLE: 'user_role',
  SALON_ID: 'salon_id',
  THEME: 'app_theme',
  ONBOARDING_COMPLETE: 'onboarding_complete',
};

export const DATE_FORMATS = {
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_TIME: 'h:mm A',
  DISPLAY_DATETIME: 'MMM DD, YYYY h:mm A',
  API_DATE: 'YYYY-MM-DD',
  API_DATETIME: 'YYYY-MM-DDTHH:mm:ss',
};
