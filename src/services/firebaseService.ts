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

export interface GuestMessage {
  id?: string;
  authorName: string;
  email?: string;
  content: string;
  projectId?: string;
  projectTitle?: string;
  avatarSuit?: 'spade' | 'heart' | 'diamond' | 'club';
  createdAt?: any;
  userId?: string;
}

// 1. GUESTBOOK MESSAGES (访客留言/改动建议)
export const subscribeGuestMessages = (
  callback: (messages: GuestMessage[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  let unsubSnapshot: (() => void) | null = null;

  ensureAuth().then(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    unsubSnapshot = onSnapshot(
      q,
      (snapshot) => {
        const list: GuestMessage[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        })) as GuestMessage[];
        callback(list);
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
    if (unsubSnapshot) unsubSnapshot();
  };
};

export const postGuestMessage = async (msg: Omit<GuestMessage, 'id' | 'createdAt' | 'userId'>) => {
  const user = await ensureAuth();
  const suitOptions: Array<'spade' | 'heart' | 'diamond' | 'club'> = ['spade', 'heart', 'diamond', 'club'];
  const randomSuit = suitOptions[Math.floor(Math.random() * suitOptions.length)];

  // Clean payload: Firestore rejects undefined values
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
};

export const deleteGuestMessage = async (messageId: string) => {
  await ensureAuth();
  await deleteDoc(doc(db, 'messages', messageId));
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
