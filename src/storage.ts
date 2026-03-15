import { Developer, AppEntry } from './types';

const KEYS = {
  DEVELOPERS: 'droidmarket_developers',
  APPS: 'droidmarket_apps',
  CURRENT_USER: 'droidmarket_current_user',
  ADMIN_AUTH: 'droidmarket_admin_auth'
};

export const storage = {
  initialize: async () => {
    const appsData = localStorage.getItem(KEYS.APPS);
    if (!appsData) {
      try {
        const response = await fetch('./apps.json');
        const data = await response.json();
        if (data && data.apps) {
          localStorage.setItem(KEYS.APPS, JSON.stringify(data.apps));
        }
      } catch (error) {
        console.error('Failed to load initial apps.json', error);
      }
    }
  },

  getDevelopers: (): Developer[] => {
    const data = localStorage.getItem(KEYS.DEVELOPERS);
    return data ? JSON.parse(data) : [];
  },
  
  saveDeveloper: (dev: Developer) => {
    const devs = storage.getDevelopers();
    devs.push(dev);
    localStorage.setItem(KEYS.DEVELOPERS, JSON.stringify(devs));
  },

  getApps: (): AppEntry[] => {
    const data = localStorage.getItem(KEYS.APPS);
    return data ? JSON.parse(data) : [];
  },

  saveApp: (app: AppEntry) => {
    const apps = storage.getApps();
    apps.push(app);
    localStorage.setItem(KEYS.APPS, JSON.stringify(apps));

    // Increment developer's app count
    const devs = storage.getDevelopers();
    const devIndex = devs.findIndex(d => d.developerId === app.developerId);
    if (devIndex !== -1) {
      devs[devIndex].appsUploaded = (devs[devIndex].appsUploaded || 0) + 1;
      localStorage.setItem(KEYS.DEVELOPERS, JSON.stringify(devs));
      
      // Update current user if it's the same person
      const currentUser = storage.getCurrentUser();
      if (currentUser && currentUser.developerId === app.developerId) {
        storage.setCurrentUser(devs[devIndex]);
      }
    }
  },

  updateAppStatus: (appId: string, status: 'approved' | 'rejected' | 'pending') => {
    const apps = storage.getApps();
    const index = apps.findIndex(a => a.appId === appId);
    if (index !== -1) {
      apps[index].status = status;
      localStorage.setItem(KEYS.APPS, JSON.stringify(apps));
    }
  },

  deleteApp: (appId: string) => {
    const apps = storage.getApps();
    const filtered = apps.filter(a => a.appId !== appId);
    localStorage.setItem(KEYS.APPS, JSON.stringify(filtered));
  },

  setCurrentUser: (dev: Developer | null) => {
    if (dev) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(dev));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  getCurrentUser: (): Developer | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setAdminAuth: (isAdmin: boolean) => {
    localStorage.setItem(KEYS.ADMIN_AUTH, JSON.stringify(isAdmin));
  },

  getAdminAuth: (): boolean => {
    const data = localStorage.getItem(KEYS.ADMIN_AUTH);
    return data ? JSON.parse(data) : false;
  }
};
