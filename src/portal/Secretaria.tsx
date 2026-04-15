import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Shield, ArrowLeft, Mic, ChevronRight } from 'lucide-react';

interface SecretariaProps {
  onStudentLogin: () => void;
  onAdminLogin: () => void;
  onBack: () => void;
}

export function Secretaria({ onStudentLogin, onAdminLogin, onBack }: SecretariaProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-[0.02]" />

      {/* Back button */}
      <div className="relative z-10 p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar ao site
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-16 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,211,238,0.3)]">
            <Mic className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black font-display tracking-tighter mb-3">
            THE <span className="text-cyan-400">HUB</span>
          </h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-16 bg-white/10" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Secretaria Digital</span>
            <div className="h-px w-16 bg-white/10" />
          </div>
          <p className="text-gray-400 text-lg max-w-md">
            Acesse o portal do aluno ou o painel administrativo da escola.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Student card */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={onStudentLogin}
            className="group relative p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.03] hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-colors" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white font-display mb-2 group-hover:text-cyan-400 transition-colors">
                Portal do Aluno
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Acompanhe seu progresso, acesse suas aulas, veja mensagens da escola e gerencie seu financeiro.
              </p>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                Entrar como aluno <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>

          {/* Admin card */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={onAdminLogin}
            className="group relative p-8 md:p-10 rounded-3xl border border-white/10 bg-white/[0.03] hover:bg-blue-500/10 hover:border-blue-500/40 transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white font-display mb-2 group-hover:text-blue-400 transition-colors">
                Painel Administrativo
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Gerencie alunos, matrículas, conteúdo do site, mensagens e configurações da plataforma.
              </p>
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                Entrar como admin <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>
        </div>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-xs text-gray-600 text-center"
        >
          Primeiro acesso? Suas credenciais são fornecidas pela escola.
        </motion.p>
      </div>
    </div>
  );
}
