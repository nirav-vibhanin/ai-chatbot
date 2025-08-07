export interface UserData {
  id: string;
  email: string;
  name?: string;
}

export function getUserFromCookies(): UserData | null {
  try {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.id || payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    console.error('Error parsing user from cookies:', error);
    return null;
  }
}

export function getUserFromSessionStorage(): UserData | null {
  try {
    const userData = sessionStorage.getItem('user');
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user from session storage:', error);
    return null;
  }
}

export function saveUserToSessionStorage(user: UserData): void {
  try {
    sessionStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to session storage:', error);
  }
}

export function clearUserFromSessionStorage(): void {
  try {
    sessionStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing user from session storage:', error);
  }
}

export function getCurrentUser(): UserData | null {
  const sessionUser = getUserFromSessionStorage();
  if (sessionUser) return sessionUser;

  const cookieUser = getUserFromCookies();
  if (cookieUser) {
    saveUserToSessionStorage(cookieUser);
    return cookieUser;
  }

  return null;
}

export function isUserAuthenticated(): boolean {
  const user = getCurrentUser();
  const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
  return !!(user && token);
} 