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

// Global in-memory subscriber cache and PubSub listeners
let cachedGuestMessages: GuestMessage[] = [];
let guestMessageSubscribers: Array<(messages: GuestMessage[]) => void> = [];

const notifyGuestSubscribers = (messages: GuestMessage[]) => {
  cachedGuestMessages = messages;
  guestMessageSubscribers.forEach((cb) => {
    try {
      cb(messages);
    } catch (e) {
      console.warn('Subscriber notification error:', e);
    }
  });
};

// 1. GUESTBOOK MESSAGES (访客留言/改动建议 - 混合同步：保障中国大陆与Cloudflare极速无阻)
export const subscribeGuestMessages = (
  callback: (messages: GuestMessage[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  guestMessageSubscribers.push(callback);

  // Return cached or local snapshot instantly
  if (cachedGuestMessages.length > 0) {
    callback(cachedGuestMessages);
  } else {
    const cached = getLocalSnapshot().guestbook || [];
    if (cached.length > 0) {
      cachedGuestMessages = cached;
      callback(cached);
    }
  }

  // Fetch latest from Express server API immediately
  fetchServerGuestbook().then((serverList) => {
    if (serverList && Array.isArray(serverList) && serverList.length > 0) {
      saveLocalSnapshot({ guestbook: serverList });
      notifyGuestSubscribers(serverList);
    }
  }).catch((e) => console.warn('Server guestbook fetch notice:', e));

  // Rapid polling interval (3s) for China & cross-device live updates without VPN
  const pollInterval = setInterval(() => {
    fetchServerGuestbook().then((serverList) => {
      if (serverList && Array.isArray(serverList)) {
        if (JSON.stringify(serverList) !== JSON.stringify(cachedGuestMessages)) {
          saveLocalSnapshot({ guestbook: serverList });
          notifyGuestSubscribers(serverList);
        }
      }
    }).catch((e) => {});
  }, 3000);

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
          notifyGuestSubscribers(list);
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
    guestMessageSubscribers = guestMessageSubscribers.filter((cb) => cb !== callback);
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

  if (serverList && Array.isArray(serverList)) {
    saveLocalSnapshot({ guestbook: serverList });
    notifyGuestSubscribers(serverList);
  }

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

  // 3. Fallback if server API offline
  if (!serverList) {
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

    const updated = [newMsg, ...cachedGuestMessages];
    saveLocalSnapshot({ guestbook: updated });
    notifyGuestSubscribers(updated);
    return updated;
  }

  return serverList;
};

export const deleteGuestMessage = async (messageId: string): Promise<GuestMessage[]> => {
  // 1. Delete from Express Server API
  const serverList = await deleteServerGuestbook(messageId);

  if (serverList && Array.isArray(serverList)) {
    saveLocalSnapshot({ guestbook: serverList });
    notifyGuestSubscribers(serverList);
  } else {
    const filtered = cachedGuestMessages.filter((m) => m.id !== messageId);
    saveLocalSnapshot({ guestbook: filtered });
    notifyGuestSubscribers(filtered);
  }

  // 2. Try Firestore async
  ensureAuth().then(async () => {
    await deleteDoc(doc(db, 'messages', messageId));
  }).catch((e) => console.warn('Firestore delete notice:', e));

  return serverList || cachedGuestMessages;
};

// 2. REAL-TIME CLOUD PROJECTS SYNC (云端作品同步)
let hasSeededCloudProjects = typeof window !== 'undefined' && localStorage.getItem('qsi_cloud_projects_seeded') === 'true';

export const subscribeCloudProjects = (
  callback: (projects: Project[]) => void,
  onSeedDefaults?: () => void
): (() => void) => {
  let unsubSnapshot: (() => void) | null = null;

  ensureAuth().then((user) => {
    console.log('[Firebase Auth] Authenticated UID for Cloud Projects:', user.uid);
    const q = query(collection(db, 'projects'));
    unsubSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const changes = snapshot.docChanges().map(c => `${c.type}:${c.doc.id}`);
        console.log(`[Firebase Firestore] Projects snapshot received (${snapshot.docs.length} items). Changes: [${changes.join(', ')}]`);

        if (snapshot.empty) {
          if (!hasSeededCloudProjects && onSeedDefaults) {
            hasSeededCloudProjects = true;
            try { localStorage.setItem('qsi_cloud_projects_seeded', 'true'); } catch (e) {}
            console.log('[Firebase Firestore] Projects collection empty. Seeding defaults...');
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
        console.warn('[Firebase Firestore Warning] Projects sync connection error:', err?.message || err);
      }
    );
  }).catch((err) => {
    console.warn('[Firebase Auth Warning] Auth check error in subscribeCloudProjects:', err?.message || err);
  });

  return () => {
    if (unsubSnapshot) {
      console.log('[Firebase Firestore] Unsubscribing from Cloud Projects listener');
      unsubSnapshot();
    }
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
