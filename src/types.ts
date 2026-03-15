export interface Developer {
  developerId: string;
  name: string;
  email: string;
  password?: string; // Added for login verification
  joinDate: string;
  appsUploaded: number; // Changed from apps array to count
}

export interface AppEntry {
  appId: string;
  developerId: string;
  name: string;
  developerName: string;
  description: string;
  version: string;
  category: string;
  icon: string; // This will store the icon_url
  icon_url: string; // Explicitly requested
  apk_url: string; // Explicitly requested
  screenshots: string[];
  telegramFileId: string;
  downloadUrl: string; // This will store the apk_url
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  permissions: string;
}

export interface AuthState {
  user: Developer | null;
  isAdmin: boolean;
}
