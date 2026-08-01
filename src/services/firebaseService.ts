import {
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db, ensureAuth } from '../lib/firebase';
import { Project } from '../types';
import {
  fetchServerGuestbook,
  postServerGuestbook,
  deleteServerGuestbook,
  getLocalSnapshot,
  saveLocalSnapshot
} from './serverSyncService';

export interface GuestMessage {
  id?: string;
  authorName: string;
  email?: string;
  content: string;
  projectId?: string;
  projectTitle?: string;
  avatarSuit?: 'spade' | 'heart' | 'diamond' | 'club';
  createdAt?: any;
  date?: string;
  userId?: string;
}

// 1. GUESTBOOK MESSAGES (访客留言/改动建议 - 混合同步：保障中国大陆与Cloudflare极速无阻)
export const subscribeGuestMessages = (
  callback: (messages: GuestMessage[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  // 1. Instantly return local cached messages & fetch from server
  const cached = getLocalSnapshot().guestbook || [];
  if (cached.length > 0) {
    callback(cached as GuestMessage[]);
  }

  // Fetch from Express server API
  fetchServerGuestbook().then((serverList) => {
    if (serverList && serverList.length > 0) {
      saveLocalSnapshot({ guestbook: serverList });
      callback(serverList as GuestMessage[]);
    }
  }).catch((e) => console.warn('Server guestbook fetch notice:', e));

  // Polling fallback for server API every 5s so updates in China show automatically
  const pollInterval = setInterval(() => {
    fetchServerGuestbook().then((serverList) => {
      if (serverList && Array.isArray(serverList)) {
        callback(serverList as GuestMessage[]);
      }
    }).catch((e) => {});
  }, 5000);

  // Firestore real-time listener if available (for global real-time sockets)
  let unsubSnapshot: (() => void) | null = null;
  ensureAuth().then(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    unsubSnapshot = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: GuestMessage[] = snapshot.docs.map((d) => {
            const data = d.data();
            const dateStr = data.createdAt?.toDate ? new Date(data.createdAt.toDate()).toLocaleString('zh-CN', { hour12: false }) : '';
            return {
              id: d.id,
              ...data,
              date: dateStr || data.date
            };
          }) as GuestMessage[];
          saveLocalSnapshot({ guestbook: list });
          callback(list);
        }
      },
      (err) => {
        console.warn('Guest messages real-time sync notice:', err);
        if (onError) onError(err);
      }
    );
  }).catch((err) => {
    console.warn('Auth check notice in subscribeGuestMessages:', err);
  });

  return () => {
    clearInterval(pollInterval);
    if (unsubSnapshot) unsubSnapshot();
  };
};

export const postGuestMessage = async (msg: Omit<GuestMessage, 'id' | 'createdAt' | 'userId'>): Promise<GuestMessage[]> => {
  // 1. Send to Express Server API (/api/guestbook) - guaranteed to work in China & Cloudflare
  const serverList = await postServerGuestbook({
    authorName: msg.authorName,
    email: msg.email,
    content: msg.content,
    projectId: msg.projectId,
    projectTitle: msg.projectTitle
  });

  // 2. Try Firestore asynchronously with no blocking await
  ensureAuth().then(async (user) => {
    const suitOptions: Array<'spade' | 'heart' | 'diamond' | 'club'> = ['spade', 'heart', 'diamond', 'club'];
    const randomSuit = suitOptions[Math.floor(Math.random() * suitOptions.length)];
    const payload: Record<string, any> = {
      authorName: msg.authorName || '',
      content: msg.content || '',
      avatarSuit: msg.avatarSuit || randomSuit,
      createdAt: serverTimestamp(),
      userId: user.uid
    };
    if (msg.email) payload.email = msg.email;
    if (msg.projectId) payload.projectId = msg.projectId;
    if (msg.projectTitle) payload.projectTitle = msg.projectTitle;

    await addDoc(collection(db, 'messages'), payload);
  }).catch((err) => {
    console.warn('Firestore postGuestMessage notice (handled smoothly):', err);
  });

  // 3. Save to localStorage cache & return
  if (serverList) {
    saveLocalSnapshot({ guestbook: serverList });
    return serverList as GuestMessage[];
  }

  // Fallback if offline
  const existing = getLocalSnapshot().guestbook || [];
  const suitOptions: Array<'spade' | 'heart' | 'diamond' | 'club'> = ['spade', 'heart', 'diamond', 'club'];
  const randomSuit = suitOptions[Math.floor(Math.random() * suitOptions.length)];
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newMsg: GuestMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    authorName: msg.authorName,
    email: msg.email,
    content: msg.content,
    projectId: msg.projectId,
    projectTitle: msg.projectTitle,
    avatarSuit: msg.avatarSuit || randomSuit,
    date: dateStr,
    createdAt: now.toISOString()
  };

  const updated = [newMsg, ...existing];
  saveLocalSnapshot({ guestbook: updated });
  return updated;
};

