import { supabase, supabaseAdmin } from '../lib/supabase';

// ─── Helpers ────────────────────────────────────────────────────────────────

function handleError(error: any, operation: string, table: string): never {
  const info = { error: error?.message ?? String(error), operation, table };
  console.error('Supabase Error:', JSON.stringify(info));
  throw new Error(JSON.stringify(info));
}

async function getNextNumericId(table: string): Promise<number> {
  const { data } = await supabaseAdmin.from(table).select('id').order('id', { ascending: false }).limit(1);
  if (!data || data.length === 0) return 1;
  const maxId = Number(data[0].id);
  return Number.isFinite(maxId) ? maxId + 1 : 1;
}

async function createSiteDocument(table: string, payload: any) {
  const nextId = await getNextNumericId(table);
  const dataToSave = { ...payload, id: nextId };
  const { data, error } = await supabaseAdmin.from(table).insert(dataToSave).select().single();
  if (error) handleError(error, 'create', table);
  return data;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const supabaseService = {

  // Connection test
  async testConnection() {
    try {
      await supabase.from('banners').select('id').limit(1);
    } catch (error) {
      console.error('Supabase connection error:', error);
    }
  },

  // ── Public site data ───────────────────────────────────────────────────────

  async getBanners() {
    const { data, error } = await supabaseAdmin.from('banners').select('*').order('id');
    if (error) handleError(error, 'list', 'banners');
    return data ?? [];
  },

  async getModules() {
    const { data, error } = await supabaseAdmin.from('modules').select('*').order('num');
    if (error) handleError(error, 'list', 'modules');
    return data ?? [];
  },

  async getTeachers() {
    const { data, error } = await supabaseAdmin.from('teachers').select('*');
    if (error) handleError(error, 'list', 'teachers');
    return data ?? [];
  },

  async getLearnings() {
    const { data, error } = await supabaseAdmin.from('learnings').select('*').order('id');
    if (error) handleError(error, 'list', 'learnings');
    return data ?? [];
  },

  async getTestimonials() {
    const { data, error } = await supabaseAdmin.from('testimonials').select('*').order('id');
    if (error) handleError(error, 'list', 'testimonials');
    return data ?? [];
  },

  async getFAQs() {
    const { data, error } = await supabaseAdmin.from('faqs').select('*').order('id');
    if (error) handleError(error, 'list', 'faqs');
    return data ?? [];
  },

  async getSettings() {
    const { data, error } = await supabaseAdmin.from('settings').select('data').eq('id', 'global').single();
    if (error) return {};
    return data?.data ?? {};
  },

  async updateSettings(settings: any) {
    const { error } = await supabaseAdmin.from('settings').upsert({ id: 'global', data: settings });
    if (error) handleError(error, 'write', 'settings');
    return settings;
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
        this.getSettings(),
      ]);
      return { banners, modules, teachers, learnings, testimonials, faqs, settings };
    } catch (error) {
      console.error('Error fetching site data from Supabase:', error);
      return null;
    }
  },

  subscribeToSiteData(_onChange: () => void) {
    return () => {};
  },

  // ── Enrollments (public form) ──────────────────────────────────────────────

  async createEnrollment(enrollment: any) {
    const { data, error } = await supabase.from('enrollments').insert({ ...enrollment, created_at: new Date().toISOString() }).select().single();
    if (error) handleError(error, 'create', 'enrollments');
    return data;
  },

  async getAllEnrollments() {
    const { data, error } = await supabaseAdmin.from('enrollments').select('*').order('created_at', { ascending: false });
    if (error) handleError(error, 'list', 'enrollments');
    return data ?? [];
  },

  async updateEnrollmentStatus(id: string, status: string) {
    const { error } = await supabaseAdmin.from('enrollments').update({ status }).eq('id', id);
    if (error) handleError(error, 'update', 'enrollments');
    return { id, status };
  },

  async deleteEnrollment(id: string) {
    const { error } = await supabaseAdmin.from('enrollments').delete().eq('id', id);
    if (error) handleError(error, 'delete', 'enrollments');
  },

  // ── Auth ──────────────────────────────────────────────────────────────────

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { user: data.user };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
  },

  // ── Student data (portal) ─────────────────────────────────────────────────

  async getStudentProfile(userId: string) {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
    if (error) return null;
    return data;
  },

  async updateStudentProfile(id: string, profile: any) {
    const { data, error } = await supabaseAdmin.from('profiles').update(profile).eq('id', id).select().single();
    if (error) handleError(error, 'update', 'profiles');
    return { id, ...data };
  },

  async getStudentEnrollments(userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from('enrollments').select('*').eq('email', user.email ?? '');
    if (error) handleError(error, 'list', 'enrollments');
    return data ?? [];
  },

  async getStudentActivity(userId: string) {
    const { data, error } = await supabaseAdmin.from('student_activity').select('*').eq('student_id', userId).order('created_at', { ascending: false });
    if (error) handleError(error, 'list', 'student_activity');
    return data ?? [];
  },

  async upsertStudentEnrollment(uid: string, d: { module_title: string; module_slug: string; status: string; progress: number }) {
    const { error } = await supabaseAdmin.from('student_enrollments').upsert({
      student_id: uid,
      module: d.module_title,
      module_slug: d.module_slug,
      status: d.status,
      progress: d.progress,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'student_id' });
    if (error) handleError(error, 'write', 'student_enrollments');
  },

  async getStudentEnrollmentByUid(uid: string) {
    const { data } = await supabaseAdmin.from('student_enrollments').select('*').eq('student_id', uid).single();
    return data ?? null;
  },

  // ── Admin ─────────────────────────────────────────────────────────────────

  async getAllStudents() {
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false });
    if (error) handleError(error, 'list', 'profiles');
    return (data ?? []).map((s: any) => ({
      ...s,
      name: s.full_name ?? s.name ?? s.email ?? 'Aluno',
      avatar: s.avatar_url ?? s.avatar ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.full_name ?? s.email ?? 'A')}`,
    }));
  },

  async getAllActivity() {
    const { data, error } = await supabaseAdmin.from('student_activity').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) handleError(error, 'list', 'student_activity');
    return data ?? [];
  },

  async deleteStudent(id: string) {
    const { error } = await supabaseAdmin.from('profiles').delete().eq('id', id);
    if (error) handleError(error, 'delete', 'profiles');
  },

  async createStudentAccount(d: { full_name: string; email: string; password: string; module_title: string; module_slug: string }) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: d.email,
      password: d.password,
      email_confirm: true,
    });
    if (authError) throw authError;
    const uid = authData.user.id;
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(d.full_name)}`;
    await supabaseAdmin.from('profiles').upsert({
      id: uid,
      full_name: d.full_name,
      name: d.full_name,
      email: d.email,
      role: 'student',
      avatar_url: avatar,
      avatar: avatar,
      status: 'Ativo',
      created_at: new Date().toISOString(),
    });
    await supabaseAdmin.from('enrollments').insert({
      student_id: uid,
      email: d.email,
      module: d.module_title,
      module_slug: d.module_slug,
      status: 'Ativo',
      progress: 0,
      created_at: new Date().toISOString(),
    });
    return { uid, email: d.email };
  },

  // ── Messages ──────────────────────────────────────────────────────────────

  async createStudentMessage(uid: string, message: { title: string; body: string }) {
    const { data, error } = await supabaseAdmin.from('student_messages').insert({
      student_id: uid, title: message.title, body: message.body, read: false, created_at: new Date().toISOString(),
    }).select().single();
    if (error) handleError(error, 'create', 'student_messages');
    return data?.id;
  },

  async getStudentMessages(uid: string) {
    const { data, error } = await supabaseAdmin.from('student_messages').select('*').eq('student_id', uid).order('created_at', { ascending: false });
    if (error) return [];
    return data ?? [];
  },

  async deleteStudentMessage(id: string) {
    const { error } = await supabaseAdmin.from('student_messages').delete().eq('id', id);
    if (error) handleError(error, 'delete', 'student_messages');
  },

  // ── Invoices ──────────────────────────────────────────────────────────────

  async createStudentInvoice(uid: string, invoice: { description: string; amount: string; due_date: string; status: string }) {
    const { data, error } = await supabaseAdmin.from('student_invoices').insert({
      student_id: uid, ...invoice, created_at: new Date().toISOString(),
    }).select().single();
    if (error) handleError(error, 'create', 'student_invoices');
    return data?.id;
  },

  async getStudentInvoices(uid: string) {
    const { data, error } = await supabaseAdmin.from('student_invoices').select('*').eq('student_id', uid).order('created_at', { ascending: false });
    if (error) return [];
    return data ?? [];
  },

  async updateStudentInvoiceStatus(id: string, status: string) {
    const { error } = await supabaseAdmin.from('student_invoices').update({ status }).eq('id', id);
    if (error) handleError(error, 'update', 'student_invoices');
  },

  async deleteStudentInvoice(id: string) {
    const { error } = await supabaseAdmin.from('student_invoices').delete().eq('id', id);
    if (error) handleError(error, 'delete', 'student_invoices');
  },

  // ── Support ───────────────────────────────────────────────────────────────

  async createSupportTicket(uid: string, ticket: { subject: string; message: string; email: string; name: string }) {
    const { data, error } = await supabase.from('student_support').insert({
      student_id: uid, ...ticket, status: 'Aberto', admin_reply: '', created_at: new Date().toISOString(),
    }).select().single();
    if (error) handleError(error, 'create', 'student_support');
    return data?.id;
  },

  async getSupportTickets(uid: string) {
    const { data, error } = await supabaseAdmin.from('student_support').select('*').eq('student_id', uid).order('created_at', { ascending: false });
    if (error) return [];
    return data ?? [];
  },

  async getAllSupportTickets() {
    const { data, error } = await supabaseAdmin.from('student_support').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data ?? [];
  },

  async updateSupportTicket(id: string, data: { status: string; admin_reply: string }) {
    const { error } = await supabaseAdmin.from('student_support').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) handleError(error, 'update', 'student_support');
  },

  async deleteSupportTicket(id: string) {
    const { error } = await supabaseAdmin.from('student_support').delete().eq('id', id);
    if (error) handleError(error, 'delete', 'student_support');
  },

  // ── Agenda ────────────────────────────────────────────────────────────────

  async createAgendaItem(uid: string, item: { title: string; date: string; time: string; description: string; type: string }) {
    const { data, error } = await supabaseAdmin.from('student_agenda').insert({
      student_id: uid, ...item, created_at: new Date().toISOString(),
    }).select().single();
    if (error) handleError(error, 'create', 'student_agenda');
    return data?.id;
  },

  async getAgendaItems(uid: string) {
    const { data, error } = await supabaseAdmin.from('student_agenda').select('*').eq('student_id', uid).order('date', { ascending: true });
    if (error) return [];
    return data ?? [];
  },

  async deleteAgendaItem(id: string) {
    const { error } = await supabaseAdmin.from('student_agenda').delete().eq('id', id);
    if (error) handleError(error, 'delete', 'student_agenda');
  },

  // ── Site CRUD (Admin) ─────────────────────────────────────────────────────

  async deleteBanner(id: string) {
    const { error } = await supabaseAdmin.from('banners').delete().eq('id', id);
    if (error) handleError(error, 'delete', 'banners');
  },

  async updateBanner(id: string, banner: any) {
    const { data, error } = await supabaseAdmin.from('banners').update(banner).eq('id', id).select().single();
    if (error) handleError(error, 'update', 'banners');
    return data;
  },

  async createBanner(banner: any) {
    return createSiteDocument('banners', banner);
  },

  async updateModule(id: string, module: any) {
    const { data, error } = await supabaseAdmin.from('modules').update(module).eq('id', id).select().single();
    if (error) handleError(error, 'update', 'modules');
    return data;
  },

  async createModule(module: any) {
    return createSiteDocument('modules', module);
  },

  async deleteModule(id: string) {
    const { error } = await supabaseAdmin.from('modules').delete().eq('id', id);
    if (error) handleError(error, 'delete', 'modules');
  },

  async updateLearning(id: string, learning: any) {
    const { data, error } = await supabaseAdmin.from('learnings').update(learning).eq('id', id).select().single();
    if (error) handleError(error, 'update', 'learnings');
    return data;
  },

  async createLearning(learning: any) {
    return createSiteDocument('learnings', learning);
  },

  async deleteLearning(id: string) {
    const { error } = await supabaseAdmin.from('learnings').delete().eq('id', id);
    if (error) handleError(error, 'delete', 'learnings');
  },

  async updateTestimonial(id: string, testimonial: any) {
    const { data, error } = await supabaseAdmin.from('testimonials').update(testimonial).eq('id', id).select().single();
    if (error) handleError(error, 'update', 'testimonials');
    return data;
  },

  async createTestimonial(testimonial: any) {
    return createSiteDocument('testimonials', testimonial);
  },

  async deleteTestimonial(id: string) {
    const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', id);
    if (error) handleError(error, 'delete', 'testimonials');
  },

  async updateFAQ(id: string, faq: any) {
    const { data, error } = await supabaseAdmin.from('faqs').update(faq).eq('id', id).select().single();
    if (error) handleError(error, 'update', 'faqs');
    return data;
  },

  async createFAQ(faq: any) {
    return createSiteDocument('faqs', faq);
  },

  async deleteFAQ(id: string) {
    const { error } = await supabaseAdmin.from('faqs').delete().eq('id', id);
    if (error) handleError(error, 'delete', 'faqs');
  },

  async updateTeacher(id: string, teacher: any) {
    const { data, error } = await supabaseAdmin.from('teachers').update(teacher).eq('id', id).select().single();
    if (error) handleError(error, 'update', 'teachers');
    return data;
  },

  async createTeacher(teacher: any) {
    return createSiteDocument('teachers', teacher);
  },

  async deleteTeacher(id: string) {
    const { error } = await supabaseAdmin.from('teachers').delete().eq('id', id);
    if (error) handleError(error, 'delete', 'teachers');
  },

  // ── Seed database ─────────────────────────────────────────────────────────

  async seedDatabase(data: {
    banners?: any[]; modules?: any[]; learnings?: any[];
    testimonials?: any[]; faqs?: any[]; settings?: Record<string, unknown>;
  }) {
    const collections: Array<[string, any[] | undefined]> = [
      ['banners', data.banners], ['modules', data.modules],
      ['learnings', data.learnings], ['testimonials', data.testimonials], ['faqs', data.faqs],
    ];
    for (const [table, items] of collections) {
      if (!items || items.length === 0) continue;
      for (const item of items) {
        const rawId = item.id ?? item.num;
        const id = rawId != null ? Number(String(rawId).replace(/^0+/, '') || '1') : undefined;
        const row = id != null ? { ...item, id } : item;
        const { error } = await supabaseAdmin.from(table).upsert(row);
        if (error) console.error(`Seed error [${table}]:`, error.message);
      }
    }
    if (data.settings) {
      await supabaseAdmin.from('settings').upsert({ id: 'global', data: data.settings });
    }
  },
};

export const firebaseService = supabaseService;
