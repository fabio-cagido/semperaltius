'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User } from '@/types/auth';
import { SYSTEM_USERS, authenticateProfile } from '@/lib/auth';
import { Lock, Eye, EyeOff, ShieldCheck, Building2, ArrowRight, AlertCircle, KeyRound, ChevronRight, X } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Auto focus password input when a profile is selected
  useEffect(() => {
    if (selectedUserId && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [selectedUserId]);

  const handleSelectProfile = (userId: string) => {
    if (selectedUserId === userId) {
      // Toggle or keep active
      return;
    }
    setSelectedUserId(userId);
    setPassword('');
    setError(null);
  };

  const handleCancelSelection = () => {
    setSelectedUserId(null);
    setPassword('');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateProfile(selectedUserId, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Senha incorreta para este perfil.');
      }
      setIsLoading(false);
    }, 200);
  };

  const selectedUser = SYSTEM_USERS.find((u) => u.id === selectedUserId);

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

        {/* Profiles Selection Body */}
        <div className="p-6 sm:p-8 space-y-4">
          
          <div className="text-center mb-2">
            <h2 className="text-base font-bold text-slate-800">
              {selectedUserId ? 'Digite a Senha de Acesso' : 'Selecione seu Perfil de Acesso'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedUserId
                ? `Informe a senha autorizada para ${selectedUser?.name}`
                : 'Escolha uma das unidades abaixo para acessar o painel'}
            </p>
          </div>

          {/* Profile Cards */}
          <div className="space-y-3">
            
            {/* Card 1: Semper Altius */}
            {(!selectedUserId || selectedUserId === 'semperaltius') && (
              <div
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  selectedUserId === 'semperaltius'
                    ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80 cursor-pointer shadow-sm'
                }`}
                onClick={() => !selectedUserId && handleSelectProfile('semperaltius')}
              >
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0F294A] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      SA
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Semper Altius (Direção Geral)
                        </span>
                        <span className="text-[10px] bg-blue-200/80 text-blue-900 font-semibold px-2 py-0.5 rounded">
                          Rede Completa
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Visualiza toda a Rede, Curitiba e Rio de Janeiro
                      </div>
                    </div>
                  </div>
                  {selectedUserId === 'semperaltius' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelSelection();
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60"
                      title="Trocar perfil"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* Password Input Expanded for Semper Altius */}
                {selectedUserId === 'semperaltius' && (
                  <form onSubmit={handleSubmit} className="px-3.5 pb-3.5 pt-1 border-t border-blue-200/60 mt-1">
                    {error && (
                      <div className="mb-2.5 flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-shake">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{error}</span>
                      </div>
                    )}
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-blue-700" />
                      <span>Senha de Acesso (Rede Semper Altius):</span>
                    </label>
                    <div className="relative mb-3">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        ref={passwordInputRef}
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite a senha..."
                        className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-[#0F294A] to-[#1E56A0] hover:from-[#0B1B30] hover:to-[#164075] text-white font-semibold text-xs rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-70"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Acessar Painel</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelSelection}
                        className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-600 font-medium text-xs rounded-lg border border-slate-200 transition-colors"
                      >
                        Voltar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Card 2: Curitiba */}
            {(!selectedUserId || selectedUserId === 'curitiba') && (
              <div
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  selectedUserId === 'curitiba'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50/80 cursor-pointer shadow-sm'
                }`}
                onClick={() => !selectedUserId && handleSelectProfile('curitiba')}
              >
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      CT
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Everest Curitiba
                        </span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-900 font-semibold px-2 py-0.5 rounded">
                          Restrito Curitiba
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Visualiza exclusivamente os resultados de Curitiba
                      </div>
                    </div>
                  </div>
                  {selectedUserId === 'curitiba' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelSelection();
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60"
                      title="Trocar perfil"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* Password Input Expanded for Curitiba */}
                {selectedUserId === 'curitiba' && (
                  <form onSubmit={handleSubmit} className="px-3.5 pb-3.5 pt-1 border-t border-emerald-200/60 mt-1">
                    {error && (
                      <div className="mb-2.5 flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-shake">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{error}</span>
                      </div>
                    )}
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Senha de Acesso (Unidade Curitiba):</span>
                    </label>
                    <div className="relative mb-3">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        ref={passwordInputRef}
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite a senha..."
                        className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-semibold text-xs rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-70"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Acessar Painel</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelSelection}
                        className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-600 font-medium text-xs rounded-lg border border-slate-200 transition-colors"
                      >
                        Voltar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Card 3: Rio de Janeiro */}
            {(!selectedUserId || selectedUserId === 'rio') && (
              <div
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  selectedUserId === 'rio'
                    ? 'border-amber-600 bg-amber-50/70 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-slate-50/80 cursor-pointer shadow-sm'
                }`}
                onClick={() => !selectedUserId && handleSelectProfile('rio')}
              >
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      RJ
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Everest Rio de Janeiro
                        </span>
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded">
                          Restrito Rio
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Visualiza exclusivamente os resultados do Rio de Janeiro
                      </div>
                    </div>
                  </div>
                  {selectedUserId === 'rio' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelSelection();
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60"
                      title="Trocar perfil"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                {/* Password Input Expanded for Rio */}
                {selectedUserId === 'rio' && (
                  <form onSubmit={handleSubmit} className="px-3.5 pb-3.5 pt-1 border-t border-amber-200/60 mt-1">
                    {error && (
                      <div className="mb-2.5 flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-shake">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{error}</span>
                      </div>
                    )}
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                      <span>Senha de Acesso (Unidade Rio de Janeiro):</span>
                    </label>
                    <div className="relative mb-3">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        ref={passwordInputRef}
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite a senha..."
                        className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs rounded-lg shadow hover:shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-70"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Acessar Painel</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelSelection}
                        className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-600 font-medium text-xs rounded-lg border border-slate-200 transition-colors"
                      >
                        Voltar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Colégios Everest</span>
          </div>
          <span className="font-mono text-slate-400">Ciclo 2026</span>
        </div>

      </div>

    </div>
  );
}
