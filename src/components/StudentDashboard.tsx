import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, CreditCard, Lock,
  HelpCircle, LogOut, Bell, Search, 
  Clock, Award, ChevronRight, Mic,
  AlertCircle,
  CheckCircle, MessageSquare, ExternalLink,
  PartyPopper, Sparkles, PlayCircle, Trophy,
  Star, BookOpen, Video, Phone
} from 'lucide-react';
import { Button } from './ui/button';

// TODO: Configure Stripe Public Key when ready
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

const TAB_LABELS: Record<string, string> = {
  dashboard: 'Início',
  cursos: 'Meus Cursos',
  conquistas: 'Conquistas',
  financeiro: 'Financeiro',
  suporte: 'Suporte',
};

export function StudentDashboard({ onLogout, onHome, data, studentData }: any) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profile = studentData?.profile;
  const enrollments = studentData?.enrollments || [];
  const mainEnrollment = enrollments[0];

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'cursos', label: 'Meus Cursos', icon: BookOpen },
    { id: 'conquistas', label: 'Conquistas', icon: Trophy },
    { id: 'financeiro', label: 'Financeiro', icon: CreditCard },
    { id: 'suporte', label: 'Suporte', icon: HelpCircle },
  ];

  const handleStripePayment = async (invoiceId: string) => {
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 3000);
    console.log('Iniciando pagamento via Stripe para a fatura:', invoiceId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView setActiveTab={setActiveTab} data={data} studentData={studentData} />;
      case 'cursos': return <CursosView data={data} studentData={studentData} />;
      case 'conquistas': return <ConquistasView studentData={studentData} />;
      case 'financeiro': return <FinanceiroView onPay={handleStripePayment} />;
      case 'suporte': return <SuporteView />;
      default: return <DashboardView setActiveTab={setActiveTab} data={data} studentData={studentData} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex text-foreground font-sans">
      {/* Sidebar — desktop only — stays graphite */}
      <aside className="w-64 bg-[#111111] border-r border-gray-800 hidden md:flex flex-col relative z-20 shadow-xl shrink-0">
        <div className="p-6 flex items-center gap-3 cursor-pointer group" onClick={onHome}>
          <motion.div
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center shadow-lg"
          >
            <Mic className="w-5 h-5 text-cyan-400" />
          </motion.div>
          <div>
            <span className="font-black text-lg tracking-tighter font-display text-white block leading-none">Escola</span>
            <span className="font-bold text-xs tracking-widest text-cyan-500 uppercase">Dublagem</span>
          </div>
        </div>

        {/* Profile card */}
        <div className="px-4 mb-6">
          <div className="bg-white/5 border border-white/8 p-3.5 rounded-2xl flex items-center gap-3">
            <img
              src={profile?.avatar_url || `https://i.pravatar.cc/80?u=${profile?.full_name || '1'}`}
              alt={profile?.full_name || 'Aluno'}
              className="w-10 h-10 rounded-full border-2 border-white/20 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile?.full_name || 'Aluno'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"></span>
                <p className="text-xs text-gray-400">
                  {mainEnrollment ? mainEnrollment.module || 'Módulo Ativo' : 'Sem matrícula'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1" role="navigation" aria-label="Menu principal">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-left relative group ${
                  isActive ? 'text-white' : 'text-gray-500 hover:text-gray-200'
                }`}
              >
                {isActive && (
                  <>
                    <motion.div
                      layoutId="activeStudentTab"
                      className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                    <motion.div
                      layoutId="activeStudentTabAccent"
                      className="absolute left-0 top-2 bottom-2 w-0.5 bg-cyan-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  </>
                )}
                <Icon className={`relative z-10 shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} style={{ width: '1.1rem', height: '1.1rem' }} />
                <span className="relative z-10 text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/8">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" /> Sair da conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#f4f5f7]">

        {/* Celebration Overlay */}
        <AnimatePresence>
          {isCelebrating && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5, opacity: 0 }}
                className="bg-gradient-to-br from-green-400 to-emerald-600 p-8 rounded-3xl text-center shadow-2xl"
              >
                <PartyPopper className="w-16 h-16 text-white mx-auto mb-4" />
                <h2 className="text-2xl font-black text-white font-display mb-2">Pagamento Confirmado!</h2>
                <p className="text-green-50 font-medium">Sua matrícula está ativa. Bons estudos!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-gray-200 bg-white flex items-center justify-between px-5 relative z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onHome}>
            <div className="w-8 h-8 rounded-lg bg-[#111111] flex items-center justify-center">
              <Mic className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-black text-base font-display text-gray-900">Escola Dublagem</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              aria-label="Notificações"
              className="relative p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Desktop Topbar */}
        <header className="hidden md:flex h-16 border-b border-gray-200 bg-white items-center justify-between px-8 relative z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Portal do Aluno</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-900 font-semibold">{TAB_LABELS[activeTab] ?? activeTab}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
              <input
                type="text"
                placeholder="Buscar aulas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-gray-50 border border-gray-300 rounded-full pl-9 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-500 transition-colors w-56"
              />
            </div>
            <button
              aria-label="Notificações"
              className="relative p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
            >
              <Bell style={{ width: '1.1rem', height: '1.1rem' }} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.99, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.99, y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav
          role="navigation"
          aria-label="Navegação principal"
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] flex items-center justify-around px-2 h-16"
        >
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-xl transition-all flex-1 ${
                  isActive ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute inset-0 bg-gray-100 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] font-semibold relative z-10 leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
}

function useGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function AnimatedRing({ progress }: { progress: number }) {
  const [displayed, setDisplayed] = React.useState(0);
  const r = 40;
  const circ = 2 * Math.PI * r;

  React.useEffect(() => {
    const t = setTimeout(() => setDisplayed(progress), 120);
    return () => clearTimeout(t);
  }, [progress]);

  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="transparent" stroke="rgba(0,0,0,0.08)" strokeWidth="9" />
        <circle
          cx="50" cy="50" r={r} fill="transparent" stroke="#0891b2" strokeWidth="9"
          strokeDasharray={circ}
          strokeDashoffset={circ - (circ * displayed / 100)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-base font-black text-gray-900">{displayed}%</span>
      </div>
    </div>
  );
}

const LIVE_CLASSES = [
  { month: 'MAI', day: '20', title: 'Masterclass: Interpretação para Games', time: '19:00 – 21:00', teacher: 'Prof. Ettore Zuim' },
  { month: 'MAI', day: '27', title: 'Workshop: Sync Labial na Prática', time: '18:30 – 20:30', teacher: 'Prof. Ana Lima' },
];

function DashboardView({ setActiveTab, data, studentData }: any) {
  const greeting = useGreeting();
  const profile = studentData?.profile;
  const enrollments = studentData?.enrollments || [];

  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc: number, curr: any) => acc + (curr.progress || 0), 0) / enrollments.length)
    : 0;

  const mainEnrollment = enrollments[0];
  const firstName = profile?.full_name?.split(' ')[0] || 'Aluno';

  const studyHours = Math.round(totalProgress * 0.3);
  const lessonsWatched = Math.round(totalProgress / 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner — stays dark as visual anchor */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="p-6 md:p-8 rounded-[2rem] bg-gradient-to-br from-gray-900 to-[#111111] relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">{greeting},</p>
            <h2 className="text-2xl md:text-3xl font-black text-white font-display mb-2">{firstName} 👋</h2>
            <p className="text-gray-400 text-sm md:text-base">
              {totalProgress > 0 ? `Você está ${totalProgress}% do caminho. Continue assim!` : 'Pronto para começar sua jornada no mundo da dublagem?'}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/8 px-5 py-4 rounded-2xl border border-white/10 shrink-0">
            <AnimatedRing progress={totalProgress} />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Progresso</p>
              <p className="text-white font-bold text-sm">{mainEnrollment ? mainEnrollment.module || 'Novo Módulo' : 'Sem matrícula'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{enrollments.length} módulo(s) ativo(s)</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Continue Learning */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 font-display">Continue de onde parou</h3>
              <button onClick={() => setActiveTab('cursos')} className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1 transition-colors">
                Ver todos <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <motion.div
              whileHover={{ y: -2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="bg-white border border-gray-200 shadow-sm p-4 rounded-2xl group cursor-pointer hover:border-gray-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-52 h-32 rounded-xl bg-gray-100 relative overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop"
                    alt="Thumbnail da aula"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.12 }}
                      className="w-11 h-11 rounded-full bg-gray-900/90 text-white flex items-center justify-center shadow-lg"
                    >
                      <PlayCircle className="w-5 h-5 ml-0.5" />
                    </motion.div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-gray-900/80 px-2 py-0.5 rounded text-xs font-bold text-white">
                    12:45
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center py-1">
                  <div className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1.5">
                    {mainEnrollment ? `${mainEnrollment.module || 'Módulo Ativo'} • Aula 04` : 'Módulo Iniciante • Aula 04'}
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-2">Leitura Dinâmica de Roteiros e Marcações</h4>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">Aprenda as marcações corretas antes de entrar no estúdio para gravar.</p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${totalProgress || 60}%`, transition: 'width 1s ease-out' }} />
                    </div>
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{totalProgress || 60}% concluído</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Live Classes */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <h3 className="text-lg font-bold text-gray-900 font-display mb-4">Próximas Aulas ao Vivo</h3>
            <div className="space-y-3">
              {LIVE_CLASSES.map((cls, i) => (
                <div key={i} className="bg-white border border-gray-200 shadow-sm p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] text-gray-500 font-bold uppercase leading-none">{cls.month}</span>
                      <span className="text-lg font-black text-gray-900 leading-tight">{cls.day}</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-gray-900 text-sm leading-snug">{cls.title}</h5>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" /> {cls.time} · {cls.teacher}
                      </p>
                    </div>
                  </div>
                  <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl shrink-0 text-xs h-8 px-4">
                    Lembrete
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Mini Conquistas */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="bg-white border border-gray-200 shadow-sm p-5 rounded-2xl"
          >
            <h3 className="text-sm font-bold text-gray-900 font-display mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> Conquistas Recentes
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Primeiro Play' },
                { icon: Mic, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', label: 'Voz Aquecida' },
                { icon: Award, color: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200', label: 'Mestre Sync', locked: true },
              ].map((b, idx) => (
                <motion.div key={idx} whileHover={!b.locked ? { scale: 1.08 } : {}} className={`flex flex-col items-center text-center gap-1.5 ${b.locked ? 'opacity-40' : ''}`}>
                  <div className={`w-11 h-11 rounded-full ${b.bg} border ${b.border} flex items-center justify-center ${b.color}`}>
                    <b.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-600 leading-tight">{b.label}</span>
                </motion.div>
              ))}
            </div>
            <button onClick={() => setActiveTab('conquistas')} className="w-full mt-4 py-2 text-xs text-cyan-600 font-semibold hover:bg-cyan-50 rounded-lg transition-colors">
              Ver todas →
            </button>
          </motion.div>

          {/* Study Summary */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
            className="bg-white border border-gray-200 shadow-sm p-5 rounded-2xl"
          >
            <h3 className="text-sm font-bold text-gray-900 font-display mb-4">Resumo de Estudo</h3>
            <div className="space-y-2">
              {[
                { icon: Video, color: 'text-blue-500', label: 'Aulas Assistidas', value: lessonsWatched || 24 },
                { icon: Clock, color: 'text-purple-500', label: 'Horas de Estudo', value: `${studyHours || 18}h` },
                { icon: CheckCircle, color: 'text-green-500', label: 'Exercícios', value: enrollments.length > 0 ? enrollments.length * 2 : 5 },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs text-gray-600">{stat.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AnimatedBar({ progress, color = '#22d3ee' }: { progress: number; color?: string }) {
  const [w, setW] = React.useState(0);
  React.useEffect(() => { const t = setTimeout(() => setW(progress), 80); return () => clearTimeout(t); }, [progress]);
  return (
    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${w}%`, backgroundColor: color, transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)' }} />
    </div>
  );
}

