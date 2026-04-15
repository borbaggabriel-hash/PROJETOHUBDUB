import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocFromServer,
  Timestamp,
  serverTimestamp,
  getFirestore
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User,
  getAuth
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { db, auth } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

const SECONDARY_APP_NAME = 'SecondaryApp';
function getSecondaryAuth() {
  const existing = getApps().find(a => a.name === SECONDARY_APP_NAME);
  const app = existing ?? initializeApp(firebaseConfig, SECONDARY_APP_NAME);
  return getAuth(app);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const parseSortableId = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { type: 'number' as const, value };
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return { type: 'number' as const, value: numericValue };
    }

    return { type: 'string' as const, value };
  }

  return { type: 'string' as const, value: '' };
};

const sortBySortableField = (items: any[], field: string) => {
  return [...items].sort((a, b) => {
    const aId = parseSortableId(a?.[field] ?? a?.id);
    const bId = parseSortableId(b?.[field] ?? b?.id);

    if (aId.type === 'number' && bId.type === 'number') {
      return aId.value - bId.value;
    }

    if (aId.type === 'number') return -1;
    if (bId.type === 'number') return 1;

    return String(aId.value).localeCompare(String(bId.value));
  });
};

const mapCollectionDocs = (snapshot: any) => {
  return snapshot.docs.map((docSnapshot: any) => {
    const data = docSnapshot.data();
    return {
      ...data,
      id: data?.id ?? docSnapshot.id
    };
  });
};

const getNextNumericId = async (path: string) => {
  const snapshot = await getDocs(collection(db, path));
  const maxExistingId = snapshot.docs.reduce((maxId, docSnapshot) => {
    const data = docSnapshot.data();
    const rawId = data?.id ?? docSnapshot.id;
    const numericId = typeof rawId === 'number' ? rawId : Number(rawId);

    if (Number.isFinite(numericId) && numericId > maxId) {
      return numericId;
    }

    return maxId;
  }, 0);

  return maxExistingId + 1;
};

const createSiteDocument = async (path: string, payload: any) => {
  const nextId = await getNextNumericId(path);
  const dataToSave = {
    ...payload,
    id: nextId
  };

  await setDoc(doc(db, path, String(nextId)), dataToSave);
  return dataToSave;
};

