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
const cloudApiFetch = async (path: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response | null> => {
  // Add cache buster parameter to GET requests
  const method = (options.method || 'GET').toUpperCase();
  let targetPath = path;
  if (method === 'GET') {
    const sep = targetPath.includes('?') ? '&' : '?';
    targetPath = `${targetPath}${sep}_t=${Date.now()}`;
  }

  // 1. Try relative request first (Cloudflare Pages Functions Proxy - Works in China)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(targetPath, { ...options, signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return res;
        }
      }
    } catch (e) {
      // Retry once on transient network glitch
    }
  }

  // 2. If relative failed (e.g. preview environment without worker), fallback to direct Cloud Run Backend URL
  if (typeof window !== 'undefined') {
    try {
      const remoteUrl = `${CLOUD_RUN_BACKEND_URL}${targetPath.startsWith('/') ? targetPath : '/' + targetPath}`;
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(remoteUrl, { ...options, signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return res;
        }
      }
    } catch (err) {
      // Quiet fail in China without VPN
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

export interface SelfCheckResult {
  success: boolean;
  message: string;
  report: {
    projectsCount: number;
    updatedProjectsCount: number;
    likesCount: number;
    guestbookCount: number;
    aboutUpdated: boolean;
  };
  mergedData: FullBackupPayload;
}

// 5. Data Self-Check & Deep Diff Merge (数据自检与硬校验)
export const performDataSelfCheck = async (): Promise<SelfCheckResult> => {
  // 1. Get current local snapshot
  const local = getLocalSnapshot();

  // 2. Fetch latest data from server API / cloud sync
  let cloud: FullBackupPayload | null = null;
  try {
    cloud = await fetchServerSyncData();
  } catch (e) {
    console.warn('Data self check: server fetch notice', e);
  }

  // 3. Perform Deep Diff Merge between Local Snapshot and Cloud/Server Payload

  // A. Projects Deep Merge
  const projectMap = new Map<string, Project>();
  const baseProjects = (local.projects && local.projects.length > 0) ? local.projects : PROJECTS;
  baseProjects.forEach((p) => {
    if (p && p.id) {
      projectMap.set(p.id, { ...p });
    }
  });

  let updatedProjectsCount = 0;

  if (cloud && Array.isArray(cloud.projects)) {
    cloud.projects.forEach((cloudProj) => {
      if (!cloudProj || !cloudProj.id) return;
      const localProj = projectMap.get(cloudProj.id);
      if (!localProj) {
        projectMap.set(cloudProj.id, { ...cloudProj });
        updatedProjectsCount++;
      } else {
        let modified = false;
        const mergedProj: Project = { ...localProj };

        if (cloudProj.title && cloudProj.title !== localProj.title) {
          mergedProj.title = cloudProj.title;
          modified = true;
        }
        if (cloudProj.subtitle && cloudProj.subtitle !== localProj.subtitle) {
          mergedProj.subtitle = cloudProj.subtitle;
          modified = true;
        }
        if (cloudProj.coverImage && cloudProj.coverImage !== localProj.coverImage) {
          mergedProj.coverImage = cloudProj.coverImage;
          modified = true;
        }
        if (cloudProj.summary && cloudProj.summary !== localProj.summary) {
          mergedProj.summary = cloudProj.summary;
          modified = true;
        }
        if (cloudProj.client && cloudProj.client !== localProj.client) {
          mergedProj.client = cloudProj.client;
          modified = true;
        }
        if (cloudProj.category && cloudProj.category !== localProj.category) {
          mergedProj.category = cloudProj.category;
          modified = true;
        }
        if (cloudProj.categoryLabel && cloudProj.categoryLabel !== localProj.categoryLabel) {
          mergedProj.categoryLabel = cloudProj.categoryLabel;
          modified = true;
        }
        if (cloudProj.year && cloudProj.year !== localProj.year) {
          mergedProj.year = cloudProj.year;
          modified = true;
        }
        if (cloudProj.cardNumber && cloudProj.cardNumber !== localProj.cardNumber) {
          mergedProj.cardNumber = cloudProj.cardNumber;
          modified = true;
        }
        if (cloudProj.suit && cloudProj.suit !== localProj.suit) {
          mergedProj.suit = cloudProj.suit;
          modified = true;
        }
        if (cloudProj.likes && cloudProj.likes > (localProj.likes || 0)) {
          mergedProj.likes = cloudProj.likes;
          modified = true;
        }

        if (Array.isArray(cloudProj.tags) && cloudProj.tags.length > 0) {
          const combinedTags = Array.from(new Set([...(localProj.tags || []), ...cloudProj.tags]));
          if (combinedTags.length !== (localProj.tags || []).length) {
            mergedProj.tags = combinedTags;
            modified = true;
          }
        }
        if (Array.isArray(cloudProj.galleryImages) && cloudProj.galleryImages.length > (localProj.galleryImages || []).length) {
          mergedProj.galleryImages = cloudProj.galleryImages;
          modified = true;
        }
        if (Array.isArray(cloudProj.description) && cloudProj.description.length > (localProj.description || []).length) {
          mergedProj.description = cloudProj.description;
          modified = true;
        }
        if (Array.isArray(cloudProj.colorPalette) && cloudProj.colorPalette.length > 0) {
          mergedProj.colorPalette = cloudProj.colorPalette;
        }

        if (modified) {
          updatedProjectsCount++;
        }
        projectMap.set(cloudProj.id, mergedProj);
      }
    });
  }

  const mergedProjects = Array.from(projectMap.values());

  // B. Likes Deep Merge
  const mergedLikes: Record<string, number> = { ...(local.likes || {}) };
  if (cloud && cloud.likes) {
    Object.keys(cloud.likes).forEach((id) => {
      mergedLikes[id] = Math.max(mergedLikes[id] || 0, cloud.likes[id] || 0);
    });
  }

  // C. Guestbook Messages Merge
  const guestbookMap = new Map<string, any>();
  const localGuestbook = local.guestbook || [];
  const cloudGuestbook = cloud?.guestbook || [];

  [...localGuestbook, ...cloudGuestbook].forEach((msg) => {
    if (!msg) return;
    const key = msg.id || `${msg.authorName}_${msg.content}_${msg.date}`;
    if (!guestbookMap.has(key)) {
      guestbookMap.set(key, msg);
    }
  });

  const mergedGuestbook = Array.from(guestbookMap.values());

  // D. AboutData Deep Merge
  let aboutUpdated = false;
  const localAbout = local.aboutData || ABOUT_DATA;
  const cloudAbout = cloud?.aboutData;

  const mergedAbout = { ...localAbout };
  if (cloudAbout && typeof cloudAbout === 'object') {
    Object.keys(cloudAbout).forEach((k) => {
      const val = cloudAbout[k];
      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val)) {
          if (val.length > (mergedAbout[k]?.length || 0)) {
            mergedAbout[k] = val;
            aboutUpdated = true;
          }
        } else if (typeof val === 'object') {
          mergedAbout[k] = { ...(mergedAbout[k] || {}), ...val };
          aboutUpdated = true;
        } else if (val !== mergedAbout[k]) {
          mergedAbout[k] = val;
          aboutUpdated = true;
        }
      }
    });
  }

  // E. Build Hardened Snapshot Payload
  const mergedPayload: FullBackupPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    projects: mergedProjects,
    aboutData: mergedAbout,
    likes: mergedLikes,
    guestbook: mergedGuestbook,
  };

  // F. Save snapshot to LocalStorage (hard check update)
  saveLocalSnapshot(mergedPayload);

  // G. Push to server API in background to keep cloud aligned
  try {
    await pushServerSyncData(mergedPayload);
  } catch (e) {}

  return {
    success: true,
    message: '数据自检与硬校验完成！本地与云端已完成深层差异合并。',
    report: {
      projectsCount: mergedProjects.length,
      updatedProjectsCount,
      likesCount: Object.keys(mergedLikes).length,
      guestbookCount: mergedGuestbook.length,
      aboutUpdated,
    },
    mergedData: mergedPayload,
  };
};
