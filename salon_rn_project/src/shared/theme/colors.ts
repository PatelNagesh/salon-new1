export const colors = {
  primary: '#007bff',
  primaryDark: '#0056b3',
  primaryLight: '#b3d7ff',

  secondary: '#6c757d',
  secondaryDark: '#545b62',
  secondaryLight: '#adb5bd',

  success: '#28a745',
  successDark: '#1e7e34',
  successLight: '#d4edda',

  danger: '#dc3545',
  dangerDark: '#bd2130',
  dangerLight: '#f8d7da',

  warning: '#ffc107',
  warningDark: '#d39e00',
  warningLight: '#fff3cd',

  info: '#17a2b8',
  infoDark: '#138496',
  infoLight: '#d1ecf1',

  light: '#f8f9fa',
  lighter: '#ffffff',
  dark: '#343a40',
  darker: '#212529',

  text: {
    primary: '#212529',
    secondary: '#6c757d',
    tertiary: '#adb5bd',
    inverse: '#ffffff',
  },

  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    tertiary: '#e9ecef',
  },

  border: {
    light: '#dee2e6',
    medium: '#ced4da',
    dark: '#adb5bd',
  },

  status: {
    scheduled: '#007bff',
    completed: '#28a745',
    cancelled: '#dc3545',
    'no-show': '#ffc107',
    pending: '#17a2b8',
  },

  role: {
    super_admin: '#6f42c1',
    owner: '#007bff',
    staff: '#28a745',
    customer: '#17a2b8',
    vendor: '#fd7e14',
  },
};

export type ColorKey = keyof typeof colors;