export const firebaseService = {
  async testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. ");
      }
    }
  },

  async getBanners() {
    const path = 'banners';
    try {
      const snapshot = await getDocs(collection(db, path));
      return sortBySortableField(mapCollectionDocs(snapshot), 'id');
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getModules() {
    const path = 'modules';
    try {
      const snapshot = await getDocs(collection(db, path));
      return sortBySortableField(mapCollectionDocs(snapshot), 'num');
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getTeachers() {
    const path = 'teachers';
    try {
      const snapshot = await getDocs(collection(db, path));
      return mapCollectionDocs(snapshot);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getLearnings() {
    const path = 'learnings';
    try {
      const snapshot = await getDocs(collection(db, path));
      return sortBySortableField(mapCollectionDocs(snapshot), 'id');
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getTestimonials() {
    const path = 'testimonials';
    try {
      const snapshot = await getDocs(collection(db, path));
      return sortBySortableField(mapCollectionDocs(snapshot), 'id');
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getFAQs() {
    const path = 'faqs';
    try {
      const snapshot = await getDocs(collection(db, path));
      return sortBySortableField(mapCollectionDocs(snapshot), 'id');
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async createEnrollment(enrollment: any) {
    const path = 'enrollments';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...enrollment,
        created_at: serverTimestamp()
      });
      return { id: docRef.id, ...enrollment };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getSettings() {
    const path = 'settings/global';
    try {
      const docSnap = await getDoc(doc(db, path));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // Auth Methods
  async signIn(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  // Student Specific Data
  async getStudentProfile(userId: string) {
    const path = `profiles/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, path));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async getStudentEnrollments(userId: string) {
    const path = 'enrollments';
    try {
      const q = query(collection(db, path), where('email', '==', auth.currentUser?.email));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getStudentActivity(userId: string) {
    const path = 'student_activity';
    try {
      const q = query(collection(db, path), where('student_id', '==', userId), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // Admin Methods
  async getAllStudents() {
    const path = 'profiles';
    try {
      const q = query(collection(db, path), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getAllEnrollments() {
    const path = 'enrollments';
    try {
      const q = query(collection(db, path), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getAllActivity() {
    const path = 'student_activity';
    try {
      const q = query(collection(db, path), orderBy('created_at', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async updateStudentProfile(id: string, profile: any) {
    const path = `profiles/${id}`;
    try {
      await updateDoc(doc(db, path), profile);
      return { id, ...profile };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteBanner(id: string) {
    const path = `banners/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateBanner(id: string, banner: any) {
    const path = `banners/${id}`;
    try {
      await updateDoc(doc(db, path), banner);
      return { id, ...banner };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createBanner(banner: any) {
    const path = 'banners';
    try {
      return await createSiteDocument(path, banner);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateModule(id: string, module: any) {
    const path = `modules/${id}`;
    try {
      await updateDoc(doc(db, path), module);
      return { id, ...module };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createModule(module: any) {
    const path = 'modules';
    try {
      return await createSiteDocument(path, module);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteModule(id: string) {
    const path = `modules/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateLearning(id: string, learning: any) {
    const path = `learnings/${id}`;
    try {
      await updateDoc(doc(db, path), learning);
      return { id, ...learning };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createLearning(learning: any) {
    const path = 'learnings';
    try {
      return await createSiteDocument(path, learning);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteLearning(id: string) {
    const path = `learnings/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateTestimonial(id: string, testimonial: any) {
    const path = `testimonials/${id}`;
    try {
      await updateDoc(doc(db, path), testimonial);
      return { id, ...testimonial };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createTestimonial(testimonial: any) {
    const path = 'testimonials';
    try {
      return await createSiteDocument(path, testimonial);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteTestimonial(id: string) {
    const path = `testimonials/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateFAQ(id: string, faq: any) {
    const path = `faqs/${id}`;
    try {
      await updateDoc(doc(db, path), faq);
      return { id, ...faq };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createFAQ(faq: any) {
    const path = 'faqs';
    try {
      return await createSiteDocument(path, faq);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteFAQ(id: string) {
    const path = `faqs/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async deleteEnrollment(id: string) {
    const path = `enrollments/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateTeacher(id: string, teacher: any) {
    const path = `teachers/${id}`;
    try {
      await updateDoc(doc(db, path), teacher);
      return { id, ...teacher };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createTeacher(teacher: any) {
    const path = 'teachers';
    try {
      return await createSiteDocument(path, teacher);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteTeacher(id: string) {
    const path = `teachers/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async createStudentAccount(data: { full_name: string; email: string; password: string; module_title: string; module_slug: string }) {
    const secondaryAuth = getSecondaryAuth();
    try {
      const result = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
      const uid = result.user.uid;
      const secondaryDb = getFirestore(secondaryAuth.app);
      await setDoc(doc(secondaryDb, `profiles/${uid}`), {
        full_name: data.full_name,
        email: data.email,
        role: 'student',
        created_at: serverTimestamp()
      });
      await setDoc(doc(secondaryDb, `enrollments/${uid}_${Date.now()}`), {
        student_id: uid,
        email: data.email,
        module: data.module_title,
        module_slug: data.module_slug,
        status: 'Ativo',
        progress: 0,
        created_at: serverTimestamp()
      });
      await firebaseSignOut(secondaryAuth);
      return { uid, email: data.email };
    } catch (error) {
      try { await firebaseSignOut(secondaryAuth); } catch {}
      throw error;
    }
  },

  async upsertStudentEnrollment(uid: string, data: { module_title: string; module_slug: string; status: string; progress: number }) {
    const path = `student_enrollments/${uid}`;
    try {
      await setDoc(doc(db, path), {
        student_id: uid,
        module: data.module_title,
        module_slug: data.module_slug,
        status: data.status,
        progress: data.progress,
        updated_at: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getStudentEnrollmentByUid(uid: string) {
    const path = `student_enrollments/${uid}`;
    try {
      const snap = await getDoc(doc(db, path));
      return snap.exists() ? snap.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async createStudentMessage(uid: string, message: { title: string; body: string }) {
    const path = 'student_messages';
    try {
      const ref = await addDoc(collection(db, path), {
        student_id: uid,
        title: message.title,
        body: message.body,
        read: false,
        created_at: serverTimestamp()
      });
      return ref.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getStudentMessages(uid: string) {
    const path = 'student_messages';
    try {
      const q = query(collection(db, path), where('student_id', '==', uid), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async deleteStudentMessage(id: string) {
    try { await deleteDoc(doc(db, `student_messages/${id}`)); } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `student_messages/${id}`);
    }
  },

  async createStudentInvoice(uid: string, invoice: { description: string; amount: string; due_date: string; status: string }) {
    const path = 'student_invoices';
    try {
      const ref = await addDoc(collection(db, path), {
        student_id: uid,
        ...invoice,
        created_at: serverTimestamp()
      });
      return ref.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getStudentInvoices(uid: string) {
    const path = 'student_invoices';
    try {
      const q = query(collection(db, path), where('student_id', '==', uid), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async updateStudentInvoiceStatus(id: string, status: string) {
    const path = `student_invoices/${id}`;
    try {
      await updateDoc(doc(db, path), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteStudentInvoice(id: string) {
    try { await deleteDoc(doc(db, `student_invoices/${id}`)); } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `student_invoices/${id}`);
    }
  },

  async createSupportTicket(uid: string, ticket: { subject: string; message: string; email: string; name: string }) {
    const path = 'student_support';
    try {
      const ref = await addDoc(collection(db, path), {
        student_id: uid,
        ...ticket,
        status: 'Aberto',
        admin_reply: '',
        created_at: serverTimestamp()
      });
      return ref.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getSupportTickets(uid: string) {
    const path = 'student_support';
    try {
      const q = query(collection(db, path), where('student_id', '==', uid), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getAllSupportTickets() {
    const path = 'student_support';
    try {
      const q = query(collection(db, path), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async updateSupportTicket(id: string, data: { status: string; admin_reply: string }) {
    const path = `student_support/${id}`;
    try {
      await updateDoc(doc(db, path), { ...data, updated_at: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteSupportTicket(id: string) {
    try { await deleteDoc(doc(db, `student_support/${id}`)); } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `student_support/${id}`);
    }
  },

  async createAgendaItem(uid: string, item: { title: string; date: string; time: string; description: string; type: string }) {
    const path = 'student_agenda';
    try {
      const ref = await addDoc(collection(db, path), {
        student_id: uid,
        ...item,
        created_at: serverTimestamp()
      });
      return ref.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getAgendaItems(uid: string) {
    const path = 'student_agenda';
    try {
      const q = query(collection(db, path), where('student_id', '==', uid), orderBy('date', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async deleteAgendaItem(id: string) {
    try { await deleteDoc(doc(db, `student_agenda/${id}`)); } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `student_agenda/${id}`);
    }
  },

  async updateSettings(settings: any) {
    const path = 'settings/global';
    try {
      await setDoc(doc(db, path), settings, { merge: true });
      return settings;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateEnrollmentStatus(id: string, status: string) {
    const path = `enrollments/${id}`;
    try {
      await updateDoc(doc(db, path), { status });
      return { id, status };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getSiteData() {
    try {
      const [banners, modules, teachers, learnings, testimonials, faqs, settings] = await Promise.all([
        this.getBanners(),
        this.getModules(),
        this.getTeachers(),
        this.getLearnings(),
        this.getTestimonials(),
        this.getFAQs(),
        this.getSettings()
      ]);

      return {
        banners: banners || [],
        modules: modules || [],
        teachers: teachers || [],
        learnings: learnings || [],
        testimonials: testimonials || [],
        faqs: faqs || [],
        settings: settings || {}
      };
    } catch (error) {
      console.error('Error fetching site data from Firebase:', error);
      return null;
    }
  },

  subscribeToSiteData(onChange: () => void) {
    const collectionPaths = ['banners', 'modules', 'teachers', 'learnings', 'testimonials', 'faqs'];
    const unsubscribers = collectionPaths.map((path) => onSnapshot(collection(db, path), onChange));
    const settingsUnsubscribe = onSnapshot(doc(db, 'settings/global'), onChange);

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      settingsUnsubscribe();
    };
  },

  async seedDatabase(data: {
    banners?: any[];
    modules?: any[];
    learnings?: any[];
    testimonials?: any[];
    faqs?: any[];
    settings?: Record<string, unknown>;
  }) {
    const publicCollections: Array<[string, any[] | undefined]> = [
      ['banners', data.banners],
      ['modules', data.modules],
      ['learnings', data.learnings],
      ['testimonials', data.testimonials],
      ['faqs', data.faqs],
    ];

    for (const [collectionName, items] of publicCollections) {
      if (!items || items.length === 0) continue;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const rawId = item.id ?? item.num ?? i + 1;
        const docId = String(rawId).replace(/^0+/, '') || String(i + 1);
        const docRef = doc(db, collectionName, docId);
        try {
          await setDoc(docRef, item);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${docId}`);
        }
      }
    }

    if (data.settings) {
      try {
        await setDoc(doc(db, 'settings', 'global'), data.settings);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'settings/global');
      }
    }
  }
};
