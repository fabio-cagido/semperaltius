'use client';

import React, { useState } from 'react';
import { ScopeAnalytics, DashboardData, UnidadeScope } from '@/types/dashboard';
import { BarChart3, Info, Users, ShieldAlert } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList
} from 'recharts';

interface ComparativoCiclosViewProps {
  analytics: ScopeAnalytics;
  metadata: DashboardData['metadata'];
  unidade: UnidadeScope;
}

type ComparativoViewType = 'Docentes' | 'Coordenação' | 'Psicólogos';

export default function ComparativoCiclosView({ analytics, metadata, unidade }: ComparativoCiclosViewProps) {
  const [activeGroup, setActiveGroup] = useState<ComparativoViewType>('Docentes');
  const { comparativo_ciclos, cargos_resumo } = analytics;

  const groupData = comparativo_ciclos[activeGroup] || {
    'EI': {},
    'EFI': {},
    'EFII': {},
    'EM': {},
    'Total Geral': {}
  };

  // Build chart dataset: 5 Âmbitos on X-Axis
  const chartData = metadata.ambitos.map((amb) => {
    return {
      ambito: amb.length > 22 ? amb.substring(0, 19) + '...' : amb,
      fullName: amb,
      'Educação Infantil': groupData['EI']?.[amb] || null,
      'Ensino Fundamental I': groupData['EFI']?.[amb] || null,
      'Ensino Fundamental II': groupData['EFII']?.[amb] || null,
      'Ensino Médio': groupData['EM']?.[amb] || null,
      'Total Geral': groupData['Total Geral']?.[amb] || null,
    };
  });

  const currentCount = activeGroup === 'Docentes'
    ? cargos_resumo['Docentes']?.total || 0
    : activeGroup === 'Coordenação'
    ? cargos_resumo['Coordenação / Direção']?.total || 0
    : cargos_resumo['Psicólogos']?.total || 0;

  const hasData = currentCount > 0;

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-everest-navy to-everest-blue rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-blue-200 mb-3">
          <BarChart3 className="w-3.5 h-3.5" />
          Comparações entre Ciclos • Slides 27, 28 e 29
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Comparativo de Desempenho por Âmbito e Ciclo
        </h2>
        <p className="mt-2 text-sm text-slate-200 max-w-3xl leading-relaxed">
          Gráficos de barras agrupadas comparando Educação Infantil, Ensino Fundamental I, Ensino Fundamental II,
          Ensino Médio e Total Geral nos 5 âmbitos de avaliação, segmentados nas 3 visões obrigatórias: Docentes, Coordenações e Psicólogas.
        </p>
      </div>

      {/* 2. Group Selector Switcher (Docentes, Coordenações, Psicólogas) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Segmentação de Cargo Avaliado
          </span>
          <span className="text-sm font-bold text-slate-800">
            Selecione a Visão Comparativa:
          </span>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveGroup('Docentes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeGroup === 'Docentes'
                ? 'bg-everest-navy text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>Docentes</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">Slide 29</span>
          </button>
          
          <button
            onClick={() => setActiveGroup('Coordenação')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeGroup === 'Coordenação'
                ? 'bg-everest-navy text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>Coordenações</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">Slide 27</span>
          </button>

          <button
            onClick={() => setActiveGroup('Psicólogos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeGroup === 'Psicólogos'
                ? 'bg-everest-navy text-white shadow'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>Psicólogas</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">Slide 28</span>
          </button>
        </div>
      </div>

      {/* 3. Main Comparison Chart (Replicating exact look of Slide 5 of 2025 and 27-29 of 2026) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-everest-blue" />
              Desempenho por Âmbito / Segmento • {activeGroup}
            </h3>
            <p className="text-xs text-slate-500">
              Escala de 1.00 a 4.00 com destaque para a barra vermelha representando o Total Geral
            </p>
          </div>

          <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            Total de Profissionais: <strong className="text-everest-navy">{currentCount}</strong>
          </div>
        </div>

        {hasData ? (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 0, bottom: 35 }}
                barGap={3}
                barCategoryGap="18%"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="ambito"
                  stroke="#475569"
                  fontSize={11}
                  fontWeight={600}
                  interval={0}
                  tick={{ fill: '#334155' }}
                />
                <YAxis
                  domain={[0, 4.0]}
                  stroke="#64748B"
                  fontSize={11}
                  tickCount={5}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [val ? `${val} / 4.00` : 'Sem dados', name]}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: '20px' }}
                />

                {/* Bars matching the color scheme of the 2025 report */}
                <Bar dataKey="Educação Infantil" fill="#38BDF8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Ensino Fundamental I" fill="#0284C7" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Ensino Fundamental II" fill="#2563EB" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Ensino Médio" fill="#818CF8" radius={[3, 3, 0, 0]} />
                {/* Total Geral in distinct institutional red */}
                <Bar dataKey="Total Geral" fill="#B91C1C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800">Sem avaliados diretos neste recorte</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Não foram encontrados profissionais cadastrados neste cargo para a unidade selecionada ({unidade}).
              Selecione outra unidade ou explore a visão de Docentes.
            </p>
          </div>
        )}

        {/* Comparison Table */}
        {hasData && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 pt-2">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-left">Âmbito Avaliado</th>
                  <th className="py-3 px-3 text-center text-sky-700">Educação Infantil</th>
                  <th className="py-3 px-3 text-center text-blue-700">Fundamental I</th>
                  <th className="py-3 px-3 text-center text-indigo-700">Fundamental II</th>
                  <th className="py-3 px-3 text-center text-purple-700">Ensino Médio</th>
                  <th className="py-3 px-3 text-center text-rose-800 bg-rose-50/60 font-extrabold">Total Geral</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {metadata.ambitos.map((amb) => {
                  const ei = groupData['EI']?.[amb];
                  const efi = groupData['EFI']?.[amb];
                  const efii = groupData['EFII']?.[amb];
                  const em = groupData['EM']?.[amb];
                  const total = groupData['Total Geral']?.[amb];

                  return (
                    <tr key={amb} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-800">{amb}</td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">{ei ? ei.toFixed(2) : '-'}</td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">{efi ? efi.toFixed(2) : '-'}</td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">{efii ? efii.toFixed(2) : '-'}</td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">{em ? em.toFixed(2) : '-'}</td>
                      <td className="py-3 px-3 text-center font-extrabold text-rose-700 bg-rose-50/30">
                        {total ? total.toFixed(2) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
