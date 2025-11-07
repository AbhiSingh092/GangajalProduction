// Simple secure storage for admin session
const ADMIN_KEY = 'admin_authenticated';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Gangajal@2023' // You should change this password
};

export const login = (username: string, password: string): boolean => {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem(ADMIN_KEY, 'true');
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem(ADMIN_KEY);
};

export const isAuthenticated = (): boolean => {
  return localStorage.getItem(ADMIN_KEY) === 'true';
};