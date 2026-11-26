'use client';

import React, { useState, useMemo } from 'react';
import { ScopeAnalytics, DashboardData, UnidadeScope, CicloEscolar } from '@/types/dashboard';
import { Search, Filter, ArrowUpDown, Star, TrendingDown, Layers, HelpCircle } from 'lucide-react';

interface ExploradorQuesitosViewProps {
  analytics: ScopeAnalytics;
  metadata: DashboardData['metadata'];
  unidade: UnidadeScope;
}

export default function ExploradorQuesitosView({ analytics, metadata, unidade }: ExploradorQuesitosViewProps) {
  const [selectedAmbito, setSelectedAmbito] = useState<string>('Todos');
  const [selectedPerfil, setSelectedPerfil] = useState<string>('Todos');
  const [selectedCiclo, setSelectedCiclo] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'media_desc' | 'media_asc' | 'nome'>('media_desc');
  const [viewFilter, setViewFilter] = useState<'todos' | 'top5' | 'bottom5'>('todos');

  // Extract all questions for the current scope / ciclo
  const quesitosList = useMemo(() => {
    let sourceList = analytics.rankings_gerais.todos;
    if (selectedCiclo !== 'Todos' && analytics.ciclos[selectedCiclo as CicloEscolar]) {
      sourceList = analytics.ciclos[selectedCiclo as CicloEscolar].rankings.todos;
    }

    return sourceList.filter((q) => {
      if (selectedAmbito !== 'Todos' && q.ambito !== selectedAmbito) return false;
      if (selectedPerfil !== 'Todos' && q.perfil !== selectedPerfil) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuesito = q.quesito.toLowerCase().includes(query);
        const matchesAmbito = q.ambito.toLowerCase().includes(query);
        const matchesPerfil = q.perfil.toLowerCase().includes(query);
        if (!matchesQuesito && !matchesAmbito && !matchesPerfil) return false;
      }
      return true;
    });
  }, [analytics, selectedCiclo, selectedAmbito, selectedPerfil, searchQuery]);

  // Sort list
  const sortedQuesitos = useMemo(() => {
    let list = [...quesitosList];
    if (sortBy === 'media_desc') {
      list.sort((a, b) => b.media - a.media);
    } else if (sortBy === 'media_asc') {
      list.sort((a, b) => a.media - b.media);
    } else if (sortBy === 'nome') {
      list.sort((a, b) => a.quesito.localeCompare(b.quesito));
    }

    if (viewFilter === 'top5') {
      const uniqueTop: typeof list = [];
      const seen = new Set<string>();
      for (const item of [...list].sort((a, b) => b.media - a.media)) {
        if (!seen.has(item.quesito)) {
          seen.add(item.quesito);
          uniqueTop.push(item);
          if (uniqueTop.length === 5) break;
        }
      }
      return uniqueTop;
    } else if (viewFilter === 'bottom5') {
      const uniqueBottom: typeof list = [];
      const seen = new Set<string>();
      for (const item of [...list].sort((a, b) => a.media - b.media)) {
        if (!seen.has(item.quesito)) {
          seen.add(item.quesito);
          uniqueBottom.push(item);
          if (uniqueBottom.length === 5) break;
        }
      }
      return uniqueBottom;
    }

    return list;
  }, [quesitosList, sortBy, viewFilter]);

  const perfis = ['Todos', 'Coordenadores', 'Autoavaliação', 'Psicologos e Pares', 'Alunos'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-everest-navy to-everest-blue rounded-2xl p-6 text-white shadow-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-blue-200 mb-2">
          <Search className="w-3.5 h-3.5" />
          Drill-Down Analítico • Base Completa de 60 Quesitos (Inclui Avaliação dos Alunos)
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Explorador Detalhado de Indicadores &amp; Quesitos
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-200 max-w-3xl">
          Filtre por Âmbito, Perfil Avaliador e Segmento Escolar para identificar os pontos focais de capacitação docente e os destaques da rubrica.
        </p>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        
        {/* Search and Quick Preset Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar quesito por palavra-chave (ex: rubricas, CAR, portfólio, bullying)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-everest-blue"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewFilter === 'todos'
                  ? 'bg-everest-navy text-white shadow'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({quesitosList.length})
            </button>
            <button
              onClick={() => setViewFilter('top5')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewFilter === 'top5'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <Star className="w-3.5 h-3.5" /> Top 5
            </button>
            <button
              onClick={() => setViewFilter('bottom5')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewFilter === 'bottom5'
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" /> Bottom 5
            </button>
          </div>
        </div>

        {/* Dropdowns Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          
          {/* Âmbito */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Âmbito
            </label>
            <select
              value={selectedAmbito}
              onChange={(e) => setSelectedAmbito(e.target.value)}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-everest-blue font-medium"
            >
              <option value="Todos">Todos os Âmbitos (5)</option>
              {metadata.ambitos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Perfil Avaliador */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Perfil Avaliador
            </label>
            <select
              value={selectedPerfil}
              onChange={(e) => setSelectedPerfil(e.target.value)}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-everest-blue font-medium"
            >
              {perfis.map((p) => (
                <option key={p} value={p}>{p === 'Todos' ? 'Todos os Perfis' : p}</option>
              ))}
            </select>
          </div>

          {/* Ciclo Escolar */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Ciclo Escolar
            </label>
            <select
              value={selectedCiclo}
              onChange={(e) => setSelectedCiclo(e.target.value)}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-everest-blue font-medium"
            >
              <option value="Todos">Todos os Ciclos (Consolidado)</option>
              <option value="EI">Educação Infantil (EI)</option>
              <option value="EFI">Ensino Fundamental I (EFI)</option>
              <option value="EFII">Ensino Fundamental II (EFII)</option>
              <option value="EM">Ensino Médio (EM)</option>
            </select>
          </div>

          {/* Ordenação */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-everest-blue font-medium"
            >
              <option value="media_desc">Maior Média (Melhor Desempenho)</option>
              <option value="media_asc">Menor Média (Maior Oportunidade)</option>
              <option value="nome">Nome do Quesito (A-Z)</option>
            </select>
          </div>

        </div>

      </div>

      {/* 3. Quesitos Cards List */}
      <div className="space-y-3">
        {sortedQuesitos.length > 0 ? (
          sortedQuesitos.map((q, idx) => {
            const pct = ((q.media / 4.0) * 100).toFixed(0);
            const isHigh = q.media >= 3.60;
            const isGood = q.media >= 3.00 && q.media < 3.60;
            const isMid = q.media >= 2.50 && q.media < 3.00;
            const isLow = q.media < 2.50;

            const badgeColor = isHigh ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : isGood ? 'bg-blue-50 text-blue-800 border-blue-200'
              : isMid ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-rose-50 text-rose-800 border-rose-200';

            const barColor = isHigh ? 'bg-emerald-500'
              : isGood ? 'bg-blue-500'
              : isMid ? 'bg-amber-500'
              : 'bg-rose-500';

            const levelLabel = isHigh ? 'Referência [REF]'
              : isGood ? 'Atuação Adequada [AA]'
              : isMid ? 'Em Desenvolvimento [ED]'
              : 'Inicial [I]';

            return (
              <div
                key={`${q.perfil}-${q.quesito}`}
                className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  
                  {/* Left Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        #{q.id}
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-100/80 text-blue-900">
                        {q.perfil}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {q.ambito}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                      {q.quesito}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span>Respostas computadas: <strong>{q.total_respostas}</strong></span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                        {levelLabel}
                      </span>
                    </div>
                  </div>

                  {/* Right Score */}
                  <div className="sm:text-right shrink-0 min-w-[130px] flex sm:flex-col justify-between items-center sm:items-end">
                    <div>
                      <div className="text-2xl font-extrabold text-slate-900 leading-none">
                        {q.media.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">escala de 4.00</div>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="w-24 sm:w-28 bg-slate-100 rounded-full h-2 mt-2 overflow-hidden border border-slate-200/60">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700">Nenhum quesito encontrado</h4>
            <p className="text-xs text-slate-400 mt-1">
              Tente ajustar os filtros de âmbito, perfil avaliador ou o termo de busca.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
