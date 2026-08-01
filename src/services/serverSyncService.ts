import { Project } from '../types';
import { PROJECTS, ABOUT_DATA } from '../data/portfolioData';

export interface FullBackupPayload {
  version: string;
  exportedAt: string;
  projects: Project[];
  aboutData: any;
  likes: Record<string, number>;
  guestbook: any[];
}

const CLOUD_RUN_BACKEND_URL = 'https://ais-pre-npfi3bhin65t45nidjshwv-434417124417.us-west2.run.app';

// Universal API Fetch with direct Cloud Run Backend Fallback for Cloudflare Pages / Workers
const cloudApiFetch = async (path: string, options: RequestInit = {}, timeoutMs = 4000): Promise<Response | null> => {
  // 1. Try relative request first
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(path, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return res;
      }
    }
  } catch (e) {
    // Relative request failed or timed out
  }

  // 2. If relative failed (e.g. static Cloudflare Pages hosting), fallback to Cloud Run Backend URL
  if (typeof window !== 'undefined') {
    try {
      const remoteUrl = `${CLOUD_RUN_BACKEND_URL}${path.startsWith('/') ? path : '/' + path}`;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(remoteUrl, { ...options, signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        return res;
      }
    } catch (err) {
      console.warn(`Remote backend API fallback notice (${path}):`, err);
    }
  }

  return null;
};

// 1. Fetch state from local/cloud express server API (/api/sync)
export const fetchServerSyncData = async (): Promise<FullBackupPayload | null> => {
  try {
    const res = await cloudApiFetch('/api/sync', {}, 3000);
    if (res && res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        const data = json.data as FullBackupPayload;
        // Ensure projects is never empty array
        if (!data.projects || !Array.isArray(data.projects) || data.projects.length === 0) {
          data.projects = PROJECTS;
        }
        if (!data.aboutData) {
          data.aboutData = ABOUT_DATA;
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Server sync notice (using local-first storage):', err);
  }
  return null;
};

// Direct Guestbook API Calls (Fast & Works everywhere including China & Cloudflare Pages/Workers)
export const fetchServerGuestbook = async (): Promise<any[] | null> => {
  try {
    const res = await cloudApiFetch('/api/guestbook', {}, 3000);
    if (res && res.ok) {
      const json = await res.json();
      if (json?.success && Array.isArray(json.messages)) {
        return json.messages;
      }
    }
  } catch (e) {
    console.warn('Fetch server guestbook notice:', e);
  }
  return null;
};

export const postServerGuestbook = async (msg: {
  authorName: string;
  email?: string;
  content: string;
  projectId?: string;
  projectTitle?: string;
}): Promise<any[] | null> => {
  try {
    const res = await cloudApiFetch('/api/guestbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    }, 5000);
    if (res && res.ok) {
      const json = await res.json();
      if (json?.success && Array.isArray(json.messages)) {
        return json.messages;
      }
    }
  } catch (e) {
    console.warn('Post server guestbook notice:', e);
  }
  return null;
};

export const deleteServerGuestbook = async (msgId: string): Promise<any[] | null> => {
  try {
    const res = await cloudApiFetch(`/api/guestbook/${encodeURIComponent(msgId)}`, {
      method: 'DELETE'
    }, 5000);
    if (res && res.ok) {
      const json = await res.json();
      if (json?.success && Array.isArray(json.messages)) {
        return json.messages;
      }
    }
  } catch (e) {
    console.warn('Delete server guestbook notice:', e);
  }
  return null;
};

// 2. Post updated state to express server API (/api/sync)
export const pushServerSyncData = async (payload: Partial<FullBackupPayload>): Promise<boolean> => {
  try {
    const existing = getLocalSnapshot();
    const finalProjects = (payload.projects && Array.isArray(payload.projects) && payload.projects.length > 0) ? payload.projects : existing.projects;
    const finalAboutData = payload.aboutData || existing.aboutData || ABOUT_DATA;

    const merged: FullBackupPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projects: finalProjects,
      aboutData: finalAboutData,
      likes: payload.likes || existing.likes,
      guestbook: payload.guestbook || existing.guestbook,
    };

    const res = await cloudApiFetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    }, 5000);

    return !!(res && res.ok);
  } catch (err) {
    console.warn('Server push notice:', err);
    return false;
  }
};

// Helper: Get local snapshot from localStorage
export const getLocalSnapshot = (): FullBackupPayload => {
  let projects: Project[] = [];
  let aboutData: any = null;
  let likes: Record<string, number> = {};
  let guestbook: any[] = [];

  try {
    const p = localStorage.getItem('qsi_custom_projects');
    if (p) {
      const parsed = JSON.parse(p);
      if (Array.isArray(parsed) && parsed.length > 0) {
        projects = parsed;
      }
    }
  } catch (e) {}

  if (!projects || projects.length === 0) {
    projects = PROJECTS;
  }

  try {
    const a = localStorage.getItem('qsi_custom_about_data');
    if (a) aboutData = JSON.parse(a);
  } catch (e) {}

  if (!aboutData) {
    aboutData = ABOUT_DATA;
  }

  try {
    const l = localStorage.getItem('qsi_cloud_likes_cache');
    if (l) likes = JSON.parse(l);
  } catch (e) {}

  try {
    const g = localStorage.getItem('qsi_guestbook_cache');
    if (g && Array.isArray(JSON.parse(g))) guestbook = JSON.parse(g);
  } catch (e) {}

  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    projects,
    aboutData,
    likes,
    guestbook,
  };
};

// Helper: Save snapshot directly to localStorage
export const saveLocalSnapshot = (snapshot: Partial<FullBackupPayload>) => {
  try {
    if (snapshot.projects && Array.isArray(snapshot.projects) && snapshot.projects.length > 0) {
      localStorage.setItem('qsi_custom_projects', JSON.stringify(snapshot.projects));
    }
    if (snapshot.aboutData) {
      localStorage.setItem('qsi_custom_about_data', JSON.stringify(snapshot.aboutData));
    }
    if (snapshot.likes) {
      localStorage.setItem('qsi_cloud_likes_cache', JSON.stringify(snapshot.likes));
    }
    if (snapshot.guestbook && Array.isArray(snapshot.guestbook)) {
      localStorage.setItem('qsi_guestbook_cache', JSON.stringify(snapshot.guestbook));
    }
  } catch (e) {
    console.error('Failed to save local snapshot:', e);
  }
};

// 3. Export JSON file for backup
export const exportDataJson = () => {
  const data = getLocalSnapshot();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);

  const a = document.createElement('a');
  a.href = url;
  a.download = `qsi_studio_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 4. Import JSON data and parse safely
export const importDataJson = async (jsonText: string): Promise<{ success: boolean; message: string; data?: FullBackupPayload }> => {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: '无效的 JSON 语法或空文件' };
    }

    const projects = Array.isArray(parsed.projects) ? parsed.projects : [];
    const aboutData = parsed.aboutData || null;
    const likes = parsed.likes || {};
    const guestbook = Array.isArray(parsed.guestbook) ? parsed.guestbook : [];

    const snapshot: FullBackupPayload = {
      version: parsed.version || '1.0.0',
      exportedAt: new Date().toISOString(),
      projects,
      aboutData,
      likes,
      guestbook,
    };

    saveLocalSnapshot(snapshot);
    await pushServerSyncData(snapshot);

    return {
      success: true,
      message: `成功导入: ${projects.length} 个作品, ${guestbook.length} 条留言记录`,
      data: snapshot,
    };
  } catch (err: any) {
    return { success: false, message: `解析 JSON 失败: ${err?.message || String(err)}` };
  }
};
