'use client';

import React from 'react';
import { UnidadeScope } from '@/types/dashboard';
import { User } from '@/types/auth';
import { Building2, Printer, Users, TrendingUp, LogOut, Lock, Shield } from 'lucide-react';

interface HeaderProps {
  unidade: UnidadeScope;
  setUnidade: (u: UnidadeScope) => void;
  totalAvaliados: number;
  mediaGeral: number;
  currentUser: User | null;
  onLogout: () => void;
}

export default function Header({
  unidade,
  setUnidade,
  totalAvaliados,
  mediaGeral,
  currentUser,
  onLogout,
}: HeaderProps) {
  const isSingleUnit = currentUser && currentUser.allowedUnits.length === 1;

  return (
    <header className="bg-everest-navy text-white shadow-xl border-b border-everest-dark/60 sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="relative shrink-0">
              <img
                src="/logo-everest.jpeg"
                alt="Colégio Everest Logo"
                className="w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-full object-cover border-2 border-white/30 shadow-md bg-white p-0.5 transition-transform hover:scale-105"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest font-semibold uppercase text-blue-200 bg-white/10 px-2 py-0.5 rounded">
                  Rede de Colégios Semper Altius
                </span>
                <span className="text-[10px] tracking-widest font-bold uppercase text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded border border-amber-300/30">
                  Ciclo 2026
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                Avaliação Institucional 360º
              </h1>
              <p className="text-xs text-slate-300">
                Colégios Everest • Unidades Curitiba &amp; Rio de Janeiro
              </p>
            </div>
          </div>

          {/* Quick Metrics, Unit Filter & User Session */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* KPI Badges */}
            <div className="hidden xl:flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-300" />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-slate-300">Avaliados</div>
                  <div className="text-sm font-bold text-white leading-none">{totalAvaliados}</div>
                </div>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-slate-300">Média Geral</div>
                  <div className="text-sm font-bold text-emerald-400 leading-none">{mediaGeral.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">/ 4.0</span></div>
                </div>
              </div>
            </div>

            {/* Global Unit Filter or Locked Single Unit */}
            {isSingleUnit ? (
              <div className="flex items-center bg-white/10 rounded-lg px-3 py-1.5 border border-amber-400/30 gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-wider text-amber-200/90 font-semibold">
                    Unidade Exclusiva
                  </div>
                  <div className="text-xs font-bold text-white">
                    {unidade}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/15">
                <Building2 className="w-4 h-4 text-slate-300 ml-2 mr-1" />
                <button
                  onClick={() => setUnidade('Todas')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    unidade === 'Todas'
                      ? 'bg-everest-blue text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Todas (Rede)
                </button>
                <button
                  onClick={() => setUnidade('Curitiba')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    unidade === 'Curitiba'
                      ? 'bg-everest-blue text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Curitiba
                </button>
                <button
                  onClick={() => setUnidade('Rio de Janeiro')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    unidade === 'Rio de Janeiro'
                      ? 'bg-everest-blue text-white shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Rio de Janeiro
                </button>
              </div>
            )}

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              title="Imprimir relatório / Salvar em PDF"
              className="no-print p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors border border-white/10"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* User Session & Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/15">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-blue-200">
                    {currentUser.unitLabel}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sair do sistema (Logout)"
                  className="no-print flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white transition-colors border border-red-500/30 text-xs font-semibold shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
