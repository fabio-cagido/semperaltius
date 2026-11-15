'use client';

import React, { useState, useMemo } from 'react';
import {
  UnidadeScope,
  DashboardData,
  InstrumentoGestao,
  EspecialistaRecord,
  RankedQuesito
} from '@/types/dashboard';
import {
  Briefcase,
  Brain,
  Globe2,
  BookOpen,
  Award,
  Users,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  X,
  Compass,
  BarChart3,
  Layers,
  Search,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface GestaoEspecialistasViewProps {
  data: DashboardData;
  unidade: UnidadeScope;
}

export default function GestaoEspecialistasView({ data, unidade }: GestaoEspecialistasViewProps) {
  const [selectedInstrumento, setSelectedInstrumento] = useState<InstrumentoGestao>('coordenadores_ciclo');
  const [selectedCiclo, setSelectedCiclo] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProfessional, setSelectedProfessional] = useState<EspecialistaRecord | null>(null);

  const instrumentosConfig: {
    id: InstrumentoGestao;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    badge: string;
    color: string;
  }[] = [
    {
      id: 'coordenadores_ciclo',
      title: 'Coordenadores de Ciclo',
      subtitle: 'EI, EFI, EFII e EM • 7 Avaliados',
      icon: Briefcase,
      badge: 'Liderança Pedagógica',
      color: 'blue'
    },
    {
      id: 'psicologos',
      title: 'Psicólogos',
      subtitle: '3 Âmbitos Próprios • 6 Avaliados',
      icon: Brain,
      badge: 'Apoio Psicopedagógico',
      color: 'emerald'
    },
    {
      id: 'gestao_ingles',
      title: 'Gestão de Inglês',
      subtitle: 'Supervisores & Coordenadores Gerais • 5 Avaliados',
      icon: Globe2,
      badge: 'Bilinguismo',
      color: 'purple'
    },
    {
      id: 'disciplinas_institucionais',
      title: 'Disciplinas Institucionais',
      subtitle: 'Coordenação Transversal • 1 Avaliado',
      icon: BookOpen,
      badge: 'Formação Institucional',
      color: 'amber'
    },
  ];

  // Raw records for current instrument
  const allRecords: EspecialistaRecord[] = useMemo(() => {
    if (!data.gestao_especialistas) return [];
    return data.gestao_especialistas[selectedInstrumento] || [];
  }, [data, selectedInstrumento]);

  // Filter by global Unit, selected Cycle and Search
  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      // Unit filter
      if (unidade !== 'Todas' && rec.unidade !== unidade) {
        return false;
      }
      // Cycle filter
      if (selectedCiclo !== 'TODOS') {
        const hasCiclo = rec.segmentos_list ? rec.segmentos_list.includes(selectedCiclo) : rec.segmento.includes(selectedCiclo);
        if (!hasCiclo) return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = rec.nome.toLowerCase().includes(q);
        const matchCargo = rec.cargo.toLowerCase().includes(q);
        const matchEmail = rec.email.toLowerCase().includes(q);
        if (!matchName && !matchCargo && !matchEmail) return false;
      }
      return true;
    });
  }, [allRecords, unidade, selectedCiclo, searchQuery]);

  // Pre-calculated analytics from current scope (or compute dynamic fallback)
  const currentScopeAnalytics = data.scopes[unidade]?.gestao_especialistas?.[selectedInstrumento];

  // Dynamic calculations based on filtered records
  const dynamicStats = useMemo(() => {
    if (!filteredRecords.length) {
      return {
        total: 0,
        media_geral: 0.0,
        ambitos: {} as Record<string, number>,
        perfis: {} as Record<string, number>,
        top5: [] as RankedQuesito[],
        bottom5: [] as RankedQuesito[],
        nivelCounts: { 'Inicial': 0, 'Em Desenvolvimento': 0, 'Atuação Adequada': 0, 'Referência': 0 }
      };
    }

    const scores = filteredRecords.map(r => r.nota_final).filter((v): v is number => v !== null && v > 0);
    const media_geral = scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)) : 0.0;

    // Ambitos
    const topicKeys = new Set<string>();
    filteredRecords.forEach(r => Object.keys(r.topicos).forEach(k => topicKeys.add(k)));
    const ambitos: Record<string, number> = {};
    topicKeys.forEach(k => {
      const vals = filteredRecords.map(r => r.topicos[k]).filter((v): v is number => v !== null && v > 0);
      if (vals.length) {
        ambitos[k] = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
      }
    });

    // Perfis
    const safeAvg = (getter: (r: EspecialistaRecord) => number | null) => {
      const vals = filteredRecords.map(getter).filter((v): v is number => v !== null && v > 0);
      return vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0.0;
    };

    const perfis = {
      'Autoavaliação': safeAvg(r => r.autoavaliacao),
      'Diretor / Superior': safeAvg(r => r.do_lider),
      'Professores': safeAvg(r => r.dos_subordinados),
      'Psicólogas / Outros': safeAvg(r => r.outros),
      'Pares': safeAvg(r => r.dos_pares),
    };

    // Rankings of questions
    const qMap: Record<string, { vals: number[]; ambito: string; perfil: string; quesito: string }> = {};
    filteredRecords.forEach(r => {
      Object.entries(r.questoes).forEach(([k, v]) => {
        if (v !== null && v > 0) {
          if (!qMap[k]) {
            const [perfil, ...rest] = k.split('::');
            qMap[k] = {
              vals: [],
              perfil: perfil || 'Geral',
              quesito: rest.join('::') || k,
              ambito: 'Instrumento'
            };
          }
          qMap[k].vals.push(v);
        }
      });
    });

    const ranked: RankedQuesito[] = Object.entries(qMap).map(([key, item], idx) => {
      const avg = Number((item.vals.reduce((a, b) => a + b, 0) / item.vals.length).toFixed(2));
      return {
        id: idx + 1,
        ambito: item.ambito,
        perfil: item.perfil,
        quesito: item.quesito,
        media: avg,
        total_respostas: item.vals.length
      };
    });

    ranked.sort((a, b) => b.media - a.media);
    const top5 = ranked.slice(0, 5);
    const sortedAsc = [...ranked].sort((a, b) => a.media - b.media);
    const bottom5 = sortedAsc.slice(0, 5);

    // Levels
    const nivelCounts: Record<string, number> = { 'Inicial': 0, 'Em Desenvolvimento': 0, 'Atuação Adequada': 0, 'Referência': 0 };
    filteredRecords.forEach(r => {
      if (r.nivel && nivelCounts[r.nivel] !== undefined) {
        nivelCounts[r.nivel] += 1;
      }
    });

    return {
      total: filteredRecords.length,
      media_geral,
      ambitos,
      perfis,
      top5,
      bottom5,
      nivelCounts
    };
  }, [filteredRecords]);

  // Chart data for Ambitos
  const ambitosChartData = useMemo(() => {
    return Object.entries(dynamicStats.ambitos).map(([ambito, media]) => ({
      ambito: ambito.length > 24 ? ambito.substring(0, 21) + '...' : ambito,
      fullName: ambito,
      Média: media
    }));
  }, [dynamicStats.ambitos]);

  const activeConfig = instrumentosConfig.find(c => c.id === selectedInstrumento)!;

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-everest-navy via-slate-900 to-everest-blue rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-200 mb-3 border border-white/15">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            Módulo Exclusivo 2026 • Liderança & Especialistas
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gestão & Especialistas da Educação
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
            Visão consolidada dos instrumentos de avaliação de Coordenadores de Ciclo, Psicólogos Escolares,
            Gestão de Inglês e Disciplinas Institucionais, com seus respectivos âmbitos, perfis avaliadores e rankings.
          </p>
        </div>
      </div>

      {/* 2. Instrument Switcher (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {instrumentosConfig.map((item) => {
          const isSelected = selectedInstrumento === item.id;
          const Icon = item.icon;
          const count = data.gestao_especialistas ? (data.gestao_especialistas[item.id]?.length || 0) : 0;

          return (
            <button
              key={item.id}
              onClick={() => {
                setSelectedInstrumento(item.id);
                setSelectedCiclo('TODOS');
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-everest-navy border-everest-navy text-white shadow-lg ring-2 ring-everest-blue/30 scale-[1.01]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-white/10 text-amber-300' : 'bg-slate-100 text-everest-navy'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold leading-snug">{item.title}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {item.subtitle}
                </p>
              </div>

              <div className={`mt-4 pt-3 border-t text-xs flex items-center justify-between font-semibold ${
                isSelected ? 'border-white/10 text-blue-200' : 'border-slate-100 text-slate-500'
              }`}>
                <span>{count} na Rede</span>
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Cycle & Search Sub-Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Cycle Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" /> Ciclo:
          </span>
          {['TODOS', 'EI', 'EFI', 'EFII', 'EM'].map((ciclo) => {
            const isSelected = selectedCiclo === ciclo;
            return (
              <button
                key={ciclo}
                onClick={() => setSelectedCiclo(ciclo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-everest-navy text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {ciclo === 'TODOS' ? 'Todos os Ciclos' : ciclo}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou cargo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-everest-blue/30 focus:border-everest-blue"
          />
        </div>
      </div>

      {/* 4. Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Evaluated */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Profissionais Avaliados</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-everest-navy">{dynamicStats.total}</span>
            <span className="text-xs text-slate-400 font-medium">no recorte selecionado</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Unidade:</span>
            <strong className="text-slate-700">{unidade}</strong>
          </div>
        </div>

        {/* Média Geral */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Média Geral do Instrumento</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-900">{dynamicStats.media_geral.toFixed(2)}</span>
            <span className="text-xs text-slate-400">/ 4.00</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Escala:</span>
            <strong className="text-slate-700">1.00 a 4.00</strong>
          </div>
        </div>

        {/* Nível Predominante */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Maturidade Predominante</span>
          <div className="mt-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
              dynamicStats.media_geral >= 3.60
                ? 'bg-emerald-100 text-emerald-800'
                : dynamicStats.media_geral >= 3.00
                ? 'bg-blue-100 text-blue-800'
                : dynamicStats.media_geral >= 2.50
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              <TrendingUp className="w-3.5 h-3.5" />
              {dynamicStats.media_geral >= 3.60
                ? 'Referência [REF]'
                : dynamicStats.media_geral >= 3.00
                ? 'Atuação Adequada [AA]'
                : dynamicStats.media_geral >= 2.50
                ? 'Em Desenvolvimento [ED]'
                : 'Inicial [I]'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>Adequada / Referência:</span>
            <strong className="text-emerald-700 font-bold">
              {(dynamicStats.nivelCounts['Atuação Adequada'] || 0) + (dynamicStats.nivelCounts['Referência'] || 0)} profissionais
            </strong>
          </div>
        </div>

        {/* Âmbitos Avaliados */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dimensões / Âmbitos</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-900">{Object.keys(dynamicStats.ambitos).length}</span>
            <span className="text-xs text-slate-400">competências-chave</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2 truncate text-ellipsis">
            {selectedInstrumento === 'psicologos'
              ? 'Técnica, Preventiva & Integração'
              : 'Ensino, Aprendizagem, Gestão & Integração'}
          </div>
        </div>
      </div>

      {/* 5. Performance by Âmbito Chart & Evaluator Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Âmbitos Bar Chart (Col 1 & 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-everest-blue" />
                Desempenho por Âmbito • {activeConfig.title}
              </h3>
              <p className="text-xs text-slate-500">
                Médias calculadas especificamente nos tópicos deste instrumento (Escala de 1.00 a 4.00)
              </p>
            </div>
          </div>

          {ambitosChartData.length > 0 ? (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ambitosChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis
                    type="number"
                    domain={[0, 4.0]}
                    stroke="#64748B"
                    fontSize={11}
                    tickCount={5}
                  />
                  <YAxis
                    type="category"
                    dataKey="ambito"
                    stroke="#334155"
                    fontSize={11}
                    fontWeight={600}
                    width={140}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val} / 4.00`, 'Média']}
                    labelFormatter={(label) => {
                      const found = ambitosChartData.find(d => d.ambito === label);
                      return found?.fullName || label;
                    }}
                  />
                  <Bar
                    dataKey="Média"
                    fill="#1E56A0"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Sem dados disponíveis no recorte selecionado
            </div>
          )}
        </div>

        {/* Perfis Avaliadores Card (Col 3) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              Perfis Avaliadores
            </h3>
            <p className="text-xs text-slate-500">
              Visão 360º de notas recebidas por perfil
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(dynamicStats.perfis).map(([perfil, score]) => {
              if (score <= 0) return null;
              return (
                <div key={perfil} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-700">{perfil}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{score.toFixed(2)}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      score >= 3.60
                        ? 'bg-emerald-100 text-emerald-800'
                        : score >= 3.00
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {score >= 3.60 ? 'REF' : score >= 3.00 ? 'AA' : 'ED'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 6. Top 5 & Bottom 5 Quesitos Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Destaques */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Top 5 Quesitos de Destaque
            </h3>
            <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Fortalezas
            </span>
          </div>

          <div className="space-y-2.5">
            {dynamicStats.top5.length > 0 ? (
              dynamicStats.top5.map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/80 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-tight">{q.quesito}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Perfil: <span className="font-semibold text-slate-600">[{q.perfil}]</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-emerald-900">{q.media.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400">{q.total_respostas} respostas</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">Sem quesitos computados</div>
            )}
          </div>
        </div>

        {/* Bottom 5 Oportunidades */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Bottom 5 Quesitos de Desenvolvimento
            </h3>
            <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Atenção
            </span>
          </div>

          <div className="space-y-2.5">
            {dynamicStats.bottom5.length > 0 ? (
              dynamicStats.bottom5.map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/80 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-tight">{q.quesito}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Perfil: <span className="font-semibold text-slate-600">[{q.perfil}]</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-amber-900">{q.media.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400">{q.total_respostas} respostas</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">Sem quesitos computados</div>
            )}
          </div>
        </div>

      </div>

      {/* 7. Individual Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-everest-blue" />
              Lista de Profissionais Avaliados ({filteredRecords.length})
            </h3>
            <p className="text-xs text-slate-500">
              Clique no botão "Ver Detalhes" para abrir a ficha completa do profissional com todas as perguntas computáveis.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Profissional</th>
                <th className="py-3 px-3 text-left">Unidade</th>
                <th className="py-3 px-3 text-left">Ciclo / Segmento</th>
                <th className="py-3 px-3 text-left">Cargo</th>
                <th className="py-3 px-3 text-center">Autoavaliação</th>
                <th className="py-3 px-3 text-center">Do Líder</th>
                <th className="py-3 px-3 text-center font-bold text-everest-navy bg-slate-100/60">Nota Final</th>
                <th className="py-3 px-3 text-center">Nível</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRecords.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div>{r.nome}</div>
                    <div className="text-[11px] font-normal text-slate-400">{r.email}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.unidade === 'Curitiba' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {r.unidade}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {r.segmento}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {r.cargo}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 font-medium">
                    {r.autoavaliacao ? r.autoavaliacao.toFixed(2) : '-'}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 font-medium">
                    {r.do_lider ? r.do_lider.toFixed(2) : '-'}
                  </td>
                  <td className="py-3 px-3 text-center font-extrabold text-blue-900 bg-slate-50/60 text-sm">
                    {r.nota_final ? r.nota_final.toFixed(2) : '-'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r.nivel === 'Referência'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.nivel === 'Atuação Adequada'
                        ? 'bg-blue-100 text-blue-800'
                        : r.nivel === 'Em Desenvolvimento'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {r.nivel || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedProfessional(r)}
                      className="px-3 py-1 bg-everest-navy text-white rounded-lg text-xs font-semibold hover:bg-everest-blue transition-colors shadow-sm"
                    >
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Professional Detail Modal */}
      {selectedProfessional && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-everest-navy to-everest-blue p-6 text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  {selectedProfessional.cargo} • {selectedProfessional.unidade}
                </span>
                <h3 className="text-xl font-bold mt-1">{selectedProfessional.nome}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{selectedProfessional.email}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-slate-200">
                    Ciclo: <strong>{selectedProfessional.segmento}</strong>
                  </span>
                  {selectedProfessional.lider && (
                    <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-slate-200">
                      Líder: <strong>{selectedProfessional.lider}</strong>
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    selectedProfessional.nivel === 'Referência'
                      ? 'bg-emerald-500 text-white'
                      : selectedProfessional.nivel === 'Atuação Adequada'
                      ? 'bg-blue-500 text-white'
                      : selectedProfessional.nivel === 'Em Desenvolvimento'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}>
                    {selectedProfessional.nivel}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfessional(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Scores by Âmbito */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Notas por Âmbito de Avaliação
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(selectedProfessional.topicos).map(([tname, tscore]) => (
                    <div key={tname} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
                      <span className="text-xs font-semibold text-slate-700 leading-snug">{tname}</span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold text-everest-navy">
                          {tscore ? tscore.toFixed(2) : '-'}
                        </span>
                        <span className="text-xs text-slate-400">/ 4.00</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scores by Evaluator Profile */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Consolidação por Perfil Avaliador
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
                    <span className="text-[10px] font-bold uppercase text-blue-900 block">Autoavaliação</span>
                    <strong className="text-lg text-blue-950 font-extrabold mt-1 block">
                      {selectedProfessional.autoavaliacao ? selectedProfessional.autoavaliacao.toFixed(2) : '-'}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-center">
                    <span className="text-[10px] font-bold uppercase text-indigo-900 block">Do Líder / Diretor</span>
                    <strong className="text-lg text-indigo-950 font-extrabold mt-1 block">
                      {selectedProfessional.do_lider ? selectedProfessional.do_lider.toFixed(2) : '-'}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-center">
                    <span className="text-[10px] font-bold uppercase text-purple-900 block">Professores / Pares</span>
                    <strong className="text-lg text-purple-950 font-extrabold mt-1 block">
                      {selectedProfessional.dos_subordinados ? selectedProfessional.dos_subordinados.toFixed(2) : (selectedProfessional.dos_pares ? selectedProfessional.dos_pares.toFixed(2) : '-')}
                    </strong>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                    <span className="text-[10px] font-bold uppercase text-emerald-900 block">Nota Final</span>
                    <strong className="text-lg text-emerald-950 font-extrabold mt-1 block">
                      {selectedProfessional.nota_final ? selectedProfessional.nota_final.toFixed(2) : '-'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Computable Questions Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Detalhamento de Todas as Perguntas Computáveis
                </h4>
                <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider sticky top-0">
                      <tr>
                        <th className="py-2.5 px-4 text-left">Perfil Avaliador</th>
                        <th className="py-2.5 px-4 text-left">Quesito / Indicador</th>
                        <th className="py-2.5 px-4 text-right">Nota Obtida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {Object.entries(selectedProfessional.questoes)
                        .filter(([_, val]) => val !== null && val > 0)
                        .map(([key, val], idx) => {
                          const [perfil, ...rest] = key.split('::');
                          const qName = rest.join('::');
                          return (
                            <tr key={idx} className="hover:bg-slate-50/80">
                              <td className="py-2 px-4 font-semibold text-slate-600">[{perfil}]</td>
                              <td className="py-2 px-4 text-slate-800">{qName}</td>
                              <td className="py-2 px-4 text-right font-extrabold text-blue-900">{val?.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedProfessional(null)}
                className="px-5 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
