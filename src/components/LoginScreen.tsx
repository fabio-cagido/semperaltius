'use client';

import React, { useState } from 'react';
import { User } from '@/types/auth';
import { authenticateUser, SYSTEM_USERS } from '@/lib/auth';
import { Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, Building2, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const user = authenticateUser(username, password);
      if (user) {
        onLoginSuccess(user);
      } else {
        setError('Usuário ou senha incorretos. Verifique as credenciais ou use o acesso rápido.');
      }
      setIsLoading(false);
    }, 250);
  };

  const handleQuickLogin = (selectedUser: User) => {
    setError(null);
    let defaultPass = `${selectedUser.id}2026`;
    setUsername(selectedUser.username);
    setPassword(defaultPass);
    onLoginSuccess(selectedUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1B30] via-[#0F294A] to-[#1E3A8A] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden relative z-10">
        
        {/* Header Ribbon */}
        <div className="bg-[#0F294A] p-6 text-center text-white relative">
          <div className="flex justify-center mb-3">
            <div className="relative group">
              <img
                src="/logo-everest.jpeg"
                alt="Colégio Everest Logo"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-xl bg-white p-1 transition-transform group-hover:scale-105"
              />
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-[#0F294A] p-1 rounded-full border-2 border-white shadow">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
          <div className="inline-block bg-white/10 px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase text-blue-200 mb-1 border border-white/10">
            Rede de Colégios Semper Altius
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Avaliação Institucional 360º
          </h1>
          <p className="text-xs text-blue-200/80 mt-1">
            Ciclo 2026 • Curitiba &amp; Rio de Janeiro
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="text-center">
            <h2 className="text-base font-bold text-slate-800">Acesso Restrito ao Painel</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Entre com suas credenciais de acesso por unidade
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Usuário */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="semperaltius, curitiba ou rio"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Senha
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0F294A] to-[#1E56A0] hover:from-[#0B1B30] hover:to-[#164075] text-white font-semibold text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Entrar no Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-400">
              <span className="bg-white px-2 font-medium">Perfis de Acesso Rápido</span>
            </div>
          </div>

          {/* Quick Access Profiles */}
          <div className="space-y-2">
            <div className="text-[11px] text-slate-500 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Clique para entrar diretamente com o perfil desejado:</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              
              {/* Semper Altius */}
              <button
                type="button"
                onClick={() => handleQuickLogin(SYSTEM_USERS[0])}
                className="w-full text-left p-2.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0F294A] text-white flex items-center justify-center font-bold text-xs">
                    SA
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-900 flex items-center gap-1.5">
                      <span>Semper Altius (Direção Geral)</span>
                      <span className="text-[10px] bg-blue-200/80 text-blue-900 px-1.5 py-0.2 rounded font-medium">
                        Rede Completa
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Vê todas as unidades, Curitiba e Rio de Janeiro
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Curitiba */}
              <button
                type="button"
                onClick={() => handleQuickLogin(SYSTEM_USERS[1])}
                className="w-full text-left p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    CT
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 flex items-center gap-1.5">
                      <span>Everest Curitiba</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-medium">
                        Restrito Curitiba
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Visualiza exclusivamente a Unidade Curitiba
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              {/* Rio de Janeiro */}
              <button
                type="button"
                onClick={() => handleQuickLogin(SYSTEM_USERS[2])}
                className="w-full text-left p-2.5 rounded-lg border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                    RJ
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900 flex items-center gap-1.5">
                      <span>Everest Rio de Janeiro</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-medium">
                        Restrito Rio
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Visualiza exclusivamente a Unidade Rio de Janeiro
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Colégios Everest</span>
          </div>
          <span className="font-mono text-slate-400">v2026.1</span>
        </div>

      </div>

    </div>
  );
}
