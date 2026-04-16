import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, CreditCard,
  HelpCircle, LogOut, Bell, Search,
  Clock, ChevronRight, Mic,
  Calendar, AlertCircle,
  CheckCircle, MessageSquare,
  ExternalLink, PartyPopper,
  BookOpen, Lock,
  PlayCircle, Trash2, Send, CheckCheck,
  User, Camera, TrendingUp
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { firebaseService } from '../services/supabaseService';

export function StudentDashboard({ onLogout, onHome, data, studentData }: any) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [agendaItems, setAgendaItems] = useState<any[]>([]);

  const profile = studentData?.profile;
  const uid = studentData?.uid;

  useEffect(() => {
    if (!uid) return;
    firebaseService.getStudentMessages(uid).then(msgs => setMessages((msgs as any[]) || []));
    firebaseService.getStudentInvoices(uid).then(invs => setInvoices((invs as any[]) || []));
    firebaseService.getAgendaItems(uid).then(items => setAgendaItems((items as any[]) || []));
  }, [uid]);

  const unreadCount = messages.filter((m: any) => !m.read).length;

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'cursos', label: 'Meus Cursos', icon: BookOpen },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'mensagens', label: 'Mensagens', icon: MessageSquare, badge: unreadCount },
    { id: 'financeiro', label: 'Financeiro', icon: CreditCard },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle },
    { id: 'perfil', label: 'Meu Perfil', icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} data={data} studentData={studentData} messages={messages} invoices={invoices} agendaItems={agendaItems} />;
      case 'cursos':
        return <CursosView data={data} studentData={studentData} />;
      case 'mensagens':
        return <MensagensView messages={messages} setMessages={setMessages} uid={uid} />;
      case 'financeiro':
        return <FinanceiroView invoices={invoices} setInvoices={setInvoices} onPay={() => { setIsCelebrating(true); setTimeout(() => setIsCelebrating(false), 3000); }} />;
      case 'agenda':
        return <AgendaView agendaItems={agendaItems} />;
      case 'suporte':
        return <SuporteView uid={uid} profile={profile} />;
      case 'perfil':
        return <PerfilView uid={uid} profile={profile} />;
      default:
        return <DashboardView setActiveTab={setActiveTab} data={data} studentData={studentData} messages={messages} invoices={invoices} agendaItems={agendaItems} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col hidden md:flex relative z-20 shadow-2xl">
        <div className="p-6 flex items-center gap-3 cursor-pointer group border-b border-white/5" onClick={onHome}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tighter font-display text-white block leading-none">THE HUB</span>
            <span className="font-bold text-xs tracking-widest text-cyan-400 uppercase">Portal do Aluno</span>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-white/5">
          <button onClick={() => setActiveTab('perfil')} className="w-full glass-panel p-3 rounded-2xl border-white/5 flex items-center gap-3 hover:border-cyan-500/30 transition-colors text-left">
            <img src={profile?.avatar_url || `https://i.pravatar.cc/150?u=${uid || 1}`} alt="User" className="w-10 h-10 rounded-full border-2 border-cyan-500/30 shrink-0 object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile?.full_name || 'Aluno'}</p>
              <p className="text-xs text-cyan-400">Aluno Ativo</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-left relative group ${
                  isActive ? 'text-cyan-400' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStudentTab"
                    className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/20 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="relative z-10 flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="relative z-10 w-5 h-5 rounded-full bg-cyan-500 text-black text-xs font-black flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" /> Sair da conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#0a0a0a]">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>

        <AnimatePresence>
          {isCelebrating && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5, opacity: 0 }}
                className="bg-gradient-to-br from-green-400 to-emerald-600 p-8 rounded-3xl text-center shadow-[0_0_100px_rgba(16,185,129,0.4)]"
              >
                <PartyPopper className="w-20 h-20 text-white mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white font-display mb-2">Pagamento Confirmado!</h2>
                <p className="text-green-50 font-medium">Sua matrícula está ativa. Bons estudos!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-white/5 bg-black/30 backdrop-blur-md flex items-center justify-between px-4 relative z-10 shrink-0">
          <button onClick={onHome} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-base font-display text-white">THE HUB</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('mensagens')} className="relative p-2 text-muted-foreground hover:text-white">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full"></span>}
            </button>
            <button onClick={() => setActiveTab('perfil')}>
              <img src={profile?.avatar_url || `https://i.pravatar.cc/150?u=${uid || 1}`} alt="User" className="w-8 h-8 rounded-full border-2 border-cyan-500/30 object-cover" />
            </button>
          </div>
        </header>

        {/* Topbar Desktop */}
        <header className="hidden md:flex h-18 border-b border-white/5 bg-black/20 backdrop-blur-md items-center justify-between px-10 relative z-10 shrink-0 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Portal do Aluno</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white capitalize">{menuItems.find(m => m.id === activeTab)?.label || activeTab}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar aulas..."
                className="bg-black/50 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors w-64"
              />
            </div>
            <button
              onClick={() => setActiveTab('mensagens')}
              className="relative p-2 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 relative z-10">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10">
        <div className="flex items-stretch justify-around px-1 py-1">
          {menuItems.slice(0, 4).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all relative ${isActive ? 'text-cyan-400' : 'text-gray-500'}`}
              >
                {isActive && (
                  <motion.div layoutId="mobileActiveTab" className="absolute inset-0 bg-cyan-500/10 rounded-xl" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                )}
                <div className="relative">
                  <Icon className="w-5 h-5 relative z-10" />
                  {item.badge != null && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cyan-500 text-black text-[9px] font-black flex items-center justify-center z-20">{item.badge}</span>
                  )}
                </div>
                <span className="text-[10px] font-bold relative z-10 leading-none">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
          <button
            onClick={() => setActiveTab('financeiro')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all relative ${activeTab === 'financeiro' ? 'text-cyan-400' : 'text-gray-500'}`}
          >
            {activeTab === 'financeiro' && <motion.div layoutId="mobileActiveTab" className="absolute inset-0 bg-cyan-500/10 rounded-xl" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
            <CreditCard className="w-5 h-5 relative z-10" />
            <span className="text-[10px] font-bold relative z-10 leading-none">Financeiro</span>
          </button>
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all relative ${activeTab === 'perfil' ? 'text-cyan-400' : 'text-gray-500'}`}
          >
            {activeTab === 'perfil' && <motion.div layoutId="mobileActiveTab" className="absolute inset-0 bg-cyan-500/10 rounded-xl" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
            <img src={profile?.avatar_url || `https://i.pravatar.cc/150?u=${uid || 1}`} alt="User" className="w-5 h-5 rounded-full border border-cyan-500/40 relative z-10 object-cover" />
            <span className="text-[10px] font-bold relative z-10 leading-none">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function DashboardView({ setActiveTab, data, studentData, messages, invoices, agendaItems }: any) {
  const profile = studentData?.profile;
  const enrollments = studentData?.enrollments || [];
  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc: number, curr: any) => acc + (curr.progress || 0), 0) / enrollments.length)
    : 0;
  const mainEnrollment = enrollments[0];
  const unreadMessages = (messages || []).filter((m: any) => !m.read).length;
  const pendingInvoices = (invoices || []).filter((inv: any) => inv.status === 'Pendente').length;
  const today = new Date().toISOString().split('T')[0];
  const nextEvent = (agendaItems || []).find((i: any) => i.date >= today);

  const activeModule = data?.modules?.find((m: any) => m.title === mainEnrollment?.module || m.slug === mainEnrollment?.module_slug);
  const lessons = activeModule?.details?.lessons || [];
  const completedLessons = mainEnrollment ? Math.floor((mainEnrollment.progress || 0) / (100 / Math.max(lessons.length, 1))) : 0;
  const nextLesson = lessons[completedLessons];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-[2rem] border-white/5 bg-gradient-to-br from-blue-900/20 to-cyan-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">{greeting},</p>
            <h2 className="text-2xl md:text-3xl font-black text-white font-display mb-2">
              {profile?.full_name?.split(' ')[0] || 'Aluno'} 👋
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              {totalProgress === 0 ? 'Pronto para começar sua jornada no mundo da dublagem?' :
               totalProgress === 100 ? '🎉 Você concluiu sua formação! Parabéns!' :
               `Você está ${totalProgress}% do caminho. Continue assim!`}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-black/40 px-5 py-4 rounded-2xl border border-white/5 backdrop-blur-md shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22d3ee" strokeWidth="10"
                  strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * totalProgress / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-black text-white">{totalProgress}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Progresso</p>
              <p className="text-white font-bold text-sm">{mainEnrollment?.module || 'Sem matrícula'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{enrollments.length} módulo(s) ativo(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button onClick={() => setActiveTab('cursos')}
          className="glass-panel p-4 rounded-2xl border-white/5 flex flex-col gap-3 hover:border-cyan-500/30 transition-colors text-left">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Aulas Concluídas</p>
            <p className="font-bold text-white text-lg leading-none">{completedLessons}<span className="text-gray-500 text-sm font-normal">/{lessons.length || '–'}</span></p>
          </div>
        </button>

        <button onClick={() => setActiveTab('mensagens')}
          className="glass-panel p-4 rounded-2xl border-white/5 flex flex-col gap-3 hover:border-blue-500/30 transition-colors text-left relative">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <MessageSquare className="w-4 h-4" />
            {unreadMessages > 0 && <span className="absolute top-3 right-3 w-2 h-2 bg-cyan-500 rounded-full" />}
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Mensagens</p>
            <p className={`font-bold text-lg leading-none ${unreadMessages > 0 ? 'text-cyan-400' : 'text-white'}`}>
              {unreadMessages > 0 ? `${unreadMessages} nova${unreadMessages > 1 ? 's' : ''}` : 'Em dia'}
            </p>
          </div>
        </button>

        <button onClick={() => setActiveTab('financeiro')}
          className={`glass-panel p-4 rounded-2xl border-white/5 flex flex-col gap-3 transition-colors text-left ${pendingInvoices > 0 ? 'hover:border-yellow-500/30' : 'hover:border-green-500/30'}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${pendingInvoices > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Financeiro</p>
            <p className={`font-bold text-lg leading-none ${pendingInvoices > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              {pendingInvoices > 0 ? `${pendingInvoices} pendente${pendingInvoices > 1 ? 's' : ''}` : 'Em dia'}
            </p>
          </div>
        </button>

        <button onClick={() => setActiveTab('agenda')}
          className="glass-panel p-4 rounded-2xl border-white/5 flex flex-col gap-3 hover:border-purple-500/30 transition-colors text-left">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Próximo Evento</p>
            <p className="font-bold text-white text-sm leading-tight truncate">{nextEvent ? nextEvent.title : 'Nenhum'}</p>
            {nextEvent && <p className="text-xs text-purple-400 mt-0.5">{new Date(nextEvent.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>}
          </div>
        </button>
      </div>

      {/* Next Lesson CTA */}
      {nextLesson && (
        <button onClick={() => setActiveTab('cursos')}
          className="w-full glass-panel p-5 rounded-2xl border-white/5 hover:border-cyan-500/30 transition-all text-left flex items-center justify-between gap-4 group">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-0.5">Continuar de onde parou</p>
              <p className="font-bold text-white truncate">Aula {completedLessons + 1}: {nextLesson}</p>
              <p className="text-xs text-gray-500 mt-0.5">{activeModule?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-cyan-400 shrink-0">
            <span className="text-sm font-bold hidden sm:block">Continuar</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      )}

      {/* Recent Messages */}
      {messages.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm">Mensagens Recentes</h3>
            <button onClick={() => setActiveTab('mensagens')} className="text-xs text-cyan-400 hover:underline font-bold">Ver todas</button>
          </div>
          <div className="space-y-2">
            {messages.slice(0, 3).map((msg: any) => (
              <div key={msg.id} className={`flex items-start gap-3 p-3 rounded-xl ${!msg.read ? 'bg-cyan-500/5 border border-cyan-500/10' : 'bg-white/[0.02]'}`}>
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{msg.title}</p>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{msg.body}</p>
                </div>
                {!msg.read && <span className="w-2 h-2 bg-cyan-500 rounded-full shrink-0 mt-2" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CursosView({ data, studentData }: any) {
  const enrollments = studentData?.enrollments || [];
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 font-display">Meus Cursos</h2>
        <p className="text-muted-foreground">Acompanhe seu progresso em cada módulo da formação.</p>
      </div>
      <div className="space-y-6">
        {data.modules?.map((mod: any, i: number) => {
          const enrollment = enrollments.find((e: any) => e.module_slug === mod.slug || e.module === mod.title);
          const progress = enrollment ? enrollment.progress : 0;
          const isEnrolled = !!enrollment;
          return (
            <div key={i} className="glass-panel p-6 md:p-8 rounded-3xl border-white/5 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 flex flex-col justify-center">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Módulo {mod.num}</div>
                <h3 className="text-2xl font-bold text-white font-display mb-4">{mod.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{mod.desc}</p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progresso</span>
                    <span className="text-white font-bold">{progress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${progress === 100 ? 'bg-green-400' : progress > 0 ? 'bg-cyan-400' : 'bg-transparent'}`} style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
                <Button className={`w-full rounded-xl py-6 ${!isEnrolled ? 'bg-white/5 text-gray-500 cursor-not-allowed' : progress === 100 ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-cyan-500 text-black hover:bg-cyan-400 whimsy-hover'}`}>
                  {!isEnrolled ? 'Bloqueado' : progress === 100 ? 'Revisar Módulo' : 'Continuar Módulo'}
                </Button>
              </div>
              <div className="w-full md:w-2/3 bg-black/40 rounded-2xl p-6 border border-white/5">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Aulas do Módulo</h4>
                <div className="space-y-3">
                  {mod.details?.lessons?.map((lesson: string, j: number) => {
                    const isCompleted = isEnrolled && (progress === 100 || j < Math.floor(progress / (100 / mod.details.lessons.length)));
                    const isCurrent = isEnrolled && progress < 100 && j === Math.floor(progress / (100 / mod.details.lessons.length));
                    const isLocked = !isEnrolled || (!isCompleted && !isCurrent);
                    return (
                      <div key={j} className={`flex items-center justify-between p-4 rounded-xl border ${isCurrent ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-transparent'} transition-colors`}>
                        <div className="flex items-center gap-4">
                          {isCompleted ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                            : isCurrent ? <PlayCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                            : <Lock className="w-5 h-5 text-gray-600 shrink-0" />}
                          <span className={`font-medium ${isCompleted ? 'text-gray-300' : isCurrent ? 'text-white' : 'text-gray-500'}`}>{j + 1}. {lesson}</span>
                        </div>
                        <span className="text-xs text-muted-foreground hidden sm:block">Aula {j + 1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MensagensView({ messages, setMessages, uid }: any) {
  const handleDelete = async (id: string) => {
    await firebaseService.deleteStudentMessage(id);
    setMessages((prev: any[]) => prev.filter(m => m.id !== id));
  };

  const formatDate = (ts: any) => {
    if (!ts) return '';
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 font-display">Mensagens</h2>
        <p className="text-muted-foreground">Comunicados e avisos da sua escola.</p>
      </div>
      {messages.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border-white/5 flex flex-col items-center justify-center text-center">
          <MessageSquare className="w-12 h-12 text-gray-600 mb-4" />
          <p className="text-gray-400 font-medium">Nenhuma mensagem ainda.</p>
          <p className="text-gray-600 text-sm mt-1">Quando a escola enviar um aviso, ele aparecerá aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg: any) => (
            <div key={msg.id} className={`glass-panel p-6 rounded-2xl border-white/5 ${!msg.read ? 'border-l-4 border-l-cyan-500' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-white">{msg.title}</h4>
                      {!msg.read && <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">Nova</span>}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{msg.body}</p>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(msg.created_at)}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(msg.id)} className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function FinanceiroView({ invoices, setInvoices, onPay }: any) {
  const formatDate = (val: string) => val || '—';
  const pending = invoices.find((inv: any) => inv.status === 'Pendente');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 font-display">Financeiro</h2>
        <p className="text-muted-foreground">Gerencie suas mensalidades e histórico de pagamentos.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border-white/5 flex flex-col justify-center">
          <p className="text-sm text-muted-foreground mb-1">Próximo Vencimento</p>
          {pending ? (
            <>
              <h3 className="text-3xl font-bold text-white mb-2">{pending.amount}</h3>
              <p className="text-sm text-yellow-400 font-medium mb-6">Vence em {formatDate(pending.due_date)}</p>
              <Button onClick={onPay} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl whimsy-hover">
                Pagar Agora
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-3xl font-bold text-green-400 mb-2">Em dia</h3>
              <p className="text-sm text-gray-400 font-medium">Nenhuma fatura pendente.</p>
            </>
          )}
        </div>
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border-white/5">
          <h4 className="text-lg font-bold text-white mb-6">Histórico de Faturas</h4>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CreditCard className="w-10 h-10 text-gray-600 mb-3" />
              <p className="text-gray-400">Nenhuma fatura registrada ainda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((inv: any) => (
                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      inv.status === 'Pago' ? 'bg-green-500/20 text-green-400' :
                      inv.status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {inv.status === 'Pago' ? <CheckCircle className="w-5 h-5" /> :
                       inv.status === 'Pendente' ? <AlertCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-white">{inv.description}</p>
                      <p className="text-sm text-muted-foreground">Vencimento: {formatDate(inv.due_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <span className="font-bold text-white">{inv.amount}</span>
                    {inv.status === 'Pago' ? (
                      <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold uppercase">Pago</span>
                    ) : inv.status === 'Pendente' ? (
                      <Button onClick={onPay} size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg">Pagar</Button>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-500/10 text-gray-400 text-xs font-bold uppercase">A Vencer</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgendaView({ agendaItems }: any) {
  const typeColor = (type: string) => {
    switch (type) {
      case 'Aula': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Prova': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Banca': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };
  const today = new Date().toISOString().split('T')[0];
  const upcoming = agendaItems.filter((i: any) => i.date >= today);
  const past = agendaItems.filter((i: any) => i.date < today);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 font-display">Agenda</h2>
        <p className="text-muted-foreground">Próximas aulas, provas e eventos da sua turma.</p>
      </div>
      {agendaItems.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border-white/5 flex flex-col items-center justify-center text-center">
          <Calendar className="w-12 h-12 text-gray-600 mb-4" />
          <p className="text-gray-400 font-medium">Nenhum evento agendado ainda.</p>
          <p className="text-gray-600 text-sm mt-1">A escola publicará os próximos eventos aqui.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Próximos Eventos</h3>
              {upcoming.map((item: any) => (
                <div key={item.id} className="glass-panel p-5 rounded-2xl border-white/5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs text-gray-400 font-medium">{new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                      <span className="text-xl font-black text-white leading-none">{new Date(item.date + 'T12:00:00').getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white">{item.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${typeColor(item.type)}`}>{item.type}</span>
                      </div>
                      {item.description && <p className="text-sm text-gray-400">{item.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 shrink-0">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Eventos Passados</h3>
              {past.map((item: any) => (
                <div key={item.id} className="glass-panel p-5 rounded-2xl border-white/5 flex items-center gap-4 opacity-50">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs text-gray-500 font-medium">{new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                    <span className="text-xl font-black text-gray-400 leading-none">{new Date(item.date + 'T12:00:00').getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-300">{item.title}</h4>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold border bg-white/5 text-gray-500 border-white/10">{item.type}</span>
                    </div>
                    {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                  </div>
                  <CheckCheck className="w-5 h-5 text-green-500 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SuporteView({ uid, profile }: { uid: string; profile: any }) {
  const [subject, setSubject] = useState('Dúvida sobre aulas');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!uid) return;
    firebaseService.getSupportTickets(uid).then(t => setTickets((t as any[]) || []));
  }, [uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    try {
      await firebaseService.createSupportTicket(uid, {
        subject,
        message,
        email: profile?.email || '',
        name: profile?.full_name || 'Aluno'
      });
      const updated = await firebaseService.getSupportTickets(uid);
      setTickets((updated as any[]) || []);
      setMessage('');
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const statusColor = (s: string) => s === 'Resolvido' ? 'text-green-400 bg-green-500/10' : s === 'Em Análise' ? 'text-yellow-400 bg-yellow-500/10' : 'text-blue-400 bg-blue-500/10';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 font-display">Suporte ao Aluno</h2>
        <p className="text-muted-foreground">Precisa de ajuda? Nossa equipe está pronta para te atender.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 rounded-3xl border-white/5">
          <h3 className="text-xl font-bold text-white mb-6">Abrir um Chamado</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Assunto</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors appearance-none"
              >
                <option>Dúvida sobre aulas</option>
                <option>Problema técnico na plataforma</option>
                <option>Questões financeiras</option>
                <option>Agendamento de reposição</option>
                <option>Outros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Mensagem</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white h-32 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                placeholder="Descreva seu problema ou dúvida em detalhes..."
                required
              />
            </div>
            <Button type="submit" disabled={isSending} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl py-6 whimsy-hover">
              {sent ? <><CheckCheck className="w-4 h-4 mr-2" /> Enviado!</> : isSending ? 'Enviando...' : <><Send className="w-4 h-4 mr-2" /> Enviar Chamado</>}
            </Button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-3xl border-white/5">
            <h4 className="text-base font-bold text-white mb-4">Meus Chamados</h4>
            {tickets.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Nenhum chamado aberto.</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((t: any) => (
                  <div key={t.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-white">{t.subject}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(t.status)}`}>{t.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{t.message}</p>
                    {t.admin_reply && (
                      <div className="mt-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                        <p className="text-xs font-bold text-cyan-400 mb-1">Resposta da escola:</p>
                        <p className="text-xs text-gray-300">{t.admin_reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="glass-panel p-6 rounded-3xl border-white/5 flex items-center gap-4 group cursor-pointer hover:border-cyan-500/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">Comunidade no Discord</h4>
              <p className="text-sm text-muted-foreground">Tire dúvidas com outros alunos.</p>
            </div>
            <ExternalLink className="w-5 h-5 text-gray-500 ml-auto group-hover:text-cyan-400 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PerfilView({ uid, profile }: { uid: string; profile: any }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
    phone: profile?.phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await firebaseService.updateStudentProfile(uid, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at?.seconds ? profile.created_at.seconds * 1000 : profile.created_at)
        .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black text-white mb-1 font-display">Meu Perfil</h2>
        <p className="text-muted-foreground text-sm">Gerencie suas informações pessoais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="glass-panel p-8 rounded-3xl border-white/5 flex flex-col items-center text-center">
          <div className="relative mb-5">
            <img
              src={form.avatar_url || `https://i.pravatar.cc/150?u=${uid}`}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-cyan-500/30 object-cover"
            />
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-cyan-500 border-2 border-[#0a0a0a] flex items-center justify-center">
              <Camera className="w-4 h-4 text-black" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-0.5">{form.full_name || 'Aluno'}</h3>
          <p className="text-sm text-cyan-400 mb-1">Aluno Ativo</p>
          <p className="text-xs text-gray-500">{profile?.email || '—'}</p>
          <div className="w-full mt-6 pt-5 border-t border-white/5 space-y-3 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">Ativo</span>
            </div>
            {memberSince && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Membro desde</span>
                <span className="text-white font-medium text-xs capitalize">{memberSince}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 glass-panel p-6 md:p-8 rounded-3xl border-white/5">
          <h3 className="text-lg font-bold text-white mb-6">Editar Informações</h3>
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nome Completo</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">URL da Foto de Perfil</label>
              <input
                type="url"
                value={form.avatar_url}
                onChange={e => setForm({ ...form, avatar_url: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="https://..."
              />
              <p className="text-xs text-gray-600 mt-1.5">Cole o link de uma imagem pública (ex: imgur, gravatar)</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">WhatsApp / Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">E-mail</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-600 mt-1.5">O e-mail não pode ser alterado por aqui</p>
            </div>
            <div className="pt-2">
              <Button type="submit" disabled={isSaving} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl py-4 whimsy-hover">
                {saved
                  ? <><CheckCircle className="w-4 h-4 mr-2 inline" /> Salvo com sucesso!</>
                  : isSaving ? 'Salvando...'
                  : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