export const deleteGuestMessage = async (messageId: string): Promise<GuestMessage[]> => {
  // 1. Delete from Express Server API
  const serverList = await deleteServerGuestbook(messageId);

  // 2. Try Firestore async
  ensureAuth().then(async () => {
    await deleteDoc(doc(db, 'messages', messageId));
  }).catch((e) => console.warn('Firestore delete notice:', e));

  // 3. Update localStorage
  if (serverList) {
    saveLocalSnapshot({ guestbook: serverList });
    return serverList as GuestMessage[];
  }

  const existing = getLocalSnapshot().guestbook || [];
  const updated = existing.filter((m: any) => m.id !== messageId);
  saveLocalSnapshot({ guestbook: updated });
  return updated;
};

// 2. REAL-TIME CLOUD PROJECTS SYNC (云端作品同步)
let hasSeededCloudProjects = typeof window !== 'undefined' && localStorage.getItem('qsi_cloud_projects_seeded') === 'true';

export const subscribeCloudProjects = (
  callback: (projects: Project[]) => void,
  onSeedDefaults?: () => void
): (() => void) => {
  let unsubSnapshot: (() => void) | null = null;

  ensureAuth().then(() => {
    const q = query(collection(db, 'projects'));
    unsubSnapshot = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          if (!hasSeededCloudProjects && onSeedDefaults) {
            hasSeededCloudProjects = true;
            try { localStorage.setItem('qsi_cloud_projects_seeded', 'true'); } catch (e) {}
            onSeedDefaults();
          } else {
            callback([]);
          }
          return;
        }

        hasSeededCloudProjects = true;
        try { localStorage.setItem('qsi_cloud_projects_seeded', 'true'); } catch (e) {}

        const list: Project[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            ...data,
            id: d.id
          } as Project;
        });
        callback(list);
      },
      (err) => {
        console.warn('Projects sync connection notice:', err);
      }
    );
  }).catch((err) => {
    console.warn('Auth check notice in subscribeCloudProjects:', err);
  });

  return () => {
    if (unsubSnapshot) unsubSnapshot();
  };
};

export const syncProjectsToCloud = async (projects: Project[]) => {
  try {
    await ensureAuth();
    const batch = writeBatch(db);
    
    projects.forEach((proj) => {
      const ref = doc(db, 'projects', proj.id);
      batch.set(ref, {
        ...proj,
        updatedAt: serverTimestamp()
      }, { merge: true });
    });

    await batch.commit();
  } catch (err) {
    console.warn('Cloud projects sync notice:', err);
  }
};

export const deleteCloudProject = async (projectId: string) => {
  try {
    await ensureAuth();
    await deleteDoc(doc(db, 'projects', projectId));
  } catch (err) {
    console.warn('Delete cloud project notice:', err);
  }
};

// 3. REAL-TIME LIKES SYNC (云端实时点赞数)
export const subscribeCloudLikes = (
  callback: (likesMap: Record<string, number>) => void
): (() => void) => {
  let unsubSnapshot: (() => void) | null = null;

  ensureAuth().then(() => {
    const q = query(collection(db, 'likes'));
    unsubSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const map: Record<string, number> = {};
        snapshot.docs.forEach((d) => {
          map[d.id] = d.data()?.count || 0;
        });
        callback(map);
      },
      (err) => {
        console.warn('Likes sync connection notice:', err);
      }
    );
  }).catch((err) => {
    console.warn('Auth check notice in subscribeCloudLikes:', err);
  });

  return () => {
    if (unsubSnapshot) unsubSnapshot();
  };
};

export const incrementCloudLike = async (projectId: string) => {
  try {
    await ensureAuth();
    const ref = doc(db, 'likes', projectId);
    await setDoc(ref, { count: increment(1) }, { merge: true });
  } catch (err) {
    console.warn('Increment cloud like notice:', err);
  }
};

// 4. REAL-TIME ABOUT QSi DATA SYNC (关于齐思资料同步)
export const subscribeCloudAboutData = (
  callback: (aboutData: any) => void
): (() => void) => {
  let unsubSnapshot: (() => void) | null = null;

  ensureAuth().then(() => {
    const ref = doc(db, 'settings', 'about');
    unsubSnapshot = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data());
        }
      },
      (err) => {
        console.warn('About data sync connection notice:', err);
      }
    );
  }).catch((err) => {
    console.warn('Auth check notice in subscribeCloudAboutData:', err);
  });

  return () => {
    if (unsubSnapshot) unsubSnapshot();
  };
};

export const syncAboutDataToCloud = async (aboutData: any) => {
  try {
    await ensureAuth();
    const ref = doc(db, 'settings', 'about');
    await setDoc(ref, {
      ...aboutData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Sync cloud about data notice:', err);
  }
};