function CursosView({ data, studentData }: any) {
  const enrollments = studentData?.enrollments || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-1 font-display">Meus Cursos</h2>
        <p className="text-sm text-gray-500">Acompanhe seu progresso em cada módulo da formação.</p>
      </div>

      <div className="space-y-5">
        {data.modules?.map((mod: any, i: number) => {
          const enrollment = enrollments.find((e: any) => e.module_slug === mod.slug);
          const progress = enrollment ? enrollment.progress : 0;
          const isEnrolled = !!enrollment;
          const barColor = progress === 100 ? '#16a34a' : '#0891b2';

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white border border-gray-200 shadow-sm p-5 md:p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:border-gray-300 transition-colors"
            >
              <div className="w-full md:w-56 flex flex-col justify-between shrink-0">
                <div>
                  <div className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1">Módulo {mod.num}</div>
                  <h3 className="text-lg font-bold text-gray-900 font-display mb-2">{mod.title}</h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-3">{mod.desc}</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Progresso</span>
                    <span className="font-bold text-gray-900">{progress}%</span>
                  </div>
                  <AnimatedBar progress={progress} color={barColor} />
                  <Button
                    disabled={!isEnrolled}
                    className={`w-full rounded-xl mt-3 text-sm py-5 ${
                      !isEnrolled ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' :
                      progress === 100 ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200' :
                      'bg-gray-900 hover:bg-gray-800 text-white font-bold'
                    }`}
                  >
                    {!isEnrolled ? <><Lock className="w-3.5 h-3.5 mr-1.5" />Bloqueado</> :
                     progress === 100 ? 'Revisar Módulo' : 'Continuar Módulo'}
                  </Button>
                </div>
              </div>

              <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Aulas do Módulo</h4>
                <div className="space-y-1.5">
                  {mod.details?.lessons?.map((lesson: string, j: number) => {
                    const isCompleted = isEnrolled && (progress === 100 || j < Math.floor(progress / 20));
                    const isCurrent = isEnrolled && progress < 100 && j === Math.floor(progress / 20);

                    return (
                      <div
                        key={j}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors ${
                          isCurrent ? 'bg-cyan-50 border-cyan-200 border-l-2 border-l-cyan-500' :
                          isCompleted ? 'bg-white border-gray-100' :
                          'border-transparent opacity-40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isCompleted ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> :
                           isCurrent ? <PlayCircle className="w-4 h-4 text-cyan-600 shrink-0" /> :
                           <Lock className="w-4 h-4 text-gray-400 shrink-0" />}
                          <span className={`text-sm ${isCompleted ? 'text-gray-400 line-through' : isCurrent ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                            {j + 1}. {lesson}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 hidden sm:block shrink-0 ml-3">15:00</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const ALL_BADGES = [
  { id: 1, title: 'Primeiro Play', desc: 'Assistiu a primeira aula', hint: '', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', unlocked: true },
  { id: 2, title: 'Voz Aquecida', desc: 'Completou exercícios de respiração', hint: '', icon: Mic, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', unlocked: true },
  { id: 3, title: 'Módulo 1 Concluído', desc: 'Finalizou o módulo iniciante', hint: '', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', unlocked: true },
  { id: 4, title: 'Mestre Lip-Sync', desc: 'Acertou 90% no exercício de sync', hint: 'Complete o exercício de Lip-Sync no Módulo 2', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', unlocked: false },
  { id: 5, title: 'Ator de Voz', desc: 'Gravou o primeiro personagem', hint: 'Entregue o exercício de gravação do Módulo 3', icon: Video, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200', unlocked: false },
  { id: 6, title: 'Formação Completa', desc: 'Concluiu todo o curso', hint: 'Finalize 100% de todos os módulos', icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', unlocked: false },
];

function ConquistasView({ studentData }: any) {
  const unlocked = ALL_BADGES.filter(b => b.unlocked).length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-1 font-display">Conquistas</h2>
          <p className="text-sm text-gray-500">Desbloqueie medalhas ao progredir no curso.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-gray-900">{unlocked}<span className="text-gray-400 text-base font-medium">/{ALL_BADGES.length}</span></p>
          <p className="text-xs text-gray-500">desbloqueadas</p>
        </div>
      </div>

      {/* Progress */}
      <AnimatedBar progress={Math.round(unlocked / ALL_BADGES.length * 100)} color="#ca8a04" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_BADGES.map((badge, idx) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.88, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.06, type: 'spring', stiffness: 280, damping: 22 }}
              whileHover={badge.unlocked ? { y: -3, scale: 1.02 } : {}}
              className={`bg-white border border-gray-200 shadow-sm p-5 rounded-2xl flex flex-col items-center text-center transition-all hover:border-gray-300 relative overflow-hidden ${!badge.unlocked ? 'opacity-45 grayscale' : ''}`}
            >
              <div className={`relative w-16 h-16 rounded-full ${badge.bg} border ${badge.border} flex items-center justify-center ${badge.color} mb-3`}>
                <Icon className="w-8 h-8" />
                {badge.unlocked && (
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                  </motion.div>
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-0.5">{badge.title}</h4>
              <p className="text-xs text-gray-500 leading-snug">{badge.desc}</p>
              {!badge.unlocked && badge.hint && (
                <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-500 flex items-center gap-1.5 text-left w-full">
                  <Lock className="w-3 h-3 shrink-0 text-gray-400" />
                  <span>{badge.hint}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function FinanceiroView({ onPay }: { onPay: (id: string) => void }) {
  const invoices = [
    { id: 'FAT-001', desc: 'Mensalidade — Módulo Iniciante', date: '05/10/2026', amount: 'R$ 450,00', status: 'paid' },
    { id: 'FAT-002', desc: 'Mensalidade — Módulo Iniciante', date: '05/11/2026', amount: 'R$ 450,00', status: 'pending' },
    { id: 'FAT-003', desc: 'Mensalidade — Módulo Iniciante', date: '05/12/2026', amount: 'R$ 450,00', status: 'future' },
  ];

  const pending = invoices.find(i => i.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-1 font-display">Financeiro</h2>
        <p className="text-sm text-gray-500">Gerencie suas mensalidades e histórico de pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pending payment card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
          className="bg-amber-50 border border-amber-300 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-sm"
        >
          <div className="relative">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1">Próximo Vencimento</p>
            <h3 className="text-3xl font-black text-gray-900 mb-1">{pending?.amount ?? '—'}</h3>
            <p className="text-xs text-amber-700 font-medium mb-6">Vence em {pending?.date ?? '—'}</p>
          </div>
          <motion.button
            onClick={() => pending && onPay(pending.id)}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="relative overflow-hidden w-full bg-gray-900 hover:bg-gray-800 text-white font-black text-sm rounded-xl py-3 shadow-md focus:outline-none"
          >
            <motion.span
              aria-hidden
              className="absolute inset-y-0 w-1/2 pointer-events-none"
              style={{ background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.15) 50%,transparent 100%)' }}
              animate={{ x: ['-120%', '260%'] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
            />
            <span className="relative z-10">Pagar Agora</span>
          </motion.button>
        </motion.div>

        {/* Invoice history */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="md:col-span-2 bg-white border border-gray-200 shadow-sm p-5 rounded-2xl"
        >
          <h4 className="text-sm font-bold text-gray-900 mb-4">Histórico de Faturas</h4>
          <div className="space-y-2.5">
            {invoices.map((inv) => (
              <div key={inv.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl gap-3 border transition-colors ${inv.status === 'pending' ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    inv.status === 'paid' ? 'bg-green-100 text-green-600' :
                    inv.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {inv.status === 'paid' ? <CheckCircle className="w-4 h-4" /> :
                     inv.status === 'pending' ? <AlertCircle className="w-4 h-4" /> :
                     <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{inv.desc}</p>
                    <p className="text-xs text-gray-500">Venc. {inv.date}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <span className="text-sm font-bold text-gray-900">{inv.amount}</span>
                  {inv.status === 'paid' && <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Pago</span>}
                  {inv.status === 'pending' && <Button onClick={() => onPay(inv.id)} size="sm" className="bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg h-8 px-3 text-xs">Pagar</Button>}
                  {inv.status === 'future' && <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">A Vencer</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function SuporteView() {
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); setMessage(''); setSubject(''); }, 1500);
    setTimeout(() => setSent(false), 5000);
  };

  const quickLinks = [
    { icon: MessageSquare, bg: 'bg-indigo-50', color: 'text-indigo-600', border: 'hover:border-indigo-200', title: 'Comunidade no Discord', desc: 'Tire dúvidas com outros alunos e professores.' },
    { icon: Phone, bg: 'bg-green-50', color: 'text-green-600', border: 'hover:border-green-200', title: 'WhatsApp da Escola', desc: 'Fale direto com a equipe de suporte.' },
    { icon: HelpCircle, bg: 'bg-cyan-50', color: 'text-cyan-600', border: 'hover:border-cyan-200', title: 'Central de Ajuda (FAQ)', desc: 'Respostas para as dúvidas mais comuns.' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-1 font-display">Suporte ao Aluno</h2>
        <p className="text-sm text-gray-500">Nossa equipe está pronta para te atender.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
          className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl"
        >
          <h3 className="text-base font-bold text-gray-900 mb-5">Abrir um Chamado</h3>
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="font-bold text-gray-900">Mensagem enviada!</p>
              <p className="text-sm text-gray-500">Retornaremos em até 24h.</p>
            </motion.div>
          ) : (
            <form id="suporte-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="suporte-assunto" className="block text-xs font-semibold text-gray-600 mb-1.5">Assunto</label>
                <select
                  id="suporte-assunto"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-500 transition-colors appearance-none"
                >
                  <option value="">Selecione...</option>
                  <option>Dúvida sobre aulas</option>
                  <option>Problema técnico na plataforma</option>
                  <option>Questões financeiras</option>
                  <option>Outros</option>
                </select>
              </div>
              <div>
                <label htmlFor="suporte-msg" className="block text-xs font-semibold text-gray-600 mb-1.5">Mensagem</label>
                <textarea
                  id="suporte-msg"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 h-28 focus:outline-none focus:border-gray-500 transition-colors resize-none placeholder:text-gray-400"
                  placeholder="Descreva seu problema em detalhes..."
                />
              </div>
              <Button
                type="submit"
                disabled={sending || !message.trim()}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl py-5 disabled:opacity-50"
              >
                {sending ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2 inline-block" /> Enviando...</> : 'Enviar Mensagem'}
              </Button>
            </form>
          )}
        </motion.div>

        <div className="space-y-3">
          {quickLinks.map((link, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.07 }}
              whileHover={{ x: 3 }}
              className={`bg-white border border-gray-200 shadow-sm p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all hover:shadow-md ${link.border}`}
            >
              <div className={`w-10 h-10 rounded-full ${link.bg} border border-gray-200 flex items-center justify-center ${link.color} shrink-0`}>
                <link.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm">{link.title}</h4>
                <p className="text-xs text-gray-500 leading-snug">{link.desc}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
