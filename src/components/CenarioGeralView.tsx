'use client';

import React from 'react';
import { ScopeAnalytics, DashboardData, UnidadeScope } from '@/types/dashboard';
import {
  Users,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Star,
  Info,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface CenarioGeralViewProps {
  analytics: ScopeAnalytics;
  metadata: DashboardData['metadata'];
  unidade: UnidadeScope;
}

const SEGMENTO_COLORS = {
  'EI': '#0284C7',
  'EFI': '#2563EB',
  'EFII': '#4F46E5',
  'EM': '#7C3AED',
  'Geral / Transversal': '#64748B'
};

const GENDER_COLORS = {
  'Mulheres': '#E11D48',
  'Homens': '#0284C7'
};

export default function CenarioGeralView({ analytics, metadata, unidade }: CenarioGeralViewProps) {
  const { kpis, distribuicao_ciclo, matriz_desempenho, ambitos_gerais, cargos_resumo, rankings_gerais } = analytics;

  // Pie chart data for Segments
  const segmentData = Object.entries(distribuicao_ciclo)
    .filter(([_, count]) => count > 0)
    .map(([seg, count]) => ({
      name: seg === 'EI' ? 'Educação Infantil'
        : seg === 'EFI' ? 'Ensino Fundamental I'
        : seg === 'EFII' ? 'Ensino Fundamental II'
        : seg === 'EM' ? 'Ensino Médio'
        : 'Transversal / Geral',
      shortName: seg,
      value: count,
      pct: ((count / kpis.total_avaliados) * 100).toFixed(1)
    }));

  // Pie chart data for Gender
  const genderData = [
    { name: 'Mulheres', value: kpis.mulheres_count, pct: kpis.mulheres_pct },
    { name: 'Homens', value: kpis.homens_count, pct: kpis.homens_pct }
  ];

  // Stacked Bar Data for Performance Matrix
  const matrixCycles = ['EI', 'EFI', 'EFII', 'EM'];
  if (distribuicao_ciclo['Geral / Transversal'] > 0) {
    matrixCycles.push('Geral / Transversal');
  }

  const stackedBarData = matrixCycles.map((cycle) => {
    const row = matriz_desempenho[cycle] || {
      'Inicial': { count: 0, pct: 0 },
      'Em Desenvolvimento': { count: 0, pct: 0 },
      'Atuação Adequada': { count: 0, pct: 0 },
      'Referência': { count: 0, pct: 0 }
    };
    return {
      name: cycle,
      'Inicial [I]': row['Inicial'].pct,
      'Em Desenvolvimento [ED]': row['Em Desenvolvimento'].pct,
      'Atuação Adequada [AA]': row['Atuação Adequada'].pct,
      'Referência [REF]': row['Referência'].pct,
      totalCount: matriz_desempenho[cycle]?.['Inicial']?.total_ciclo || 0
    };
  });

  // Calculate consolidated percentage (AA + REF)
  const totalRow = matriz_desempenho['Total'] || {
    'Inicial': { count: 0, pct: 0 },
    'Em Desenvolvimento': { count: 0, pct: 0 },
    'Atuação Adequada': { count: 0, pct: 0 },
    'Referência': { count: 0, pct: 0 }
  };
  const consolidadoPct = (totalRow['Atuação Adequada'].pct + totalRow['Referência'].pct).toFixed(1);
  const atencaoCount = totalRow['Inicial'].count + totalRow['Em Desenvolvimento'].count;

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-everest-navy via-everest-blue to-everest-dark rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-white/10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-blue-200 mb-3">
            <Info className="w-3.5 h-3.5" />
            Visão Geral Institucional • Ano Letivo 2026
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Cenário Geral {unidade === 'Todas' ? 'da Rede Semper Altius' : `da Unidade ${unidade}`}
          </h2>
          <p className="mt-2 text-sm text-slate-200 leading-relaxed">
            Consolidação dos resultados da Avaliação Institucional 360º abrangendo {kpis.total_avaliados} participantes.
            Escala contínua de 1.00 a 4.00, com distribuição por níveis de maturidade, demografia e rankings globais de indicadores.
          </p>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Avaliados */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Participantes</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-everest-blue flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{kpis.total_avaliados}</span>
            <span className="text-xs text-slate-500 font-medium">profissionais avaliados</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="font-semibold text-rose-600">{kpis.mulheres_pct}% Mulheres</span>
            <span>•</span>
            <span className="font-semibold text-blue-600">{kpis.homens_pct}% Homens</span>
          </div>
        </div>

        {/* Média Geral */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Média Institucional</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{kpis.media_geral.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-normal">/ 4.00</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Nível Atuação Adequada (AA)
            </span>
          </div>
        </div>

        {/* Desempenho Consolidado */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Desempenho Consolidado</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-700">{consolidadoPct}%</span>
            <span className="text-xs text-slate-500 font-medium">da equipe</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span>{totalRow['Atuação Adequada'].count + totalRow['Referência'].count} de {kpis.total_avaliados} em AA ou REF</span>
          </div>
        </div>

        {/* Atenção / Desenvolvimento */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Foco em Desenvolvimento</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600">{atencaoCount}</span>
            <span className="text-xs text-slate-500 font-medium">profissionais</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <span>{totalRow['Inicial'].count} em Inicial • {totalRow['Em Desenvolvimento'].count} em Desenv.</span>
          </div>
        </div>

      </div>

      {/* 3. Demografia: Segmentos & Sexo (Slides 2 de 2025 e 3 de 2026) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-everest-blue" />
            Perfil dos Participantes por Segmento e Sexo
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Distribuição do corpo docente e equipe técnica pedagógica conforme referencial dos relatórios institucionais
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Segmentos Chart */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center mb-2">
              Distribuição por Ciclo Escolar / Segmento
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ shortName, pct }) => `${shortName}: ${pct}%`}
                  >
                    {segmentData.map((entry, index) => {
                      const color = SEGMENTO_COLORS[entry.shortName as keyof typeof SEGMENTO_COLORS] || '#64748B';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `${value} pessoas (${props.payload.pct}%)`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Table summary of segments */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {segmentData.map((s) => (
                <div key={s.shortName} className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-600 truncate">{s.shortName}</div>
                  <div className="text-base font-bold text-slate-900">{s.value} <span className="text-[10px] text-slate-400 font-normal">({s.pct}%)</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Chart */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center mb-2">
              Distribuição por Sexo / Gênero
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, pct }) => `${name}: ${pct}%`}
                  >
                    <Cell fill={GENDER_COLORS['Mulheres']} />
                    <Cell fill={GENDER_COLORS['Homens']} />
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, props: any) => [
                      `${value} pessoas (${props.payload.pct}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Gender cards */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-rose-50/60 rounded-xl p-3 border border-rose-100 text-center">
                <div className="text-xs font-semibold text-rose-700">Mulheres</div>
                <div className="text-xl font-bold text-rose-900">{kpis.mulheres_count}</div>
                <div className="text-[11px] text-rose-600 font-medium">{kpis.mulheres_pct}% do total</div>
              </div>
              <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 text-center">
                <div className="text-xs font-semibold text-blue-700">Homens</div>
                <div className="text-xl font-bold text-blue-900">{kpis.homens_count}</div>
                <div className="text-[11px] text-blue-600 font-medium">{kpis.homens_pct}% do total</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Matriz de Distribuição por Níveis de Desempenho (NOVIDADE 2026 - Slides 8 e 9) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-1">
              Novo em 2026 • Slides 8 &amp; 9
            </div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-everest-blue" />
              Matriz de Distribuição dos Resultados por Níveis de Desempenho
            </h3>
            <p className="text-xs text-slate-500">
              Mapeamento de maturidade profissional cruzado pelos ciclos escolares (Escala 1.00 a 4.00)
            </p>
          </div>

          {/* Legend Badges */}
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Inicial [&lt; 2.50]
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Em Desenv. [2.50-2.99]
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Adequada [3.00-3.59]
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Referência [≥ 3.60]
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 font-bold text-slate-700 text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 text-left">Ciclo Escolar</th>
                <th className="py-3.5 px-4 text-center bg-rose-50/50 text-rose-900 border-l border-r border-slate-200">
                  Inicial [I] <br /><span className="text-[10px] font-normal text-rose-600">&lt; 2.50</span>
                </th>
                <th className="py-3.5 px-4 text-center bg-amber-50/50 text-amber-900 border-r border-slate-200">
                  Em Desenvolvimento [ED] <br /><span className="text-[10px] font-normal text-amber-600">2.50 a 2.99</span>
                </th>
                <th className="py-3.5 px-4 text-center bg-blue-50/50 text-blue-900 border-r border-slate-200">
                  Atuação Adequada [AA] <br /><span className="text-[10px] font-normal text-blue-600">3.00 a 3.59</span>
                </th>
                <th className="py-3.5 px-4 text-center bg-emerald-50/50 text-emerald-900 border-r border-slate-200">
                  Referência [REF] <br /><span className="text-[10px] font-normal text-emerald-600">≥ 3.60</span>
                </th>
                <th className="py-3.5 px-4 text-right bg-slate-100 font-extrabold">Total Ciclo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {matrixCycles.map((cycle) => {
                const row = matriz_desempenho[cycle] || {
                  'Inicial': { count: 0, pct: 0, total_ciclo: 0 },
                  'Em Desenvolvimento': { count: 0, pct: 0, total_ciclo: 0 },
                  'Atuação Adequada': { count: 0, pct: 0, total_ciclo: 0 },
                  'Referência': { count: 0, pct: 0, total_ciclo: 0 }
                };
                const cicloNome = cycle === 'EI' ? 'Educação Infantil (EI)'
                  : cycle === 'EFI' ? 'Ensino Fundamental I (EFI)'
                  : cycle === 'EFII' ? 'Ensino Fundamental II (EFII)'
                  : cycle === 'EM' ? 'Ensino Médio (EM)'
                  : 'Transversal / Geral';

                const totalCycle = row['Inicial'].total_ciclo;

                return (
                  <tr key={cycle} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{cicloNome}</td>
                    
                    {/* Inicial */}
                    <td className="py-3 px-4 text-center border-l border-r border-slate-200">
                      <span className={`font-bold ${row['Inicial'].count > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {row['Inicial'].count}
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5">({row['Inicial'].pct}%)</span>
                    </td>

                    {/* Em Desenvolvimento */}
                    <td className="py-3 px-4 text-center border-r border-slate-200">
                      <span className={`font-bold ${row['Em Desenvolvimento'].count > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {row['Em Desenvolvimento'].count}
                      </span>
                      <span className="text-xs text-slate-400 ml-1.5">({row['Em Desenvolvimento'].pct}%)</span>
                    </td>

                    {/* Atuação Adequada */}
                    <td className="py-3 px-4 text-center border-r border-slate-200">
                      <span className="font-bold text-blue-700">
                        {row['Atuação Adequada'].count}
                      </span>
                      <span className="text-xs text-slate-500 ml-1.5">({row['Atuação Adequada'].pct}%)</span>
                    </td>

                    {/* Referência */}
                    <td className="py-3 px-4 text-center border-r border-slate-200">
                      <span className={`font-bold ${row['Referência'].count > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {row['Referência'].count}
                      </span>
                      <span className="text-xs text-slate-500 ml-1.5">({row['Referência'].pct}%)</span>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900 bg-slate-50/50">
                      {totalCycle}
                    </td>
                  </tr>
                );
              })}

              {/* Total Row */}
              <tr className="bg-slate-100/90 font-extrabold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3.5 px-4 uppercase tracking-wider text-xs">Total Geral ({unidade})</td>
                <td className="py-3.5 px-4 text-center text-rose-700 border-l border-r border-slate-200">
                  {totalRow['Inicial'].count} <span className="text-xs font-semibold">({totalRow['Inicial'].pct}%)</span>
                </td>
                <td className="py-3.5 px-4 text-center text-amber-700 border-r border-slate-200">
                  {totalRow['Em Desenvolvimento'].count} <span className="text-xs font-semibold">({totalRow['Em Desenvolvimento'].pct}%)</span>
                </td>
                <td className="py-3.5 px-4 text-center text-blue-800 border-r border-slate-200">
                  {totalRow['Atuação Adequada'].count} <span className="text-xs font-semibold">({totalRow['Atuação Adequada'].pct}%)</span>
                </td>
                <td className="py-3.5 px-4 text-center text-emerald-800 border-r border-slate-200">
                  {totalRow['Referência'].count} <span className="text-xs font-semibold">({totalRow['Referência'].pct}%)</span>
                </td>
                <td className="py-3.5 px-4 text-right bg-slate-200 text-slate-900">
                  {kpis.total_avaliados}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Stacked 100% Bar Chart */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">
            Composição Percentual por Nível de Desempenho em Cada Ciclo
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stackedBarData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" unit="%" domain={[0, 100]} stroke="#64748B" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#334155" fontSize={12} fontWeight={600} />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val}%`, name]}
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '15px' }} />
                <Bar dataKey="Inicial [I]" stackId="a" fill="#EF4444" />
                <Bar dataKey="Em Desenvolvimento [ED]" stackId="a" fill="#F59E0B" />
                <Bar dataKey="Atuação Adequada [AA]" stackId="a" fill="#3B82F6" />
                <Bar dataKey="Referência [REF]" stackId="a" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strategic Analysis Callout (Slide 9 Direct Answers) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-everest-navy flex items-center gap-1.5 mb-3">
            <Info className="w-4 h-4 text-everest-blue" />
            Perguntas Estratégicas para a Direção (Conforme Diretriz 2026 - Slide 9):
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <span className="font-semibold text-slate-900 block">Qual percentual da equipe apresenta desempenho consolidado?</span>
                <span className="text-slate-600 mt-0.5 block">
                  <strong className="text-blue-700 font-bold">{consolidadoPct}%</strong> da equipe encontra-se nos níveis de Atuação Adequada (AA) ou Referência (REF), atendendo plenamente aos padrões pedagógicos institucionais.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <span className="font-semibold text-slate-900 block">Quantos profissionais necessitam de acompanhamento mais próximo?</span>
                <span className="text-slate-600 mt-0.5 block">
                  <strong className="text-amber-700 font-bold">{atencaoCount} profissionais ({(((atencaoCount) / kpis.total_avaliados) * 100).toFixed(1)}%)</strong> necessitam de PDI (Plano de Desenvolvimento Individual) ou tutoria pedagógica mais presente.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <span className="font-semibold text-slate-900 block">Qual é o percentual de profissionais que se destacam como referência?</span>
                <span className="text-slate-600 mt-0.5 block">
                  <strong className="text-emerald-700 font-bold">{totalRow['Referência'].count} profissionais ({totalRow['Referência'].pct}%)</strong> atingiram nível de excelência máxima (≥ 3.60), aptos a atuar como mentores ou líderes de formação.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200/60 shadow-2xs">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0">4</span>
              <div>
                <span className="font-semibold text-slate-900 block">Onde estão concentradas as maiores necessidades de desenvolvimento?</span>
                <span className="text-slate-600 mt-0.5 block">
                  Identificado maior volume de desenvolvimento nos quesitos de <em>Instrução Diferenciada</em> e <em>Portfólio Individual</em> no âmbito de <strong>Compromisso com a Aprendizagem</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. Visão Geral por Grupo Avaliado (Slides 4, 5, 6, 7) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-everest-blue" />
            Visão Geral por Grupo Avaliado (Médias dos 5 Âmbitos)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Resultados médios obtidos por Coordenadores, Psicólogos, Supervisão de Inglês e Docentes nos 5 âmbitos da rubrica
          </p>
        </div>

        {/* Ambitos Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {metadata.ambitos.map((amb, idx) => {
            const score = ambitos_gerais[amb] || 0;
            return (
              <div key={amb} className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Âmbito {idx + 1}
                  </span>
                  <div className="text-xs font-semibold text-slate-800 line-clamp-2 leading-tight">
                    {amb}
                  </div>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-everest-navy">{score.toFixed(2)}</span>
                  <span className="text-[10px] font-medium text-slate-500">/ 4.00</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Groups Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          {/* Docentes */}
          <div className="bg-blue-50/40 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Docentes</span>
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                {cargos_resumo['Docentes']?.total || 0} avaliados
              </span>
            </div>
            <div className="text-3xl font-extrabold text-blue-900 mb-4">
              {cargos_resumo['Docentes']?.media_geral.toFixed(2)} <span className="text-xs text-blue-600 font-normal">/ 4.00</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              {metadata.ambitos.map(amb => (
                <div key={amb} className="flex justify-between py-1 border-b border-blue-100/50">
                  <span className="truncate pr-2">{amb}</span>
                  <span className="font-semibold text-slate-900">{cargos_resumo['Docentes']?.ambitos[amb]?.toFixed(2) || '0.00'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coordenação */}
          <div className="bg-amber-50/40 rounded-xl p-5 border border-amber-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Coordenação / Direção</span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                {cargos_resumo['Coordenação / Direção']?.total || 0} avaliado(s)
              </span>
            </div>
            <div className="text-3xl font-extrabold text-amber-900 mb-4">
              {cargos_resumo['Coordenação / Direção']?.media_geral > 0
                ? `${cargos_resumo['Coordenação / Direção']?.media_geral.toFixed(2)} / 4.00`
                : <span className="text-sm font-medium text-slate-500">Sem avaliados diretos</span>}
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              {cargos_resumo['Coordenação / Direção']?.total > 0 ? (
                metadata.ambitos.map(amb => (
                  <div key={amb} className="flex justify-between py-1 border-b border-amber-100/50">
                    <span className="truncate pr-2">{amb}</span>
                    <span className="font-semibold text-slate-900">{cargos_resumo['Coordenação / Direção']?.ambitos[amb]?.toFixed(2) || '-'}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 py-6 text-center italic">
                  Avaliados de Coordenação e Direção consolidados na Unidade de Curitiba.
                </div>
              )}
            </div>
          </div>

          {/* Psicólogos */}
          <div className="bg-emerald-50/40 rounded-xl p-5 border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Psicólogos</span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {cargos_resumo['Psicólogos']?.total || 0} avaliado(s)
              </span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-900 mb-4">
              {cargos_resumo['Psicólogos']?.media_geral > 0
                ? `${cargos_resumo['Psicólogos']?.media_geral.toFixed(2)} / 4.00`
                : <span className="text-sm font-medium text-slate-500">Sem avaliados diretos</span>}
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              {cargos_resumo['Psicólogos']?.total > 0 ? (
                metadata.ambitos.map(amb => (
                  <div key={amb} className="flex justify-between py-1 border-b border-emerald-100/50">
                    <span className="truncate pr-2">{amb}</span>
                    <span className="font-semibold text-slate-900">{cargos_resumo['Psicólogos']?.ambitos[amb]?.toFixed(2) || '-'}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 py-6 text-center italic">
                  Avaliados de Psicologia presentes na Unidade Rio de Janeiro (equipe transversal).
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 6. Rankings Gerais: Top 5 e Bottom 5 (Misturados, sem separar por âmbito - Conforme Slides 4 a 7 de 2026) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top 5 Indicators */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                TOP 5 Indicadores Gerais (Pontos Fortes)
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Misturados
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Quesitos com maiores médias de avaliação geral na unidade selecionada
            </p>

            <div className="space-y-3">
              {rankings_gerais.top5.map((q, idx) => (
                <div key={q.id} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-100/70 text-blue-800">
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

        {/* Bottom 5 Indicators */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-500" />
                BOTTOM 5 Indicadores Gerais (Oportunidades de Melhoria)
              </h3>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                Misturados
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Quesitos com menores médias de avaliação geral com maior prioridade de capacitação
            </p>

            <div className="space-y-3">
              {rankings_gerais.bottom5.map((q, idx) => (
                <div key={q.id} className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-100/70 text-amber-800">
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
