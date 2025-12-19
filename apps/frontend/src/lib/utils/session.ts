export const generateSessionToken = (): string => {
  return crypto.randomUUID();
};

export const getGuestSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  const stored = localStorage.getItem('guestSessionId');
  if (stored) return stored;
  
  const newId = crypto.randomUUID();
  localStorage.setItem('guestSessionId', newId);
  return newId;
};

export const setGuestSessionId = (id: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('guestSessionId', id);
};
