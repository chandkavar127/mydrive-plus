const DRIVE_EVENT = 'drive:refresh';

export const emitDriveRefresh = (scope = 'all') => {
  window.dispatchEvent(new CustomEvent(DRIVE_EVENT, { detail: { scope, timestamp: Date.now() } }));
};

export const subscribeDriveRefresh = (handler) => {
  window.addEventListener(DRIVE_EVENT, handler);
  return () => window.removeEventListener(DRIVE_EVENT, handler);
};
