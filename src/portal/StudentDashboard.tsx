import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, CreditCard,
  HelpCircle, LogOut, Bell, Search,
  Clock, Award, ChevronRight, Mic,
  Calendar, AlertCircle,
  CheckCircle, MessageSquare,
  ExternalLink, PartyPopper,
  Star, BookOpen, Video, Lock,
  PlayCircle, Trophy, Trash2, Send, CheckCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { firebaseService } from '../services/firebaseService';

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
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'cursos', label: 'Meus Cursos', icon: BookOpen },
    { id: 'mensagens', label: 'Mensagens', icon: MessageSquare, badge: unreadCount },
    { id: 'conquistas', label: 'Conquistas', icon: Trophy },
    { id: 'financeiro', label: 'Financeiro', icon: CreditCard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} data={data} studentData={studentData} messages={messages} invoices={invoices} />;
      case 'cursos':
        return <CursosView data={data} studentData={studentData} />;
      case 'mensagens':
        return <MensagensView messages={messages} setMessages={setMessages} uid={uid} />;
      case 'conquistas':
        return <ConquistasView />;
      case 'financeiro':
        return <FinanceiroView invoices={invoices} setInvoices={setInvoices} onPay={() => { setIsCelebrating(true); setTimeout(() => setIsCelebrating(false), 3000); }} />;
      case 'agenda':
        return <AgendaView agendaItems={agendaItems} />;
      case 'suporte':
        return <SuporteView uid={uid} profile={profile} />;
      default:
        return <DashboardView setActiveTab={setActiveTab} data={data} studentData={studentData} messages={messages} invoices={invoices} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col hidden md:flex relative z-20 shadow-2xl">
        <div className="p-8 flex items-center gap-3 cursor-pointer group" onClick={onHome}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tighter font-display text-white block leading-none">THE HUB</span>
            <span className="font-bold text-sm tracking-widest text-cyan-400 uppercase">Portal do Aluno</span>
          </div>
        </div>

        <div className="px-6 mb-8">
          <div className="glass-panel p-4 rounded-2xl border-white/5 flex items-center gap-4">
            <img src={profile?.avatar_url || `https://i.pravatar.cc/150?u=${uid || 1}`} alt="User" className="w-12 h-12 rounded-full border-2 border-cyan-500/30" />
            <div>
              <p className="text-sm font-bold text-white">{profile?.full_name || 'Aluno'}</p>
              <p className="text-xs text-cyan-400">Aluno Ativo</p>
            </div>
          </div>
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
        <header className="md:hidden h-20 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-6 relative z-10">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onHome}>
            <Mic className="w-6 h-6 text-cyan-400" />
            <span className="font-black text-lg font-display text-white">THE HUB</span>
          </div>
          <button onClick={onLogout} className="p-2 text-muted-foreground hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Topbar Desktop */}
        <header className="hidden md:flex h-20 border-b border-white/5 bg-black/20 backdrop-blur-md items-center justify-between px-10 relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Portal do Aluno</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white capitalize">{activeTab}</span>
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

        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10">
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
    </div>
  );
}

function DashboardView({ setActiveTab, data, studentData, messages, invoices }: any) {
  const profile = studentData?.profile;
  const enrollments = studentData?.enrollments || [];
  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc: number, curr: any) => acc + (curr.progress || 0), 0) / enrollments.length)
    : 0;
  const mainEnrollment = enrollments[0];
  const unreadMessages = (messages || []).filter((m: any) => !m.read).length;
  const pendingInvoices = (invoices || []).filter((inv: any) => inv.status === 'Pendente').length;

  return (
    <div className="space-y-8">
      <div className="glass-panel p-8 md:p-10 rounded-[2rem] border-white/5 bg-gradient-to-br from-blue-900/20 to-cyan-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white font-display mb-2">Bem-vindo de volta, {profile?.full_name?.split(' ')[0] || 'Aluno'}!</h2>
            <p className="text-blue-200/70 text-lg">Você está indo muito bem. Continue assim!</p>
          </div>
          <div className="flex items-center gap-6 bg-black/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22d3ee" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * totalProgress / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{totalProgress}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Progresso Geral</p>
              <p className="text-white font-bold">{mainEnrollment?.module || 'Nenhuma matrícula'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button onClick={() => setActiveTab('cursos')} className="glass-panel p-6 rounded-2xl border-white/5 flex items-center gap-4 hover:border-cyan-500/30 transition-colors text-left">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0"><BookOpen className="w-6 h-6" /></div>
          <div><p className="text-xs text-gray-400 uppercase tracking-wider">Módulo Atual</p><p className="font-bold text-white truncate">{mainEnrollment?.module || '—'}</p></div>
        </button>
        <button onClick={() => setActiveTab('mensagens')} className="glass-panel p-6 rounded-2xl border-white/5 flex items-center gap-4 hover:border-cyan-500/30 transition-colors text-left">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 relative">
            <MessageSquare className="w-6 h-6" />
            {unreadMessages > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-black text-xs font-black flex items-center justify-center">{unreadMessages}</span>}
          </div>
          <div><p className="text-xs text-gray-400 uppercase tracking-wider">Mensagens</p><p className="font-bold text-white">{unreadMessages > 0 ? `${unreadMessages} não lida(s)` : 'Sem novas'}</p></div>
        </button>
        <button onClick={() => setActiveTab('financeiro')} className="glass-panel p-6 rounded-2xl border-white/5 flex items-center gap-4 hover:border-cyan-500/30 transition-colors text-left">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${pendingInvoices > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
            <CreditCard className="w-6 h-6" />
          </div>
          <div><p className="text-xs text-gray-400 uppercase tracking-wider">Financeiro</p><p className="font-bold text-white">{pendingInvoices > 0 ? `${pendingInvoices} pendente(s)` : 'Em dia'}</p></div>
        </button>
      </div>
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

function ConquistasView() {
  const badges = [
    { id: 1, title: 'Primeiro Acesso', desc: 'Entrou no portal pela primeira vez', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', unlocked: true },
    { id: 2, title: 'Voz Aquecida', desc: 'Completou exercícios de respiração', icon: Mic, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', unlocked: true },
    { id: 3, title: 'Módulo 1 Concluído', desc: 'Finalizou o módulo iniciante', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', unlocked: false },
    { id: 4, title: 'Mestre Lip-Sync', desc: 'Acertou 90% no exercício de sync', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', unlocked: false },
    { id: 5, title: 'Ator de Voz', desc: 'Gravou o primeiro personagem', icon: Video, color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/30', unlocked: false },
    { id: 6, title: 'Formação Completa', desc: 'Concluiu todo o curso', icon: Trophy, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', unlocked: false },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 font-display">Conquistas</h2>
        <p className="text-muted-foreground">Desbloqueie medalhas ao progredir no curso e completar desafios.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div key={badge.id} className={`glass-panel p-6 rounded-3xl border-white/5 flex flex-col items-center text-center transition-all ${badge.unlocked ? 'hover:scale-105' : 'opacity-50 grayscale'}`}>
              <div className={`w-20 h-20 rounded-full ${badge.bg} border ${badge.border} flex items-center justify-center ${badge.color} mb-4 shadow-lg`}>
                <Icon className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">{badge.title}</h4>
              <p className="text-sm text-muted-foreground">{badge.desc}</p>
              {!badge.unlocked && (
                <div className="mt-4 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-gray-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Bloqueado
                </div>
              )}
            </div>
          );
        })}
      </div>
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
