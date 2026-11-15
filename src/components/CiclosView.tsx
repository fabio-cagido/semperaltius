'use client';

import React, { useState } from 'react';
import { ScopeAnalytics, DashboardData, UnidadeScope, CicloEscolar } from '@/types/dashboard';
import {
  Layers,
  Star,
  TrendingDown,
  Info,
  Award,
  AlertTriangle,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from 'recharts';

interface CiclosViewProps {
  analytics: ScopeAnalytics;
  metadata: DashboardData['metadata'];
  unidade: UnidadeScope;
}

export default function CiclosView({ analytics, metadata, unidade }: CiclosViewProps) {
  const [selectedCiclo, setSelectedCiclo] = useState<CicloEscolar>('EI');

  const ciclosList: { id: CicloEscolar; label: string; sub: string }[] = [
    { id: 'EI', label: 'Educação Infantil', sub: 'EI' },
    { id: 'EFI', label: 'Ensino Fundamental I', sub: 'EFI (1º ao 5º ano)' },
    { id: 'EFII', label: 'Ensino Fundamental II', sub: 'EFII (6º ao 9º ano)' },
    { id: 'EM', label: 'Ensino Médio', sub: 'EM (1ª a 3ª série)' },
  ];

  const currentCicloData = analytics.ciclos[selectedCiclo] || {
    total: 0,
    media_geral: 0,
    ambitos: {},
    perfis_avaliadores: { coordenador: 0, autoavaliação: 0, pares: 0, outros_psicólogo: 0, alunos: 0 },
    rankings: { todos: [], top5: [], bottom5: [] },
    cargos: { Docentes: {}, Coordenação: {}, Psicólogos: {} }
  };

  // Build Radar Data for the 5 Âmbitos (Novidade 2026 - Slides 13, 17, 21, 25)
  // Vertices = 5 Âmbitos
  // Curves = Coordenador, Docentes, Psicólogo, Gestão de Inglês
  const radarAmbitosData = metadata.ambitos.map((amb) => {
    const docenteScore = currentCicloData.ambitos[amb] || 0;
    const coordScore = currentCicloData.cargos?.Coordenação?.[amb] ?? null;
    const psicoScore = currentCicloData.cargos?.Psicólogos?.[amb] ?? null;
    const inglesScore = currentCicloData.cargos?.['Supervisão de Inglês']?.[amb] ?? null;

    return {
      ambito: amb.length > 25 ? amb.substring(0, 22) + '...' : amb,
      fullName: amb,
      'Docentes': docenteScore > 0 ? docenteScore : null,
      'Coordenador': coordScore && coordScore > 0 ? coordScore : null,
      'Psicólogo': psicoScore && psicoScore > 0 ? psicoScore : null,
      'Gestão de Inglês': inglesScore && inglesScore > 0 ? inglesScore : null
    };
  });

  const hasCoord = Object.values(currentCicloData.cargos?.Coordenação || {}).some(v => v > 0);
  const hasPsico = Object.values(currentCicloData.cargos?.Psicólogos || {}).some(v => v > 0);
  const hasIngles = Object.values(currentCicloData.cargos?.['Supervisão de Inglês'] || {}).some(v => v > 0);

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Ciclo Selector Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Filtro de Segmento Escolar
          </div>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            Selecione o Ciclo para Detalhamento:
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ciclosList.map((c) => {
            const isSelected = selectedCiclo === c.id;
            const count = analytics.distribuicao_ciclo[c.id] || 0;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCiclo(c.id)}
                className={`flex flex-col items-start px-4 py-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-everest-navy border-everest-navy text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                }`}
              >
                <span className="text-xs font-bold leading-tight">{c.label}</span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {count} avaliados
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Ciclo Overview Banner & KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-everest-navy to-everest-blue rounded-2xl p-5 text-white shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200 block">
              Ciclo Selecionado
            </span>
            <h3 className="text-xl font-bold mt-1">
              {ciclosList.find(c => c.id === selectedCiclo)?.label}
            </h3>
            <p className="text-xs text-slate-200 mt-1">
              {ciclosList.find(c => c.id === selectedCiclo)?.sub}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span>Participantes:</span>
            <strong className="text-base font-extrabold">{currentCicloData.total}</strong>
          </div>
        </div>

        {/* Média do Ciclo */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Média Geral do Ciclo</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-900">{currentCicloData.media_geral.toFixed(2)}</span>
            <span className="text-xs text-slate-400">/ 4.00</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 border-t border-slate-100 pt-2">
            {currentCicloData.media_geral >= 3.60 ? 'Maturidade: Referência'
              : currentCicloData.media_geral >= 3.00 ? 'Maturidade: Atuação Adequada'
              : 'Maturidade: Em Desenvolvimento'}
          </div>
        </div>

        {/* Melhor Âmbito */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Âmbito Mais Forte</span>
          {(() => {
            const entries = Object.entries(currentCicloData.ambitos);
            if (!entries.length) return <div className="text-xs text-slate-400">Sem dados</div>;
            const sorted = entries.sort((a, b) => b[1] - a[1]);
            const top = sorted[0];
            return (
              <>
                <div className="mt-2">
                  <div className="text-sm font-bold text-emerald-700 line-clamp-1">{top[0]}</div>
                  <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">{top[1].toFixed(2)}</div>
                </div>
                <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-1">
                  Destaque no ciclo
                </div>
              </>
            );
          })()}
        </div>

        {/* Âmbito com Maior Oportunidade */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Foco de Melhoria</span>
          {(() => {
            const entries = Object.entries(currentCicloData.ambitos);
            if (!entries.length) return <div className="text-xs text-slate-400">Sem dados</div>;
            const sorted = entries.sort((a, b) => a[1] - b[1]);
            const bottom = sorted[0];
            return (
              <>
                <div className="mt-2">
                  <div className="text-sm font-bold text-amber-700 line-clamp-1">{bottom[0]}</div>
                  <div className="text-2xl font-extrabold text-amber-600 mt-0.5">{bottom[1].toFixed(2)}</div>
                </div>
                <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-1">
                  Prioridade pedagógica
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 3. Gráfico Aranha Comparativo dos 5 Âmbitos (NOVIDADE 2026 - Slides 13, 17, 21, 25) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 mb-1">
              Novidade Obrigatória 2026 • Slides 13, 17, 21 e 25
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-everest-blue" />
              Gráfico Aranha Comparativo por Âmbitos ({selectedCiclo})
            </h3>
            <p className="text-xs text-slate-500">
              Sobreposição das curvas de desempenho nos 5 âmbitos: Coordenador, Docentes, Psicólogo e Supervisor de Inglês
            </p>
          </div>

          {/* Recorte Notes */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            {hasCoord ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                Coordenação ativa ({selectedCiclo})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-600 italic border border-slate-200">
                <Info className="w-3 h-3" /> Coordenadores: Sem avaliados neste recorte
              </span>
            )}
            {hasPsico ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium">
                Psicologia ativa ({selectedCiclo})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-600 italic border border-slate-200">
                <Info className="w-3 h-3" /> Psicólogos: Sem avaliados neste recorte
              </span>
            )}
            {hasIngles && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-50 text-purple-900 border border-purple-200 font-medium">
                Gestão de Inglês ativa ({selectedCiclo})
              </span>
            )}
          </div>
        </div>

        {/* Spider Chart */}
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarAmbitosData}>
              <PolarGrid stroke="#CBD5E1" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="ambito"
                tick={{ fill: '#1E293B', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 4.0]}
                stroke="#64748B"
                fontSize={10}
                tickCount={5}
              />
              <Tooltip
                formatter={(val: any, name: any, item: any) => [
                  val !== null ? `${val} / 4.00` : 'Sem avaliados neste recorte',
                  name
                ]}
              />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '15px' }} />

              {/* Docentes Curve */}
              <Radar
                name="Docentes"
                dataKey="Docentes"
                stroke="#2563EB"
                fill="#2563EB"
                fillOpacity={0.35}
                strokeWidth={2.5}
              />

              {/* Coordenadores Curve */}
              {hasCoord ? (
                <Radar
                  name="Coordenador"
                  dataKey="Coordenador"
                  stroke="#D97706"
                  fill="#D97706"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              ) : null}

              {/* Psicólogo Curve */}
              {hasPsico ? (
                <Radar
                  name="Psicólogo"
                  dataKey="Psicólogo"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ) : null}

              {/* Gestão de Inglês Curve */}
              {hasIngles ? (
                <Radar
                  name="Gestão de Inglês"
                  dataKey="Gestão de Inglês"
                  stroke="#9333EA"
                  fill="#9333EA"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              ) : null}

            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Values Table for the 5 Âmbitos in this Cycle */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4 text-left">Âmbito Avaliado</th>
                <th className="py-2.5 px-4 text-center text-blue-900 bg-blue-50/50">Média Geral do Ciclo</th>
                <th className="py-2.5 px-4 text-center">Autoavaliação Docente</th>
                <th className="py-2.5 px-4 text-center">Nota da Coordenação</th>
                <th className="py-2.5 px-4 text-center">Nota dos Pares / Psicólogos</th>
                {selectedCiclo === 'EFII' || selectedCiclo === 'EM' ? (
                  <th className="py-2.5 px-4 text-center text-purple-900 bg-purple-50/50">Alunos (Subordinados)</th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {metadata.ambitos.map((amb) => {
                const score = currentCicloData.ambitos[amb] || 0;
                return (
                  <tr key={amb} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{amb}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-blue-800 bg-blue-50/30">
                      {score.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-700">
                      {currentCicloData.perfis_avaliadores.autoavaliação.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-700">
                      {currentCicloData.perfis_avaliadores.coordenador.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-700">
                      {currentCicloData.perfis_avaliadores.pares.toFixed(2)}
                    </td>
                    {selectedCiclo === 'EFII' || selectedCiclo === 'EM' ? (
                      <td className="py-2.5 px-4 text-center text-purple-800 bg-purple-50/20 font-semibold">
                        {currentCicloData.perfis_avaliadores.alunos > 0
                          ? currentCicloData.perfis_avaliadores.alunos.toFixed(2)
                          : 'Não aplicável / 0'}
                      </td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Top 5 e Bottom 5 do Ciclo Selecionado (Slides 10, 11, 12, 14, 15, 16, 18, 19, 20, 22, 23, 24) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top 5 do Ciclo */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                TOP 5 Indicadores em {selectedCiclo} (Pontos Fortes)
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Geral (Sem separar por âmbito)
              </span>
            </div>

            <div className="space-y-3">
              {currentCicloData.rankings.top5.map((q, idx) => (
                <div key={q.id} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {q.perfil}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            • {q.ambito}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-800 leading-snug">
                          {q.quesito}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-emerald-600">{q.media.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">de 4.00</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom 5 do Ciclo */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-500" />
                BOTTOM 5 Indicadores em {selectedCiclo} (Oportunidades de Melhoria)
              </h3>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                Geral (Sem separar por âmbito)
              </span>
            </div>

            <div className="space-y-3">
              {currentCicloData.rankings.bottom5.map((q, idx) => (
                <div key={q.id} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            {q.perfil}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            • {q.ambito}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-800 leading-snug">
                          {q.quesito}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold text-rose-600">{q.media.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">de 4.00</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
