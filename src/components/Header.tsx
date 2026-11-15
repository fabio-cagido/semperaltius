'use client';

import React from 'react';
import { UnidadeScope } from '@/types/dashboard';
import { Building2, School, Printer, Award, Users, TrendingUp } from 'lucide-react';

interface HeaderProps {
  unidade: UnidadeScope;
  setUnidade: (u: UnidadeScope) => void;
  totalAvaliados: number;
  mediaGeral: number;
}

export default function Header({ unidade, setUnidade, totalAvaliados, mediaGeral }: HeaderProps) {
  return (
    <header className="bg-everest-navy text-white shadow-xl border-b border-everest-dark/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-everest-blue to-everest-dark flex items-center justify-center shadow-lg border border-white/10">
              <School className="w-7 h-7 text-white" />
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

          {/* Quick Metrics & Global Filter */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* KPI Badges */}
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 gap-4">
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

            {/* Global Unit Filter */}
            <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/15">
              <Building2 className="w-4 h-4 text-slate-300 ml-2 mr-1" />
              <button
                onClick={() => setUnidade('Todas')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  unidade === 'Todas'
                    ? 'bg-everest-blue text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Todas (Rede)
              </button>
              <button
                onClick={() => setUnidade('Curitiba')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  unidade === 'Curitiba'
                    ? 'bg-everest-blue text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Curitiba
              </button>
              <button
                onClick={() => setUnidade('Rio de Janeiro')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  unidade === 'Rio de Janeiro'
                    ? 'bg-everest-blue text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Rio de Janeiro
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={() => window.print()}
              title="Imprimir relatório / Salvar em PDF"
              className="no-print p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors border border-white/10"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
