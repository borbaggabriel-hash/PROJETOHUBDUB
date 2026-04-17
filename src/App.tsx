import React, { useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { 
  Play, ChevronRight, Star, Users, Mic, 
  Headphones, Video, Award, ArrowRight,
  ShieldCheck, Zap, MessageSquare,
  ChevronDown, ChevronLeft, X, BookOpen
} from 'lucide-react';
import { Button } from './components/ui/button';
import { initialSiteData } from './data';
import { AdminPanel } from './components/AdminPanel';
import { Login, StudentDashboard, Secretaria } from './portal';
import { Enrollment } from './components/Enrollment';
import { firebaseService } from './services/supabaseService';

const HeroCarousel = ({ banners }: { banners: any[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const displayBanners = banners?.length > 0 ? banners : [
    { imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070" }
  ];

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-700/20 to-blue-500/20 rounded-[3rem] blur-3xl" />
      
      <div className="glass-panel p-2 rounded-[3rem] border-white/10 relative z-10">
        <div className="overflow-hidden rounded-[2.5rem]" ref={emblaRef}>
          <div className="flex">
            {displayBanners.map((banner: any, index: number) => (
              <div key={banner.id || index} className="flex-[0_0_100%] min-w-0 relative">
                <img 
                  src={banner.imageUrl || undefined} 
                  alt={banner.title || "Estúdio de Dublagem"} 
                  className="w-full h-[600px] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows - REMOVIDAS */}
        {/*
        <button
          onClick={scrollPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-all z-20"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-all z-20"
          aria-label="Próximo slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        */}

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {displayBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                selectedIndex === index 
                  ? 'bg-white w-8' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Floating UI Elements */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-8 top-20 glass-panel p-4 rounded-2xl border-white/10 flex items-center gap-4 shadow-2xl z-20"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Equipamento</p>
            <p className="text-sm text-white font-bold">Padrão Indústria</p>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -right-8 bottom-20 glass-panel p-4 rounded-2xl border-white/10 flex items-center gap-4 shadow-2xl z-20"
        >
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Certificado</p>
            <p className="text-sm text-white font-bold">Reconhecido</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const TeacherCard = ({ teacher, index }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="perspective-1000 cursor-pointer h-[450px] max-w-[350px] mx-auto w-full"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front */}
        <div 
          className="absolute inset-0 backface-hidden rounded-[2rem] overflow-hidden"
        >
          <img 
            src={teacher.photo || undefined} 
            alt={teacher.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-8">
            <p className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-2 neon-text-blue">{teacher.role}</p>
            <h3 className="text-3xl font-black text-white font-display mb-4 neon-text-white">{teacher.name}</h3>
            <div className="flex flex-wrap gap-2">
              {teacher.specialties.map((spec: string, j: number) => (
                <span key={j} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-white border border-white/10">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 backface-hidden rounded-[2rem] overflow-hidden glass-panel p-8 flex flex-col justify-center items-center text-center"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="w-20 h-20 rounded-full bg-blue-600/20 flex items-center justify-center mb-6 neon-glow-blue">
            <MessageSquare className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-2xl font-black text-white font-display mb-4 neon-text-white">{teacher.name}</h3>
          <p className="text-gray-300 leading-relaxed italic">"{teacher.bio}"</p>
          <div className="mt-8 pt-8 border-t border-white/10 w-full">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest neon-text-blue">Clique para voltar</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const mergeSiteData = (previous: any, next: any) => ({
  ...previous,
  ...next,
  settings: next.settings ? { ...previous.settings, ...next.settings } : previous.settings
});

function App() {
  const [siteData, setSiteData] = useState(initialSiteData);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isStudentDashboardOpen, setIsStudentDashboardOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [isSecretariaOpen, setIsSecretariaOpen] = useState(false);
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(false);
  const [selectedModuleForEnrollment, setSelectedModuleForEnrollment] = useState<string | undefined>(undefined);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [expandedLearning, setExpandedLearning] = useState<number | null>(null);
  const [showAllTeachers, setShowAllTeachers] = useState(false);
  
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribeSiteData: (() => void) | undefined;

    const refreshSiteData = async () => {
      try {
        const refreshedData = await firebaseService.getSiteData();
        if (isMounted && refreshedData) {
          setSiteData(prev => mergeSiteData(prev, refreshedData));
        }
      } catch (error) {
        console.error('Failed to refresh site data from Firebase:', error);
      }
    };

    const loadData = async () => {
      try {
        const [data, user] = await Promise.all([
          firebaseService.getSiteData(),
          firebaseService.getCurrentUser()
        ]);

        if (!isMounted) return;

        if (data) {
          setSiteData(prev => mergeSiteData(prev, data));
        }

        unsubscribeSiteData = firebaseService.subscribeToSiteData(() => {
          void refreshSiteData();
        });

        if (user) {
          setCurrentUser(user);
          try {
            await loadStudentData(user.id);
          } catch (studentError) {
            console.error('Failed to load student data:', studentError);
          }
        }
      } catch (error) {
        console.error('Failed to load data from Supabase:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      unsubscribeSiteData?.();
    };
  }, []);

  const loadStudentData = async (userId: string) => {
    try {
      const [profile, enrollments, activity] = await Promise.all([
        firebaseService.getStudentProfile(userId),
        firebaseService.getStudentEnrollments(userId),
        firebaseService.getStudentActivity(userId)
      ]);

      setStudentData({
        uid: userId,
        profile,
        enrollments,
        activity
      });
    } catch (error) {
      console.error('Failed to load student data:', error);
    }
  };

  const handleSaveAdmin = (newData: any) => {
    setSiteData(newData);
  };

  const handleLoginSuccess = async (user: any) => {
    setCurrentUser(user);
    setIsLoginOpen(false);
    setIsLoading(true);
    await loadStudentData(user.id ?? user.uid);
    setIsLoading(false);
    setIsStudentDashboardOpen(true);
  };

  const handleLogout = async () => {
    await firebaseService.signOut();
    setCurrentUser(null);
    setStudentData(null);
    setIsStudentDashboardOpen(false);
  };

  const handleEnroll = (moduleTitle?: string) => {
    setSelectedModuleForEnrollment(moduleTitle);
    setIsEnrollmentOpen(true);
  };

  const handleNewEnrollment = async (enrollment: any) => {
    try {
      const newEnrollment = await firebaseService.createEnrollment({
        name: enrollment.name,
        email: enrollment.email,
        phone: enrollment.phone,
        module: enrollment.module,
        status: 'Pendente'
      });
      
      setSiteData(prev => ({
        ...prev,
        enrollments: [newEnrollment, ...(prev.enrollments || [])]
      }));
    } catch (error) {
      console.error('Failed to create enrollment in Firebase:', error);
      // Fallback to local state if Firebase fails
      const fallbackEnrollment = {
        ...enrollment,
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        status: 'Pendente'
      };
      setSiteData(prev => ({
        ...prev,
        enrollments: [fallbackEnrollment, ...(prev.enrollments || [])]
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-blue-400 font-bold animate-pulse uppercase tracking-widest text-xs">Carregando THE HUB...</p>
        </div>
      </div>
    );
  }

  if (isAdminOpen) {
    return <AdminPanel data={siteData} onSave={handleSaveAdmin} onClose={() => setIsAdminOpen(false)} />;
  }

  if (isSecretariaOpen) {
    return (
      <Secretaria
        onStudentLogin={() => { setIsSecretariaOpen(false); setIsLoginOpen(true); }}
        onAdminLogin={() => { setIsSecretariaOpen(false); setIsAdminOpen(true); }}
        onBack={() => setIsSecretariaOpen(false)}
      />
    );
  }

  if (isLoginOpen) {
    return <Login onLogin={handleLoginSuccess} onBack={() => setIsLoginOpen(false)} />;
  }

  if (isStudentDashboardOpen) {
    return (
      <StudentDashboard 
        onLogout={handleLogout} 
        onHome={() => setIsStudentDashboardOpen(false)} 
        data={siteData} 
        studentData={studentData}
        onRefreshProfile={() => currentUser && loadStudentData(currentUser.id ?? currentUser.uid)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-foreground font-sans selection:bg-blue-600/30">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-[0.03]" />
      
      {/* Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 group cursor-pointer shrink-0">
            <div>
              <span className="font-black text-lg md:text-xl tracking-tighter font-display text-white block leading-none neon-text-white">THE HUB</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#metodologia" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Metodologia</a>
            <a href="#professores" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Professores</a>
            <a href="#faq" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="text-xs md:text-sm font-bold text-white hover:text-cyan-400 transition-colors hover:neon-text-blue"
            >
              Portal do Aluno
            </button>
            <Button onClick={() => handleEnroll()} className="bg-white text-black hover:bg-gray-200 rounded-full px-4 md:px-6 py-2 h-auto text-xs md:text-sm font-bold whimsy-hover shadow-[0_0_20px_rgba(255,255,255,0.1)] neon-glow-white">
              Matricule-se
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="text-[10px] md:text-xs font-bold tracking-wider text-blue-400 uppercase neon-text-blue">Vagas Abertas - Turma 2026</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-white leading-[1.1] mb-6 font-display tracking-tight">
                  A sua voz é o seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300 neon-text-blue">maior instrumento.</span>
                </h1>
                <p className="text-base md:text-xl text-gray-400 mb-8 leading-relaxed font-light">
                  A primeira escola de dublagem do Brasil com metodologia imersiva, plataforma usada por estúdios profissionais e professores que são referências no mercado.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button onClick={() => handleEnroll()} className="bg-blue-600 hover:bg-blue-500 text-white text-base md:text-lg px-8 py-6 rounded-full font-bold shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all whimsy-hover group neon-glow-blue">
                    Comece sua jornada <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map((i) => (
                      <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} alt="Aluno" className="w-12 h-12 rounded-full border-2 border-black" />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-yellow-400 mb-1">
                      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-sm text-gray-400 font-medium">+500 alunos formados</p>
                  </div>
                </div>
              </motion.div>

              {/* Hero Carousel */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <HeroCarousel banners={siteData.banners} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Logos Marquee */}
        <section className="py-10 border-y border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="container mx-auto px-6 mb-6">
            <p className="text-center text-sm font-bold text-gray-500 uppercase tracking-widest">Nossos alunos estão nos maiores estúdios</p>
          </div>
          <div className="flex gap-6 md:gap-12 items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap px-6">
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tighter">NETFLIX</h3>
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tighter">PRIME VIDEO</h3>
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tighter">DISNEY+</h3>
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tighter">HBO MAX</h3>
            <h3 className="text-xl md:text-2xl font-black font-display tracking-tighter">CRUNCHYROLL</h3>
          </div>
        </section>

        {/* Modules Section */}
        <section id="metodologia" className="py-20 md:py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-display tracking-tight px-4 md:px-0">Uma jornada completa do zero ao <span className="text-blue-500 neon-text-blue">profissional</span></h2>
              <p className="text-lg md:text-xl text-gray-400 font-light px-4 md:px-0">Nossa metodologia foi desenhada para construir sua base técnica e elevá-la ao nível de exigência dos grandes estúdios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <AnimatePresence mode="wait">
                {expandedModule === null ? (
                  siteData.modules.map((mod, i) => (
                    <motion.div 
                      key={i}
                      layoutId={`module-${i}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -10 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      onClick={() => setExpandedModule(i)}
                      className="glass-panel p-6 md:p-8 rounded-[2rem] border-white/5 hover:border-blue-600/30 transition-all duration-500 group relative overflow-hidden cursor-pointer max-w-md mx-auto w-full flex flex-col"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors"></div>
                      
                      <div className="text-6xl font-black text-white/5 font-display absolute top-4 right-6 group-hover:text-white/10 transition-colors">
                        {mod.num || String(i + 1).padStart(2, '0')}
                      </div>
                      
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600/20 group-hover:border-blue-600/30 transition-all duration-300">
                        {(mod.icon === 'Headphones') ? <Headphones className="w-8 h-8 text-blue-400" /> :
                         (mod.icon === 'Star') ? <Star className="w-8 h-8 text-blue-400" /> :
                         (mod.icon === 'BookOpen') ? <BookOpen className="w-8 h-8 text-blue-400" /> :
                         (mod.icon === 'Award') ? <Award className="w-8 h-8 text-blue-400" /> :
                         <Mic className="w-8 h-8 text-blue-400" />}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-4 font-display neon-text-white">{mod.title}</h3>
                      <p className="text-gray-400 mb-8 leading-relaxed line-clamp-3">{(mod.desc?.length ?? 0) > 120 ? (initialSiteData.modules[i]?.desc ?? mod.desc) : mod.desc}</p>
                      
                      <div className="pt-6 border-t border-white/10 flex items-center justify-between mt-auto">
                        <span className="text-sm font-bold text-white neon-text-white">{mod.duration || initialSiteData.modules[i]?.duration}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEnroll(mod.title); }}
                          className="text-xs font-bold text-blue-400 uppercase tracking-wider group-hover:translate-x-2 transition-transform flex items-center gap-1 neon-text-blue"
                        >
                          Matricule-se <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    layoutId={`module-${expandedModule}`}
                    className="col-span-1 md:col-span-3 glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border-blue-600/30 bg-white/[0.03] relative overflow-hidden"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); setExpandedModule(null); }}
                      className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20"
                    >
                      <Zap className="w-5 h-5 md:w-6 h-6 rotate-45" />
                    </button>

                      <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-center">
                      <div>
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 text-center sm:text-left">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center shrink-0">
                            {(siteData.modules[expandedModule]?.icon === 'Headphones') ? <Headphones className="w-8 h-8 md:w-10 md:h-10 text-blue-400" /> :
                             (siteData.modules[expandedModule]?.icon === 'Star') ? <Star className="w-8 h-8 md:w-10 md:h-10 text-blue-400" /> :
                             (siteData.modules[expandedModule]?.icon === 'BookOpen') ? <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-blue-400" /> :
                             (siteData.modules[expandedModule]?.icon === 'Award') ? <Award className="w-8 h-8 md:w-10 md:h-10 text-blue-400" /> :
                             <Mic className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />}
                          </div>
                          <div>
                            <span className="text-blue-400 font-black text-4xl md:text-6xl opacity-20 font-display leading-none neon-text-blue">{siteData.modules[expandedModule].num || String(expandedModule + 1).padStart(2, '0')}</span>
                            <h3 className="text-2xl md:text-4xl font-black text-white font-display uppercase tracking-tight neon-text-white">{siteData.modules[expandedModule].title}</h3>
                          </div>
                        </div>

                        <p className="text-lg md:text-2xl text-gray-300 font-light leading-relaxed mb-8 md:mb-12 text-center sm:text-left px-4 md:px-0">
                          {siteData.modules[expandedModule].desc}
                        </p>

                      </div>

                      <div className="relative max-w-md mx-auto lg:mx-0 w-full mt-8 lg:mt-0">
                        <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full" />
                        <div className="relative glass-panel p-6 md:p-8 rounded-[2rem] border-white/10">
                          <h4 className="text-white font-black text-xl mb-6 md:mb-8 font-display text-center">Próxima Turma</h4>
                          <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                              <span className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">Duração</span>
                              <span className="text-white font-black text-sm md:text-base">{initialSiteData.modules[expandedModule]?.duration || siteData.modules[expandedModule].duration}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10">
                              <span className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest">Aulas</span>
                              <span className="text-white font-black text-sm md:text-base">1x por semana</span>
                            </div>
                          </div>
                          <Button onClick={() => handleEnroll(siteData.modules[expandedModule].title)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 md:py-8 rounded-2xl font-black text-base md:text-lg shadow-[0_0_30px_rgba(37,99,235,0.3)] whimsy-hover neon-glow-blue">
                            Quero me matricular
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Teachers Section */}
        <section id="professores" className="py-20 md:py-32 bg-black/40 border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-display tracking-tight px-4 md:px-0">Aprenda com quem <span className="text-blue-600 neon-text-blue">faz acontecer.</span></h2>
                    <p className="text-lg md:text-xl text-gray-400 font-light px-4 md:px-0">Nossos professores são profissionais ativos no mercado, dirigindo e dublando as maiores produções da atualidade.</p>
                  {siteData.teachers.length > 3 && (
                    <div className="mt-8">
                      <Button
                        variant="outline"
                        onClick={() => setShowAllTeachers(p => !p)}
                        className="border-white/10 text-white hover:bg-white/5 rounded-full px-8 py-4 h-auto whimsy-hover neon-glow-white"
                      >
                        {showAllTeachers ? 'Ver menos' : 'Conhecer toda a equipe'}
                      </Button>
                    </div>
                  )}
                </div>

            {(() => {
              const priority = (name: string) => {
                const n = name.toLowerCase();
                if (n.includes('vitor') && n.includes('paranhos')) return 0;
                if (n.includes('daniel') && (n.includes('vila') || n.includes('avila'))) return 1;
                if (n.includes('ettore') && n.includes('zuim')) return 2;
                return 3;
              };
              const sorted = [...siteData.teachers].sort((a, b) => priority(a.name) - priority(b.name));
              const displayed = showAllTeachers ? sorted : sorted.slice(0, 3);
              return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayed.map((teacher, i) => (
                <div key={i} className="flex justify-center">
                  <TeacherCard teacher={teacher} index={i} />
                </div>
              ))}
            </div>
              );
            })()}
          </div>
        </section>

        {/* Learnings Section */}
        <section className="py-20 md:py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-display tracking-tight px-4 md:px-0">O conteúdo programático, <span className="text-blue-500 neon-text-blue">semana a semana</span></h2>
              <p className="text-lg md:text-xl text-gray-400 font-light px-4 md:px-0">Clique em um módulo para ver as 24 aulas que compõem cada etapa da sua formação.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <AnimatePresence mode="wait">
                {expandedLearning === null ? (
                  siteData.modules.map((mod: any, i: number) => (
                    <motion.div
                      key={`lcard-${i}`}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      onClick={() => setExpandedLearning(i)}
                      className="glass-panel p-6 md:p-8 rounded-[2rem] border-white/5 hover:border-blue-600/30 transition-all duration-500 group relative overflow-hidden cursor-pointer flex flex-col"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors" />
                      <div className="text-6xl font-black text-white/5 font-display absolute top-4 right-6 group-hover:text-white/10 transition-colors">
                        {mod.num || String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600/20 group-hover:border-blue-600/30 transition-all duration-300">
                        {i === 0 ? <Mic className="w-7 h-7 text-blue-400" /> : i === 1 ? <Headphones className="w-7 h-7 text-blue-400" /> : <Star className="w-7 h-7 text-blue-400" />}
                      </div>
                      <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">{initialSiteData.modules[i]?.duration || mod.duration} · 24 aulas</p>
                      <h3 className="text-2xl font-bold text-white mb-3 font-display leading-tight">{mod.title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">{(mod.desc?.length ?? 0) > 120 ? (initialSiteData.modules[i]?.desc ?? mod.desc) : mod.desc}</p>
                      <div className="flex items-center gap-2 text-blue-400 text-sm font-bold group-hover:gap-3 transition-all mt-auto">
                        <BookOpen className="w-4 h-4" />
                        Ver conteúdo programático
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    key="learning-expanded"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="col-span-1 md:col-span-3 glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border-blue-600/30 bg-white/[0.03] relative overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedLearning(null)}
                      className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors z-20"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    {(() => {
                      const fireMod = siteData.modules[expandedLearning] || {};
                      const seedMod = initialSiteData.modules[expandedLearning] || ({} as any);
                      const title = fireMod.title || seedMod.title || '';
                      const duration = fireMod.duration || seedMod.duration || '6 meses';
                      const modSlug = fireMod.slug || seedMod.slug || '';
                      const moduleLearnings = (siteData.learnings || []).filter(
                        (l: any) => l.module_slug && l.module_slug === modSlug
                      );
                      return (
                        <>
                    <div className="mb-8 md:mb-10">
                      <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">
                        {duration} · {moduleLearnings.length} aprendizado{moduleLearnings.length !== 1 ? 's' : ''}
                      </p>
                      <h3 className="text-2xl md:text-4xl font-black text-white font-display">
                        {title}
                      </h3>
                    </div>

                    {moduleLearnings.length === 0 ? (
                      <p className="text-gray-600 text-sm">Nenhum aprendizado cadastrado para este módulo.</p>
                    ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {moduleLearnings.map((learning: any, j: number) => (
                        <motion.div
                          key={learning.id ?? j}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: j * 0.025 }}
                          className="flex flex-col gap-1 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-blue-600/20 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-black text-blue-500 shrink-0 mt-0.5 w-5 text-right tabular-nums">
                              {String(j + 1).padStart(2, '0')}
                            </span>
                            <span className="text-sm text-gray-200 leading-snug font-medium">{learning.title}</span>
                          </div>
                          {learning.description && (
                            <p className="text-xs text-gray-500 leading-snug pl-8">{learning.description}</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    )}

                    <div className="flex flex-wrap gap-3 mt-8 pt-8 border-t border-white/10">
                      {siteData.modules.map((mod: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setExpandedLearning(i)}
                          className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all ${
                            expandedLearning === i
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                              : 'text-gray-500 hover:text-white border border-white/5 hover:border-white/15'
                          }`}
                        >
                          {mod.num || String(i + 1).padStart(2, '0')}
                        </button>
                      ))}
                    </div>
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-32 bg-black/40 border-t border-white/5">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6 font-display tracking-tight px-4 md:px-0">Dúvidas Frequentes</h2>
              <p className="text-lg md:text-xl text-gray-400 font-light px-4 md:px-0">Tudo o que você precisa saber antes de dar o primeiro passo.</p>
            </div>

            <div className="space-y-4 px-4 md:px-0">
              {((siteData.faqs?.length ?? 0) >= 8 ? siteData.faqs : initialSiteData.faqs).map((faq: any, index: number) => (
                <div 
                  key={faq.id} 
                  className={`glass-panel rounded-2xl border-white/5 overflow-hidden transition-all duration-300 ${activeFaq === index ? 'bg-white/5 border-blue-600/30' : 'hover:bg-white/[0.02]'}`}
                >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full px-6 md:px-8 py-5 md:py-6 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className={`text-base md:text-lg font-bold text-white pr-8 ${activeFaq === index ? 'neon-text-blue text-blue-400' : ''}`}>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 md:w-5 h-5 text-blue-500 shrink-0 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 md:px-8 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4 text-sm md:text-base">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-transparent pointer-events-none"></div>
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 font-display tracking-tight max-w-4xl mx-auto leading-[1.1] px-4 md:px-0">
              Sua voz tem poder. <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300 neon-text-blue">Aprenda a usá-lo.</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light px-6 md:px-0">
              As vagas para a próxima turma são limitadas para garantir a qualidade e atenção individual em estúdio.
            </p>
            <div className="flex justify-center">
            <Button onClick={() => handleEnroll()} className="bg-blue-600 hover:bg-blue-500 text-white text-lg md:text-xl px-10 md:px-12 py-6 md:py-8 rounded-full font-bold shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all whimsy-hover flex items-center justify-center neon-glow-blue">
              Garantir Minha Vaga Agora
            </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
<span className="font-black text-2xl tracking-tighter font-display text-white">{siteData.settings?.siteName || 'THE HUB'}</span>
              </div>
              <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
                A principal escola de formação de dubladores do país, conectando talentos aos maiores estúdios do mercado.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Links Rápidos</h4>
              <ul className="space-y-3">
                <li><a href="#metodologia" className="text-gray-400 hover:text-blue-400 transition-colors hover:neon-text-blue">Metodologia</a></li>
                <li><a href="#professores" className="text-gray-400 hover:text-blue-400 transition-colors hover:neon-text-blue">Professores</a></li>
                <li><a href="#faq" className="text-gray-400 hover:text-blue-400 transition-colors hover:neon-text-blue">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contato</h4>
              <ul className="space-y-3">
                <li className="text-gray-400">{siteData.settings?.contactEmail || 'contato@thehub.com.br'}</li>
                <li className="text-gray-400">WhatsApp: (11) 99999-9999</li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 text-sm text-gray-500">
            <p className="text-center md:text-left">© 2026 {siteData.settings?.siteName || 'THE HUB'}. Todos os direitos reservados.</p>
            <div className="flex flex-wrap gap-6 justify-center mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <button onClick={() => setIsSecretariaOpen(true)} className="hover:text-white transition-colors">Secretaria</button>
              <button onClick={() => setIsAdminOpen(true)} className="hover:text-blue-400 transition-colors">Área Restrita</button>
            </div>
          </div>
        </div>
      </footer>

      <Enrollment 
        isOpen={isEnrollmentOpen} 
        onClose={() => setIsEnrollmentOpen(false)} 
        modules={siteData.modules}
        initialModule={selectedModuleForEnrollment}
        onEnroll={handleNewEnrollment}
      />
    </div>
  );
}

export default App;
