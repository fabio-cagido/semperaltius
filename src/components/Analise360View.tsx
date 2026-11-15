'use client';

import React from 'react';
import { ScopeAnalytics, DashboardData, UnidadeScope } from '@/types/dashboard';
import { Compass, Info, Award, UserCheck } from 'lucide-react';
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

interface Analise360ViewProps {
  analytics: ScopeAnalytics;
  metadata: DashboardData['metadata'];
  unidade: UnidadeScope;
}

export default function Analise360View({ analytics, metadata, unidade }: Analise360ViewProps) {
  const { ciclos } = analytics;

  const ciclosKeys = ['EI', 'EFI', 'EFII', 'EM'] as const;

  // Build Radar Data for each cycle
  const makeCycleRadarData = (cKey: 'EI' | 'EFI' | 'EFII' | 'EM') => {
    const data = ciclos[cKey]?.perfis_avaliadores || {
      coordenador: 0,
      autoavaliação: 0,
      pares: 0,
      outros_psicólogo: 0,
      alunos: 0
    };

    const isF2orEM = cKey === 'EFII' || cKey === 'EM';

    const items = [
      { papel: 'Nota Coordenador', nota: data.coordenador },
      { papel: 'Nota Autoavaliação', nota: data.autoavaliação },
      { papel: 'Nota Pares', nota: data.pares },
      { papel: 'Nota Psicólogo', nota: data.outros_psicólogo },
    ];

    if (isF2orEM) {
      items.push({ papel: 'Nota Alunos', nota: (data.alunos ?? 0) > 0 ? (data.alunos ?? 0) : 0 });
    }

    return items;
  };

  // Build Overlaid Radar Data (Slide 4 of 2025)
  // Axes: Coordenador, Autoavaliação, Pares, Psicólogo, Alunos
  const overlaidData = [
    {
      papel: 'Nota Coordenador',
      'Educação Infantil': ciclos['EI']?.perfis_avaliadores?.coordenador || 0,
      'Ensino Fundamental I': ciclos['EFI']?.perfis_avaliadores?.coordenador || 0,
      'Ensino Fundamental II': ciclos['EFII']?.perfis_avaliadores?.coordenador || 0,
      'Ensino Médio': ciclos['EM']?.perfis_avaliadores?.coordenador || 0,
    },
    {
      papel: 'Nota Autoavaliação',
      'Educação Infantil': ciclos['EI']?.perfis_avaliadores?.autoavaliação || 0,
      'Ensino Fundamental I': ciclos['EFI']?.perfis_avaliadores?.autoavaliação || 0,
      'Ensino Fundamental II': ciclos['EFII']?.perfis_avaliadores?.autoavaliação || 0,
      'Ensino Médio': ciclos['EM']?.perfis_avaliadores?.autoavaliação || 0,
    },
    {
      papel: 'Nota Pares',
      'Educação Infantil': ciclos['EI']?.perfis_avaliadores?.pares || 0,
      'Ensino Fundamental I': ciclos['EFI']?.perfis_avaliadores?.pares || 0,
      'Ensino Fundamental II': ciclos['EFII']?.perfis_avaliadores?.pares || 0,
      'Ensino Médio': ciclos['EM']?.perfis_avaliadores?.pares || 0,
    },
    {
      papel: 'Nota Psicólogo',
      'Educação Infantil': ciclos['EI']?.perfis_avaliadores?.outros_psicólogo || 0,
      'Ensino Fundamental I': ciclos['EFI']?.perfis_avaliadores?.outros_psicólogo || 0,
      'Ensino Fundamental II': ciclos['EFII']?.perfis_avaliadores?.outros_psicólogo || 0,
      'Ensino Médio': ciclos['EM']?.perfis_avaliadores?.outros_psicólogo || 0,
    },
    {
      papel: 'Nota Alunos',
      'Educação Infantil': null,
      'Ensino Fundamental I': null,
      'Ensino Fundamental II': ciclos['EFII']?.perfis_avaliadores?.alunos || 0,
      'Ensino Médio': ciclos['EM']?.perfis_avaliadores?.alunos || 0,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-everest-navy to-everest-blue rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-blue-200 mb-3">
          <UserCheck className="w-3.5 h-3.5" />
          Metodologia 360º • Comparativo com Relatório 2025
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Análise 360º Docente por Perfis Avaliadores
        </h2>
        <p className="mt-2 text-sm text-slate-200 max-w-3xl leading-relaxed">
          Visualização das notas médias atribuídas por cada grupo avaliador: Coordenador (Líder), Autoavaliação, Pares, Psicólogo e Alunos.
          Mantém a identidade visual consagrada no relatório de 2025, adaptada para a escala de 1.00 a 4.00 de 2026.
        </p>
      </div>

      {/* 2. Overlaid Multi-cycle Radar (Slide 4 of 2025) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 mb-1">
            Referência Slide 4 • Relatório 2025
          </div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-everest-blue" />
            Perfil das Avaliações por Papéis (Sobrepostos)
          </h3>
          <p className="text-xs text-slate-500">
            Comparação direta dos 4 ciclos escolares nos vértices avaliativos (Lembrando que EI e EFI não possuem eixo de alunos)
          </p>
        </div>

        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={overlaidData}>
              <PolarGrid stroke="#CBD5E1" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="papel" tick={{ fill: '#0F172A', fontSize: 11, fontWeight: 700 }} />
              <PolarRadiusAxis angle={90} domain={[0, 4.0]} stroke="#64748B" fontSize={10} />
              <Tooltip formatter={(val: any, name: any) => [val ? `${val} / 4.00` : 'Não aplicável', name]} />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '15px' }} />

              <Radar
                name="Educação Infantil"
                dataKey="Educação Infantil"
                stroke="#EC4899"
                fill="#EC4899"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Ensino Fundamental I"
                dataKey="Ensino Fundamental I"
                stroke="#F97316"
                fill="#F97316"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Ensino Fundamental II"
                dataKey="Ensino Fundamental II"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Ensino Médio"
                dataKey="Ensino Médio"
                stroke="#0284C7"
                fill="#0284C7"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Individual Radar Charts by Segment (Slide 3 of 2025) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 mb-1">
            Referência Slide 3 • Relatório 2025
          </div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-everest-blue" />
            Médias das Avaliações por Papéis em Cada Ciclo
          </h3>
          <p className="text-xs text-slate-500">
            Quatro gráficos radares individuais detalhando a nota de cada perspectiva avaliativa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* EI Radar */}
          <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/40">
            <div className="text-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                Educação Infantil (EI)
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={makeCycleRadarData('EI')}>
                  <PolarGrid stroke="#CBD5E1" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="papel" tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 4.0]} stroke="#94A3B8" fontSize={9} />
                  <Tooltip formatter={(val: any) => [`${val} / 4.00`, 'Média']} />
                  <Radar name="EI" dataKey="nota" stroke="#EC4899" fill="#EC4899" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* EFI Radar */}
          <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/40">
            <div className="text-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                Ensino Fundamental I (EFI)
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={makeCycleRadarData('EFI')}>
                  <PolarGrid stroke="#CBD5E1" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="papel" tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 4.0]} stroke="#94A3B8" fontSize={9} />
                  <Tooltip formatter={(val: any) => [`${val} / 4.00`, 'Média']} />
                  <Radar name="EFI" dataKey="nota" stroke="#F97316" fill="#F97316" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* EFII Radar */}
          <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/40">
            <div className="text-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Ensino Fundamental II (EFII)
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={makeCycleRadarData('EFII')}>
                  <PolarGrid stroke="#CBD5E1" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="papel" tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 4.0]} stroke="#94A3B8" fontSize={9} />
                  <Tooltip formatter={(val: any) => [`${val} / 4.00`, 'Média']} />
                  <Radar name="EFII" dataKey="nota" stroke="#10B981" fill="#10B981" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* EM Radar */}
          <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/40">
            <div className="text-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                Ensino Médio (EM)
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={makeCycleRadarData('EM')}>
                  <PolarGrid stroke="#CBD5E1" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="papel" tick={{ fill: '#334155', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 4.0]} stroke="#94A3B8" fontSize={9} />
                  <Tooltip formatter={(val: any) => [`${val} / 4.00`, 'Média']} />
                  <Radar name="EM" dataKey="nota" stroke="#0284C7" fill="#0284C7" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Detailed Values Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Segmento</th>
                <th className="py-3 px-4 text-center">Nota Coordenador</th>
                <th className="py-3 px-4 text-center">Nota Autoavaliação</th>
                <th className="py-3 px-4 text-center">Nota Pares</th>
                <th className="py-3 px-4 text-center">Nota Psicólogo</th>
                <th className="py-3 px-4 text-center">Nota Alunos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {ciclosKeys.map((cKey) => {
                const data = ciclos[cKey]?.perfis_avaliadores || {
                  coordenador: 0,
                  autoavaliação: 0,
                  pares: 0,
                  outros_psicólogo: 0,
                  alunos: 0
                };
                const name = cKey === 'EI' ? 'Educação Infantil'
                  : cKey === 'EFI' ? 'Ensino Fundamental I'
                  : cKey === 'EFII' ? 'Ensino Fundamental II'
                  : 'Ensino Médio';

                return (
                  <tr key={cKey} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-800">{name} ({cKey})</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{data.coordenador.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{data.autoavaliação.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{data.pares.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">{data.outros_psicólogo.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center font-semibold text-purple-800">
                      {cKey === 'EFII' || cKey === 'EM'
                        ? (data.alunos > 0 ? `${data.alunos.toFixed(2)}` : '0.00')
                        : <span className="text-slate-400 font-normal italic">Não aplicável</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
