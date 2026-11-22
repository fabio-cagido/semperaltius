'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  DashboardData,
  UnidadeScope,
  PerformanceLevel,
  AmbitoPorAvaliador,
  IndicadorIndividual
} from '@/types/dashboard';
import {
  Search,
  Printer,
  Files,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Loader2
} from 'lucide-react';

interface RelatoriosIndividuaisViewProps {
  data: DashboardData;
  unidade: UnidadeScope;
}

export interface UnifiedColaborador {
  id: string;
  nome: string;
  email: string;
  unidade: 'Curitiba' | 'Rio de Janeiro';
  segmento: string;
  segmentos_list: string[];
  cargo: string;
  grupo: 'Docentes' | 'Gestão & Especialistas';
  lider: string;
  nota_final: number | null;
  nivel: PerformanceLevel | null;
  autoavaliacao: number | null;
  do_lider: number | null;
  pares_psicologos: number | null;
  alunos: number | null;
  ambitos_order: string[];
  ambitos_por_avaliador: Record<string, AmbitoPorAvaliador>;
  indicadores: IndicadorIndividual[];
}

function getInstitutionalMessage(nivel: PerformanceLevel | null, grupo: string) {
  const saudacao = grupo === 'Docentes' ? 'Prezado(a) professor(a),' : 'Prezado(a) educador(a) e gestor(a),';
  const intro =
    'Agradecemos a sua participação e dedicação no processo de Avaliação Institucional 360º (Ciclo 2026). Este relatório tem o objetivo de apresentar os resultados consolidados da sua avaliação e servir de base construtiva para o seu desenvolvimento profissional e Plano de Desenvolvimento Individual (PDI).';

  switch (nivel) {
    case 'Referência':
      return {
        saudacao,
        intro,
        tituloConceito: 'Profissional Referência [REF]',
        mensagemConceito:
          'Sua atuação destaca-se como referência institucional na Rede Semper Altius, evidenciando excelência pedagógica, forte alinhamento ao Ideário e impacto inspirador junto à comunidade escolar.',
        badgeBg: 'bg-emerald-50 border-emerald-300 text-emerald-900',
        accentColor: '#10B981'
      };
    case 'Atuação Adequada':
      return {
        saudacao,
        intro,
        tituloConceito: 'Atuação Adequada [AA]',
        mensagemConceito:
          'Seu desempenho reflete solidez, compromisso e consistência nas práticas pedagógicas e institucionais do Colégio Everest, atendendo plenamente às expectativas do cargo com ótimas oportunidades de consolidação rumo ao nível Referência.',
        badgeBg: 'bg-blue-50 border-blue-300 text-blue-900',
        accentColor: '#3B82F6'
      };
    case 'Em Desenvolvimento':
      return {
        saudacao,
        intro,
        tituloConceito: 'Em Desenvolvimento [ED]',
        mensagemConceito:
          'Sua trajetória demonstra potencial e engajamento, apresentando dimensões já consolidadas e pontos específicos de atenção que serão acompanhados de forma próxima e acolhedora no seu Plano de Desenvolvimento Individual (PDI).',
        badgeBg: 'bg-amber-50 border-amber-300 text-amber-900',
        accentColor: '#F59E0B'
      };
    default:
      return {
        saudacao,
        intro,
        tituloConceito: 'Nível Inicial [I]',
        mensagemConceito:
          'Este ciclo marca o ponto de partida para o fortalecimento prioritário das práticas avaliadas. A coordenação pedagógica construirá junto com você um roteiro estruturado de acompanhamento e suporte formativo.',
        badgeBg: 'bg-rose-50 border-rose-300 text-rose-900',
        accentColor: '#EF4444'
      };
  }
}

/**
 * Pure SVG Vertical Bar Chart replicating the exact visual style of
 * AVALIAÇÃO_DOCENTE_RESULTADOS_CTBA_2024.pdf (Máxima 4.00 in red #B91C1C vs Nota in slate/blue #94A3B8)
 */
function AmbitoBarChartCard({
  ambito,
  nota,
  maxima = 4.0,
  nomeColaborador
}: {
  ambito: string;
  nota: number | null;
  maxima?: number;
  nomeColaborador: string;
}) {
  const safeNota = nota !== null && nota > 0 ? nota : 0;
  const chartHeight = 140;
  const maxBarHeight = 110;
  const maxH = maxBarHeight;
  const notaH = Math.max(2, Math.min(maxBarHeight, (safeNota / maxima) * maxBarHeight));

  const formatComma = (v: number) => v.toFixed(2).replace('.', ',');
  const shortName =
    nomeColaborador.split(' ').length > 2
      ? `${nomeColaborador.split(' ')[0]} ${nomeColaborador.split(' ').slice(-1)[0]}`
      : nomeColaborador;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between break-inside-avoid">
      {/* Title with institutional dark red underline like the PDF */}
      <div className="text-center mb-2">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 leading-snug min-h-[34px] py-0.5 flex items-center justify-center">
          {ambito}
        </div>
        <div className="h-[2.5px] w-4/5 mx-auto bg-[#7F1D1D] mt-1.5 rounded-full" />
      </div>

      {/* Legend: Máxima vs Nota */}
      <div className="flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-600 mb-1.5">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-2.5 inline-block rounded-2xs" style={{ backgroundColor: '#B91C1C' }} />
          Máxima
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-2.5 inline-block rounded-2xs" style={{ backgroundColor: '#94A3B8' }} />
          Nota
        </span>
      </div>

      {/* SVG Vertical Bars */}
      <div className="w-full flex justify-center overflow-hidden">
        <svg viewBox="0 0 220 175" className="w-full max-w-[210px] h-auto">
          {/* Y-axis grid lines & labels (0, 1, 2, 3, 4) */}
          {[0, 1, 2, 3, 4].map((tick) => {
            const y = 140 - (tick / 4) * maxBarHeight;
            return (
              <g key={tick}>
                <line
                  x1="34"
                  y1={y}
                  x2="186"
                  y2={y}
                  stroke={tick === 0 ? '#0F172A' : '#E2E8F0'}
                  strokeWidth={tick === 0 ? '1.5' : '1'}
                />
                <text
                  x="26"
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#475569"
                >
                  {tick}
                </text>
                <text
                  x="194"
                  y={y + 3.5}
                  textAnchor="start"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#94A3B8"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Bar 1: Máxima (4.00) in #B91C1C */}
          <rect
            x="52"
            y={chartHeight - maxH}
            width="54"
            height={maxH}
            fill="#B91C1C"
            rx="2"
          />
          <text
            x="79"
            y={chartHeight - maxH + 14}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#FFFFFF"
          >
            4,00
          </text>

          {/* Bar 2: Nota do Colaborador in #94A3B8 with dark navy top label */}
          <rect
            x="108"
            y={chartHeight - notaH}
            width="54"
            height={notaH}
            fill="#94A3B8"
            rx="2"
          />
          {safeNota > 0 ? (
            <text
              x="135"
              y={notaH >= 24 ? chartHeight - notaH + 14 : chartHeight - notaH - 5}
              textAnchor="middle"
              fontSize="10.5"
              fontWeight="800"
              fill="#1E293B"
            >
              {formatComma(safeNota)}
            </text>
          ) : (
            <text
              x="135"
              y={chartHeight - 8}
              textAnchor="middle"
              fontSize="9.5"
              fontWeight="600"
              fill="#64748B"
            >
              N/A
            </text>
          )}

          {/* X-axis collaborator name */}
          <text
            x="110"
            y="158"
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#1E293B"
          >
            {shortName}
          </text>
        </svg>
      </div>
    </div>
  );
}

/**
 * Pure SVG Multi-Series Radar Chart for 3 to 5 vertices (Âmbitos).
 * Works deterministically both on screen and in multi-page batch PDF print.
 */
interface RadarSeriesConfig {
  key: 'lider' | 'autoavaliacao' | 'pares_psicologos' | 'alunos';
  label: string;
  color: string;
  fillOpacity: number;
  strokeDasharray?: string;
}

function SvgRadarChart({
  ambitos,
  ambitosData,
  series
}: {
  ambitos: string[];
  ambitosData: Record<string, AmbitoPorAvaliador>;
  series: RadarSeriesConfig[];
}) {
  const width = 400;
  const height = 310;
  const cx = width / 2;
  const cy = height / 2;
  const radius = 92;
  const n = Math.max(3, ambitos.length);

  const getAngle = (idx: number) => -Math.PI / 2 + (2 * Math.PI * idx) / n;

  const getPoint = (idx: number, val: number) => {
    const r = (Math.max(0, Math.min(4, val)) / 4) * radius;
    const angle = getAngle(idx);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  const wrapLabel = (text: string): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const w of words) {
      if ((current + ' ' + w).trim().length > 18 && current.length > 0) {
        lines.push(current.trim());
        current = w;
      } else {
        current = (current + ' ' + w).trim();
      }
    }
    if (current) lines.push(current.trim());
    return lines.slice(0, 3);
  };

  return (
    <div className="flex flex-col items-center overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[360px] h-auto">
        {/* Concentric Polygons for levels 1.0, 2.0, 3.0, 4.0 */}
        {[1, 2, 3, 4].map((lvl) => {
          const pts = ambitos
            .map((_, i) => {
              const p = getPoint(i, lvl);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(' ');
          return (
            <g key={lvl}>
              <polygon
                points={pts}
                fill={lvl === 4 ? '#F8FAFC' : 'none'}
                stroke="#CBD5E1"
                strokeWidth={lvl === 4 ? '1.3' : '0.9'}
                strokeDasharray={lvl < 4 ? '3 3' : undefined}
              />
              <text
                x={cx + 4}
                y={cy - (lvl / 4) * radius + 3}
                fontSize="8.5"
                fontWeight="700"
                fill="#64748B"
              >
                {lvl}.0
              </text>
            </g>
          );
        })}

        {/* Axis Spokes and Vertex Labels */}
        {ambitos.map((amb, i) => {
          const outer = getPoint(i, 4);
          const angle = getAngle(i);
          const labelR = radius + 28;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle);
          const cosA = Math.cos(angle);
          const anchor = cosA > 0.25 ? 'start' : cosA < -0.25 ? 'end' : 'middle';
          const lines = wrapLabel(amb);

          return (
            <g key={amb}>
              <line
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="#CBD5E1"
                strokeWidth="1"
              />
              <text
                x={lx}
                y={ly - ((lines.length - 1) * 5)}
                textAnchor={anchor}
                fontSize="9"
                fontWeight="700"
                fill="#0F172A"
              >
                {lines.map((line, lIdx) => (
                  <tspan key={lIdx} x={lx} dy={lIdx === 0 ? 0 : 11}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* Series Polygons & Data Dots */}
        {series.map((s) => {
          const validCoords = ambitos.map((amb, i) => {
            const rawVal = ambitosData[amb]?.[s.key];
            const val = rawVal !== null && rawVal !== undefined ? rawVal : 0;
            return { pt: getPoint(i, val), rawVal };
          });

          const hasAnyValid = validCoords.some((c) => c.rawVal !== null && c.rawVal !== undefined && c.rawVal > 0);
          if (!hasAnyValid) return null;

          const polygonPoints = validCoords
            .map((c) => `${c.pt.x.toFixed(1)},${c.pt.y.toFixed(1)}`)
            .join(' ');

          return (
            <g key={s.key}>
              <polygon
                points={polygonPoints}
                fill={s.color}
                fillOpacity={s.fillOpacity}
                stroke={s.color}
                strokeWidth="2.2"
                strokeDasharray={s.strokeDasharray}
              />
              {validCoords.map((c, idx) =>
                c.rawVal !== null && c.rawVal !== undefined ? (
                  <circle
                    key={idx}
                    cx={c.pt.x}
                    cy={c.pt.y}
                    r="3.5"
                    fill={s.color}
                    stroke="#FFFFFF"
                    strokeWidth="1.2"
                  />
                ) : null
              )}
            </g>
          );
        })}
      </svg>

      {/* Series Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-1 text-[11px] font-semibold text-slate-700">
        {series.map((s) => (
          <div key={s.key} className="inline-flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full inline-block border border-white shadow-2xs"
              style={{ backgroundColor: s.color }}
            />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Single Collaborator Report Sheet (used both for Individual view and Batch Print loop)
 */
function RelatorioIndividualSheet({
  colab,
  isBatchItem = false,
  isLastBatchItem = false
}: {
  colab: UnifiedColaborador;
  isBatchItem?: boolean;
  isLastBatchItem?: boolean;
}) {
  const [isTableExpanded, setIsTableExpanded] = useState(true);

  const msg = getInstitutionalMessage(colab.nivel, colab.grupo);

  // Check if collaborator has Alunos evaluation (e.g. EFII / EM Docentes)
  const hasAlunos = useMemo(() => {
    if (colab.alunos !== null && colab.alunos > 0) return true;
    return Object.values(colab.ambitos_por_avaliador).some(
      (a) => a.alunos !== null && a.alunos !== undefined && a.alunos > 0
    );
  }, [colab]);

  // Check if collaborator has Pares/Psicólogos evaluation
  const hasPares = useMemo(() => {
    if (colab.pares_psicologos !== null && colab.pares_psicologos > 0) return true;
    return Object.values(colab.ambitos_por_avaliador).some(
      (a) => a.pares_psicologos !== null && a.pares_psicologos !== undefined && a.pares_psicologos > 0
    );
  }, [colab]);

  // Top 5 and Bottom 5 indicators sorted by consolidated media
  const { top5, bottom5 } = useMemo(() => {
    const valid = colab.indicadores.filter((ind) => ind.media !== null && ind.media > 0);
    const desc = [...valid].sort((a, b) => (b.media ?? 0) - (a.media ?? 0));
    const asc = [...valid].sort((a, b) => (a.media ?? 0) - (b.media ?? 0));
    return {
      top5: desc.slice(0, 5),
      bottom5: asc.slice(0, 5)
    };
  }, [colab.indicadores]);

  // Radar 1 Series: Todos os Avaliadores (Líder, Autoavaliação, Outros/Psicólogos e Pares, Alunos when applicable)
  const radar1Series = useMemo<RadarSeriesConfig[]>(() => {
    const list: RadarSeriesConfig[] = [
      { key: 'lider', label: 'Líder', color: '#1E56A0', fillOpacity: 0.18 },
      { key: 'autoavaliacao', label: 'Autoavaliação', color: '#F59E0B', fillOpacity: 0.16 }
    ];
    if (hasPares) {
      list.push({
        key: 'pares_psicologos',
        label: 'Outros (Psicólogos e Pares)',
        color: '#10B981',
        fillOpacity: 0.16
      });
    }
    if (hasAlunos) {
      list.push({
        key: 'alunos',
        label: 'Alunos',
        color: '#8B5CF6',
        fillOpacity: 0.18
      });
    }
    return list;
  }, [hasPares, hasAlunos]);

  // Radar 2 Series: Alinhamento Líder vs. Autoavaliação
  const radar2Series: RadarSeriesConfig[] = [
    { key: 'lider', label: 'Líder', color: '#B91C1C', fillOpacity: 0.22 },
    { key: 'autoavaliacao', label: 'Autoavaliação', color: '#1E56A0', fillOpacity: 0.20, strokeDasharray: '4 2' }
  ];

  const cortesList = [
    {
      nivel: 'Inicial' as PerformanceLevel,
      faixa: '< 2.50',
      label: 'Inicial [I]',
      desc: 'Necessita acompanhamento prioritário',
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      dot: 'bg-rose-500'
    },
    {
      nivel: 'Em Desenvolvimento' as PerformanceLevel,
      faixa: '2.50 – 2.99',
      label: 'Em Desenvolvimento [ED]',
      desc: 'Atende parcialmente • Foco em PDI',
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      dot: 'bg-amber-500'
    },
    {
      nivel: 'Atuação Adequada' as PerformanceLevel,
      faixa: '3.00 – 3.59',
      label: 'Atuação Adequada [AA]',
      desc: 'Desempenho sólido e consistente',
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      dot: 'bg-blue-600'
    },
    {
      nivel: 'Referência' as PerformanceLevel,
      faixa: '≥ 3.60',
      label: 'Referência [REF]',
      desc: 'Excelência e modelo institucional',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      dot: 'bg-emerald-500'
    }
  ];

  return (
    <article
      data-report-sheet={colab.id}
      className={`print-report-sheet bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6 print:shadow-none print:border-0 print:p-0 print:rounded-none print:w-full print:max-w-full print:overflow-hidden ${
        isBatchItem && !isLastBatchItem ? 'break-after-page mb-10 print:mb-0' : ''
      }`}
    >
      {/* BLOCO PÁGINA 1 DO PDF: CABEÇALHO + SEÇÕES 1, 2 E 3 */}
      <div data-pdf-page="1" className="space-y-6 bg-white">
      {/* CABEÇALHO INSTITUCIONAL (Inspirado no PDF AVALIAÇÃO_DOCENTE_RESULTADOS_CTBA_2024.pdf) */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 break-inside-avoid">
        {/* Top Crimson/Burgundy Institutional Banner */}
        <div
          className="px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{
            background: 'linear-gradient(90deg, #881337 0%, #991B1B 45%, #7F1D1D 100%)'
          }}
        >
          <div className="flex items-center gap-4">
            <img
              src="/logo-everest.jpeg"
              alt="Logo Colégio Everest"
              className="w-14 h-14 rounded-full object-cover bg-white p-0.5 border-2 border-white/80 shadow-md shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/15 text-rose-100">
                  Rede de Colégios Semper Altius
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 border border-amber-300/30">
                  Devolutiva Individual • 2026
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight uppercase mt-1">
                AVALIAÇÃO {colab.grupo === 'Docentes' ? 'DOCENTE' : 'DE GESTÃO & ESPECIALISTAS'} — Everest {colab.unidade}
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <div className="text-xs font-medium text-rose-200">Ciclo Avaliativo</div>
            <div className="text-xl font-black tracking-tight text-white">2026</div>
          </div>
        </div>

        {/* Dados do Avaliado & Carta de Acolhimento */}
        <div className="p-5 bg-slate-50/70 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Profissional Avaliado(a)
              </span>
              <span className="text-sm font-extrabold text-slate-900">{colab.nome}</span>
              <span className="text-[11px] text-slate-500 block truncate">{colab.email}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Unidade Escolar
              </span>
              <span className="text-sm font-bold text-slate-800">Colégio Everest {colab.unidade}</span>
              <span className="text-[11px] text-slate-500 block">Rede Semper Altius</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Ciclo / Área &amp; Cargo
              </span>
              <span className="text-sm font-bold text-slate-800">{colab.segmento}</span>
              <span className="text-[11px] text-slate-500 block">{colab.cargo}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Líder Avaliador(a)
              </span>
              <span className="text-sm font-bold text-slate-800">{colab.lider || 'Direção / Coordenação'}</span>
              <span className="text-[11px] text-slate-500 block">Avaliação 360º</span>
            </div>
          </div>

          <div className="text-xs text-slate-700 leading-relaxed bg-white/90 px-4 py-3 rounded-xl border border-slate-200/70">
            <p className="font-bold text-slate-900">{msg.saudacao}</p>
            <p className="mt-0.5">{msg.intro}</p>
          </div>
        </div>
      </div>

      {/* SEÇÃO 1: RESULTADO GERAL — CONCEITO E LEGENDA */}
      <section className="space-y-4 break-inside-avoid">
        <div className="flex items-center gap-2">
          <div
            className="px-3.5 py-1.5 rounded-lg text-white font-extrabold text-xs uppercase tracking-wider shadow-xs"
            style={{ background: 'linear-gradient(90deg, #991B1B 0%, #B91C1C 100%)' }}
          >
            1. Resultado Geral
          </div>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Card Principal de Pontuação e Conceito */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-slate-200/80 text-slate-800 font-extrabold text-xs uppercase tracking-wider">
                  PONTUAÇÃO FINAL:
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-[#B91C1C]">
                    {colab.nota_final !== null ? colab.nota_final.toFixed(2).replace('.', ',') : '-'}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/ 4,00</span>
                </div>
              </div>

              <div className={`px-3.5 py-2 rounded-xl border font-extrabold text-xs sm:text-sm ${msg.badgeBg}`}>
                <span className="text-[10px] font-semibold uppercase tracking-wider block opacity-75">
                  Você foi avaliado(a) como
                </span>
                {msg.tituloConceito}
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">{msg.mensagemConceito}</p>

            {/* Síntese rápida das médias por perfil avaliador */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Líder</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {colab.do_lider !== null ? colab.do_lider.toFixed(2).replace('.', ',') : 'N/A'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Autoavaliação</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {colab.autoavaliacao !== null ? colab.autoavaliacao.toFixed(2).replace('.', ',') : 'N/A'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Psicólogos / Pares</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {colab.pares_psicologos !== null ? colab.pares_psicologos.toFixed(2).replace('.', ',') : 'N/A'}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Alunos</span>
                <span className="text-sm font-extrabold text-purple-800">
                  {hasAlunos && colab.alunos !== null ? colab.alunos.toFixed(2).replace('.', ',') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Legenda Visual das 4 Faixas de Corte */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#B91C1C]" />
              Legenda Institucional — Faixas de Corte (Escala 1 a 4)
            </div>
            <div className="space-y-2">
              {cortesList.map((c) => {
                const isCurrent = colab.nivel === c.nivel;
                return (
                  <div
                    key={c.nivel}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      c.bg
                    } ${isCurrent ? 'ring-2 ring-slate-900 font-bold shadow-xs' : 'opacity-85'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${c.dot}`} />
                      <div>
                        <div className="font-extrabold leading-snug">
                          <span>{c.label}</span>
                          {isCurrent && (
                            <span className="ml-2 inline-block text-[9px] uppercase px-1.5 py-0.5 bg-slate-900 text-white rounded leading-none align-middle">
                              Seu Nível
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] opacity-80 mt-0.5">{c.desc}</div>
                      </div>
                    </div>
                    <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-white/70 border border-black/5 shrink-0">
                      {c.faixa}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: RESULTADO GERAL POR ÂMBITO — MÉDIA VS. NOTA MÁXIMA (BARRAS) */}
      <section className="space-y-4 break-inside-avoid">
        <div className="flex items-center gap-2">
          <div
            className="px-3.5 py-1.5 rounded-lg text-white font-extrabold text-xs uppercase tracking-wider shadow-xs"
            style={{ background: 'linear-gradient(90deg, #991B1B 0%, #B91C1C 100%)' }}
          >
            2. Resultado por Âmbito (Média vs. Nota Máxima)
          </div>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            colab.ambitos_order.length === 3
              ? 'lg:grid-cols-3 print:grid-cols-3'
              : colab.ambitos_order.length === 4
              ? 'lg:grid-cols-4 print:grid-cols-4'
              : 'lg:grid-cols-5 print:grid-cols-5'
          } gap-3.5 print:gap-2`}
        >
          {colab.ambitos_order.map((amb) => {
            const notaGeralAmbito = colab.ambitos_por_avaliador[amb]?.geral ?? null;
            return (
              <AmbitoBarChartCard
                key={amb}
                ambito={amb}
                nota={notaGeralAmbito}
                maxima={4.0}
                nomeColaborador={colab.nome}
              />
            );
          })}
        </div>
      </section>

      {/* SEÇÃO 3: TABELA COMPARATIVA: TOP 5 MAIS BEM AVALIADOS VS. BOTTOM 5 MENOS BEM AVALIADOS */}
      <section className="space-y-4 break-inside-avoid">
        <div className="flex items-center gap-2">
          <div
            className="px-3.5 py-1.5 rounded-lg text-white font-extrabold text-xs uppercase tracking-wider shadow-xs"
            style={{ background: 'linear-gradient(90deg, #991B1B 0%, #B91C1C 100%)' }}
          >
            3. Destaques: Top 5 Mais Bem Avaliados vs. Bottom 5 Pontos de Atenção
          </div>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-4 print:w-full print:max-w-full">
          {/* Top 5 */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 overflow-hidden print:w-full print:max-w-full">
            <div className="bg-emerald-700 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-200" />
                Top 5 Indicadores Mais Bem Avaliados
              </div>
              <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded font-semibold">
                Fortalezas Consolidadas
              </span>
            </div>
            <table className="w-full print:w-full print:max-w-full divide-y divide-emerald-100 text-xs">
              <thead className="bg-emerald-50/80 text-emerald-950 font-bold">
                <tr>
                  <th className="py-2 px-3 text-left">Âmbito</th>
                  <th className="py-2 px-3 text-left">Indicador / Quesito</th>
                  <th className="py-2 px-3 text-center w-16">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/70 bg-white">
                {top5.map((item) => (
                  <tr key={item.codigo}>
                    <td className="py-2 px-3 text-[11px] text-slate-600 font-medium">{item.ambito}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      <span className="text-[10px] font-mono text-slate-400 mr-1.5">{item.codigo}</span>
                      {item.enunciado}
                    </td>
                    <td className="py-2 px-3 text-center font-black text-emerald-700 bg-emerald-50/50">
                      {item.media?.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom 5 */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/30 overflow-hidden print:w-full print:max-w-full">
            <div className="bg-amber-700 text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider">
                <TrendingDown className="w-4 h-4 text-amber-200" />
                Bottom 5 Indicadores Menos Bem Avaliados
              </div>
              <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded font-semibold">
                Oportunidades para PDI
              </span>
            </div>
            <table className="w-full print:w-full print:max-w-full divide-y divide-amber-100 text-xs">
              <thead className="bg-amber-50/80 text-amber-950 font-bold">
                <tr>
                  <th className="py-2 px-3 text-left">Âmbito</th>
                  <th className="py-2 px-3 text-left">Indicador / Quesito</th>
                  <th className="py-2 px-3 text-center w-16">Nota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/70 bg-white">
                {bottom5.map((item) => (
                  <tr key={item.codigo}>
                    <td className="py-2 px-3 text-[11px] text-slate-600 font-medium">{item.ambito}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">
                      <span className="text-[10px] font-mono text-slate-400 mr-1.5">{item.codigo}</span>
                      {item.enunciado}
                    </td>
                    <td className="py-2 px-3 text-center font-black text-amber-800 bg-amber-50/50">
                      {item.media?.toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Rodapé Página 1 (visível apenas na exportação PDF) */}
      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
        <span>Rede de Colégios Semper Altius • Colégio Everest {colab.unidade} • Avaliação 360º (2026)</span>
        <span className="font-semibold text-slate-500">{colab.nome} — Página 1 / 2</span>
      </div>
      </div>

      {/* BLOCO PÁGINA 2 DO PDF: SEÇÕES 4 E 5 (GRÁFICOS ARANHA) + RODAPÉ INSTITUCIONAL */}
      <div data-pdf-page="2" className="space-y-6 bg-white pt-2 print-break">
        {/* Mini-cabeçalho institucional para a Página 2 */}
        <div
          className="rounded-xl px-5 py-3 text-white flex items-center justify-between gap-4"
          style={{
            background: 'linear-gradient(90deg, #881337 0%, #991B1B 45%, #7F1D1D 100%)'
          }}
        >
          <div className="flex items-center gap-3">
            <img
              src="/logo-everest.jpeg"
              alt="Logo Colégio Everest"
              className="w-9 h-9 rounded-full object-cover bg-white p-0.5 border border-white/80 shrink-0"
            />
            <div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-rose-200">
                Rede Semper Altius • Colégio Everest {colab.unidade} • Devolutiva 2026
              </div>
              <div className="text-sm font-extrabold tracking-tight text-white">
                {colab.nome} — <span className="font-normal text-rose-100">{colab.cargo} ({colab.segmento})</span>
              </div>
            </div>
          </div>
          <div className="text-right text-[10px] font-bold uppercase tracking-wider text-rose-200 shrink-0">
            Análise 360º &amp; Alinhamento • Página 2 / 2
          </div>
        </div>

      {/* SEÇÕES 4 E 5: GRÁFICOS ARANHA LADO A LADO (RADAR 1: TODOS OS AVALIADORES | RADAR 2: LÍDER VS. AUTOAVALIAÇÃO) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-2 gap-5 print:gap-3 break-inside-avoid">
        {/* Seção 4: Gráfico Aranha 1 — Comparação entre Todos os Avaliadores (por Âmbito) */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="px-2.5 py-1 rounded-md bg-everest-navy text-white font-extrabold text-[11px] uppercase tracking-wider">
                4. Gráfico Aranha 1 — Visão 360º Completa
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                {hasAlunos ? 'Inclui Eixo Alunos' : 'Sem Eixo Alunos (N/A ao ciclo/cargo)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Comparação das médias por Âmbito entre todos os perfis avaliadores aplicáveis ao colaborador.
            </p>
          </div>

          <SvgRadarChart
            ambitos={colab.ambitos_order}
            ambitosData={colab.ambitos_por_avaliador}
            series={radar1Series}
          />

          {/* Mini-tabela de apoio do Radar 1 */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden print:w-full print:max-w-full">
            <table className="w-full print:w-full print:max-w-full divide-y divide-slate-200 text-[11px]">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-1.5 px-2.5 text-left">Âmbito</th>
                  <th className="py-1.5 px-2 text-center text-[#1E56A0]">Líder</th>
                  <th className="py-1.5 px-2 text-center text-amber-600">Auto</th>
                  {hasPares && <th className="py-1.5 px-2 text-center text-emerald-700">Outros/Pares</th>}
                  {hasAlunos && <th className="py-1.5 px-2 text-center text-purple-700">Alunos</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {colab.ambitos_order.map((amb) => {
                  const row = colab.ambitos_por_avaliador[amb];
                  return (
                    <tr key={amb}>
                      <td className="py-1.5 px-2.5 font-semibold text-slate-800">{amb}</td>
                      <td className="py-1.5 px-2 text-center font-bold text-slate-800">
                        {row?.lider?.toFixed(2).replace('.', ',') ?? '-'}
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold text-slate-800">
                        {row?.autoavaliacao?.toFixed(2).replace('.', ',') ?? '-'}
                      </td>
                      {hasPares && (
                        <td className="py-1.5 px-2 text-center font-bold text-slate-800">
                          {row?.pares_psicologos?.toFixed(2).replace('.', ',') ?? '-'}
                        </td>
                      )}
                      {hasAlunos && (
                        <td className="py-1.5 px-2 text-center font-bold text-purple-800">
                          {row?.alunos?.toFixed(2).replace('.', ',') ?? '-'}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seção 5: Gráfico Aranha 2 — Alinhamento: Líder vs. Autoavaliação (por Âmbito) */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="px-2.5 py-1 rounded-md bg-[#991B1B] text-white font-extrabold text-[11px] uppercase tracking-wider">
                5. Gráfico Aranha 2 — Líder vs. Autoavaliação
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Ferramenta de Calibragem &amp; Feedback
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Análise exclusiva de alinhamento de percepção entre a Liderança Imediata e a Autoavaliação nos âmbitos.
            </p>
          </div>

          <SvgRadarChart
            ambitos={colab.ambitos_order}
            ambitosData={colab.ambitos_por_avaliador}
            series={radar2Series}
          />

          {/* Mini-tabela de alinhamento e Gap (Auto - Líder) */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden print:w-full print:max-w-full">
            <table className="w-full print:w-full print:max-w-full divide-y divide-slate-200 text-[11px]">
              <thead className="bg-slate-100 text-slate-700 font-bold">
                <tr>
                  <th className="py-1.5 px-2.5 text-left">Âmbito</th>
                  <th className="py-1.5 px-2 text-center text-[#B91C1C]">Líder</th>
                  <th className="py-1.5 px-2 text-center text-[#1E56A0]">Autoavaliação</th>
                  <th className="py-1.5 px-2 text-center">Gap (Auto − Líder)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {colab.ambitos_order.map((amb) => {
                  const row = colab.ambitos_por_avaliador[amb];
                  const lid = row?.lider ?? null;
                  const aut = row?.autoavaliacao ?? null;
                  const gap = lid !== null && aut !== null ? Number((aut - lid).toFixed(2)) : null;

                  return (
                    <tr key={amb}>
                      <td className="py-1.5 px-2.5 font-semibold text-slate-800">{amb}</td>
                      <td className="py-1.5 px-2 text-center font-bold text-[#B91C1C]">
                        {lid !== null ? lid.toFixed(2).replace('.', ',') : '-'}
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold text-[#1E56A0]">
                        {aut !== null ? aut.toFixed(2).replace('.', ',') : '-'}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono font-bold">
                        {gap !== null ? (
                          <span
                            className={
                              Math.abs(gap) <= 0.3
                                ? 'text-emerald-700'
                                : gap > 0.3
                                ? 'text-amber-700'
                                : 'text-blue-700'
                            }
                          >
                            {gap > 0 ? `+${gap.toFixed(2).replace('.', ',')}` : gap.toFixed(2).replace('.', ',')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Rodapé Institucional da Folha A4 (Fim da Página 2) */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2 break-inside-avoid">
        <div className="font-bold text-slate-700">
          Rede de Colégios Semper Altius • Colégio Everest {colab.unidade} • Avaliação 360º (Ciclo 2026)
        </div>
        <div className="italic">
          Acolher • Servir • Acompanhar — Documento confidencial para uso em Devolutiva e PDI (Página 2 / 2)
        </div>
      </div>
      </div>

      {/* SEÇÃO 6: PAINEL DETALHADO DE TODOS OS INDICADORES (SOMENTE NO DASHBOARD / OCULTO NA IMPRESSÃO PDF) */}
      <section data-html2canvas-ignore="true" className="no-print space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div
              className="px-3.5 py-1.5 rounded-lg text-white font-extrabold text-xs uppercase tracking-wider shadow-xs"
              style={{ background: 'linear-gradient(90deg, #0F294A 0%, #1E56A0 100%)' }}
            >
              6. Painel Detalhado de Todos os Indicadores ({colab.indicadores.length} Quesitos)
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              Exclusivo em Tela (Oculto no PDF)
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => setIsTableExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            {isTableExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Recolher Tabela
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Expandir Todos os Indicadores
              </>
            )}
          </button>
        </div>

        {isTableExpanded && (
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 text-left w-16">Cód.</th>
                  <th className="py-2.5 px-3 text-left">Âmbito</th>
                  <th className="py-2.5 px-3 text-left">Indicador / Quesito Avaliado</th>
                  <th className="py-2.5 px-2.5 text-center">Líder</th>
                  <th className="py-2.5 px-2.5 text-center">Autoavaliação</th>
                  <th className="py-2.5 px-2.5 text-center">Pares / Psicólogos</th>
                  {hasAlunos && <th className="py-2.5 px-2.5 text-center">Alunos</th>}
                  <th className="py-2.5 px-3 text-center bg-blue-50 text-blue-950">Média Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {colab.indicadores.map((ind) => (
                  <tr key={ind.codigo} className="hover:bg-slate-50/80">
                    <td className="py-2 px-3 font-mono font-bold text-slate-500 text-[11px]">{ind.codigo}</td>
                    <td className="py-2 px-3 text-slate-600 font-medium text-[11px]">{ind.ambito}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{ind.enunciado}</td>
                    <td className="py-2 px-2.5 text-center font-semibold text-slate-800">
                      {ind.lider !== null ? ind.lider.toFixed(2).replace('.', ',') : '-'}
                    </td>
                    <td className="py-2 px-2.5 text-center font-semibold text-slate-800">
                      {ind.autoavaliacao !== null ? ind.autoavaliacao.toFixed(2).replace('.', ',') : '-'}
                    </td>
                    <td className="py-2 px-2.5 text-center font-semibold text-slate-800">
                      {ind.pares_psicologos !== null ? ind.pares_psicologos.toFixed(2).replace('.', ',') : '-'}
                    </td>
                    {hasAlunos && (
                      <td className="py-2 px-2.5 text-center font-semibold text-purple-800">
                        {ind.alunos !== null ? ind.alunos.toFixed(2).replace('.', ',') : '-'}
                      </td>
                    )}
                    <td className="py-2 px-3 text-center font-black text-blue-900 bg-blue-50/40">
                      {ind.media !== null ? ind.media.toFixed(2).replace('.', ',') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </article>
  );
}

export default function RelatoriosIndividuaisView({ data, unidade }: RelatoriosIndividuaisViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [grupoCargoFilter, setGrupoCargoFilter] = useState('TODOS');
  const [cicloFilter, setCicloFilter] = useState('TODOS');
  const [selectedId, setSelectedId] = useState<string>('');
  const [batchPrintMode, setBatchPrintMode] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgressText, setPdfProgressText] = useState<string>('');

  // Build unified list of all collaborators (Docentes + Gestão & Especialistas)
  const allColaboradores = useMemo<UnifiedColaborador[]>(() => {
    const list: UnifiedColaborador[] = [];

    // 1. Docentes & Equipe in data.avaliados
    for (const av of data.avaliados) {
      const paresVal =
        av.dos_pares !== null && av.outros !== null
          ? Number(((av.dos_pares + av.outros) / 2).toFixed(2))
          : av.dos_pares ?? av.outros ?? null;

      list.push({
        id: `docente::${av.email || av.nome}`,
        nome: av.nome,
        email: av.email,
        unidade: av.unidade,
        segmento: av.segmento,
        segmentos_list: [av.segmento],
        cargo: av.cargo,
        grupo: 'Docentes',
        lider: av.lider_raw || 'Coordenação Pedagógica',
        nota_final: av.nota_final,
        nivel: av.nivel,
        autoavaliacao: av.autoavaliação,
        do_lider: av.do_líder,
        pares_psicologos: paresVal,
        alunos: av.dos_subordinados,
        ambitos_order: data.metadata.ambitos,
        ambitos_por_avaliador: av.ambitos_por_avaliador || {},
        indicadores: av.indicadores || []
      });
    }

    // 2. Gestão & Especialistas in data.gestao_especialistas
    if (data.gestao_especialistas) {
      const metaGestao = data.metadata.gestao_especialistas_meta;
      const pools: {
        key: keyof NonNullable<DashboardData['gestao_especialistas']>;
        ambitos: string[];
      }[] = [
        {
          key: 'coordenadores_ciclo',
          ambitos: metaGestao?.ambitos_coordenadores || []
        },
        {
          key: 'psicologos',
          ambitos: metaGestao?.ambitos_psicologos || []
        },
        {
          key: 'gestao_ingles',
          ambitos: metaGestao?.ambitos_gestao_ingles || []
        },
        {
          key: 'disciplinas_institucionais',
          ambitos: metaGestao?.ambitos_disciplinas_institucionais || []
        }
      ];

      for (const pool of pools) {
        const recs = data.gestao_especialistas[pool.key] || [];
        for (const rec of recs) {
          const paresCandidates = [rec.outros, rec.dos_pares, rec.dos_subordinados].filter(
            (v): v is number => v !== null && v !== undefined && v > 0
          );
          const paresAvg =
            paresCandidates.length > 0
              ? Number((paresCandidates.reduce((a, b) => a + b, 0) / paresCandidates.length).toFixed(2))
              : null;

          const ambitosOrder =
            pool.ambitos.length > 0 ? pool.ambitos : Object.keys(rec.topicos || {});

          list.push({
            id: `gestao::${pool.key}::${rec.email || rec.nome}`,
            nome: rec.nome,
            email: rec.email,
            unidade: rec.unidade,
            segmento: rec.segmento,
            segmentos_list: rec.segmentos_list || [rec.segmento],
            cargo: rec.cargo,
            grupo: 'Gestão & Especialistas',
            lider: rec.lider || 'Direção Escolar',
            nota_final: rec.nota_final,
            nivel: rec.nivel,
            autoavaliacao: rec.autoavaliacao,
            do_lider: rec.do_lider,
            pares_psicologos: paresAvg,
            alunos: null,
            ambitos_order: ambitosOrder,
            ambitos_por_avaliador: rec.ambitos_por_avaliador || {},
            indicadores: rec.indicadores || []
          });
        }
      }
    }

    return list.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [data]);

  // Distinct cargos for the filter dropdown
  const availableCargos = useMemo(() => {
    const s = new Set<string>();
    allColaboradores.forEach((c) => s.add(c.cargo));
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [allColaboradores]);

  // Filter collaborators respecting global Unit, Grupo/Cargo, Ciclo, and Search query
  const filteredColaboradores = useMemo(() => {
    return allColaboradores.filter((c) => {
      if (unidade !== 'Todas' && c.unidade !== unidade) return false;

      if (grupoCargoFilter !== 'TODOS') {
        if (grupoCargoFilter === 'GRUPO_DOCENTES' && c.grupo !== 'Docentes') return false;
        if (grupoCargoFilter === 'GRUPO_GESTAO' && c.grupo !== 'Gestão & Especialistas') return false;
        if (
          grupoCargoFilter !== 'GRUPO_DOCENTES' &&
          grupoCargoFilter !== 'GRUPO_GESTAO' &&
          c.cargo !== grupoCargoFilter
        ) {
          return false;
        }
      }

      if (cicloFilter !== 'TODOS') {
        const matchesCiclo =
          c.segmento === cicloFilter ||
          c.segmentos_list.includes(cicloFilter) ||
          (cicloFilter === 'Geral / Transversal' &&
            (c.segmento === 'Transversal' || c.segmento === 'Geral / Transversal'));
        if (!matchesCiclo) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = c.nome.toLowerCase().includes(q);
        const matchCargo = c.cargo.toLowerCase().includes(q);
        const matchLider = c.lider.toLowerCase().includes(q);
        if (!matchName && !matchCargo && !matchLider) return false;
      }

      return true;
    });
  }, [allColaboradores, unidade, grupoCargoFilter, cicloFilter, searchQuery]);

  // Keep selectedId valid whenever filteredColaboradores changes
  useEffect(() => {
    if (filteredColaboradores.length === 0) {
      setSelectedId('');
      return;
    }
    const exists = filteredColaboradores.some((c) => c.id === selectedId);
    if (!exists) {
      // Prefer Danilo Martins as initial default if present in filter, else first
      const danilo = filteredColaboradores.find((c) => c.nome === 'Danilo Martins');
      setSelectedId(danilo ? danilo.id : filteredColaboradores[0].id);
    }
  }, [filteredColaboradores, selectedId]);

  // Reset batchPrintMode automatically after browser print dialog closes
  useEffect(() => {
    const handleAfterPrint = () => {
      setBatchPrintMode(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const currentIndex = useMemo(() => {
    return filteredColaboradores.findIndex((c) => c.id === selectedId);
  }, [filteredColaboradores, selectedId]);

  const activeColaborador =
    currentIndex >= 0 ? filteredColaboradores[currentIndex] : filteredColaboradores[0] || null;

  /**
   * Captures a single report's two logical A4 pages (Page 1: Header + Sections 1-3,
   * Page 2: Mini-header + Sections 4-5 + Footer) at full 192mm width onto a strict
   * A4 Portrait jsPDF instance (210mm x 297mm, rotation = 0).
   */
  const captureElementToA4PortraitPdf = async (
    el: HTMLElement,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf: any,
    html2canvasFn: (element: HTMLElement, options?: Record<string, unknown>) => Promise<HTMLCanvasElement>,
    isFirstCollaborator: boolean
  ) => {
    const page1El = el.querySelector<HTMLElement>('[data-pdf-page="1"]');
    const page2El = el.querySelector<HTMLElement>('[data-pdf-page="2"]');
    const targets = page1El && page2El ? [page1El, page2El] : [el];

    const prevWidth = el.style.width;
    const prevMaxWidth = el.style.maxWidth;
    el.style.width = '1020px';
    el.style.maxWidth = '1020px';

    try {
      for (let pIdx = 0; pIdx < targets.length; pIdx++) {
        const targetEl = targets[pIdx];
        const canvas = await html2canvasFn(targetEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowWidth: 1100,
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (!(isFirstCollaborator && pIdx === 0)) {
          pdf.addPage('a4', 'portrait');
        }

        const pageW = 210;
        const pageH = 297;
        const marginX = 9;
        const marginY = 9;
        const usableW = pageW - marginX * 2; // 192mm full width
        const usableH = pageH - marginY * 2; // 279mm usable height

        const imgRatio = canvas.width / canvas.height;
        let renderW = usableW;
        let renderH = renderW / imgRatio;

        if (renderH > usableH) {
          renderH = usableH;
          renderW = renderH * imgRatio;
        }

        const offsetX = (pageW - renderW) / 2;
        const offsetY = marginY;

        pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderW, renderH, undefined, 'FAST');
      }
    } finally {
      el.style.width = prevWidth;
      el.style.maxWidth = prevMaxWidth;
    }
  };

  // Direct A4 Portrait PDF Download (Individual)
  const handleDownloadIndividualPdf = async () => {
    if (!activeColaborador || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfProgressText(`Gerando PDF A4 Vertical de ${activeColaborador.nome}...`);

    try {
      const [{ jsPDF }, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      const html2canvasFn = html2canvasModule.default;

      const el = document.querySelector<HTMLElement>(
        `article[data-report-sheet="${CSS.escape(activeColaborador.id)}"]`
      );
      if (!el) return;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      await captureElementToA4PortraitPdf(el, pdf, html2canvasFn, true);
      pdf.save(`${activeColaborador.nome} 2026.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF individual:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgressText('');
    }
  };

  // Direct A4 Portrait PDF Download (Batch - All Filtered Collaborators)
  const handleDownloadBatchPdf = async () => {
    if (filteredColaboradores.length === 0 || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setBatchPrintMode(true);
    setPdfProgressText(`Preparando ${filteredColaboradores.length} relatórios...`);

    try {
      // Wait for React to render all batch sheets in the DOM
      await new Promise((r) => setTimeout(r, 350));

      const [{ jsPDF }, html2canvasModule] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      const html2canvasFn = html2canvasModule.default;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      for (let i = 0; i < filteredColaboradores.length; i++) {
        const colab = filteredColaboradores[i];
        setPdfProgressText(
          `Gerando PDF (${i + 1} de ${filteredColaboradores.length}): ${colab.nome}...`
        );
        const el = document.querySelector<HTMLElement>(
          `article[data-report-sheet="${CSS.escape(colab.id)}"]`
        );
        if (el) {
          await captureElementToA4PortraitPdf(el, pdf, html2canvasFn, i === 0);
        }
      }

      const unitSlug = unidade.toLowerCase().replace(/\s+/g, '_');
      pdf.save(`Relatorios_Individuais_Everest_${unitSlug}_2026.pdf`);
    } catch (err) {
      console.error('Erro ao gerar PDF em lote:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgressText('');
      setBatchPrintMode(false);
    }
  };

  const handleNativeBrowserPrint = () => {
    setBatchPrintMode(false);
    setTimeout(() => {
      window.print();
    }, 80);
  };

  return (
    <div className="space-y-6 pb-16 print:space-y-0 print:pb-0">
      {/* BARRA DE CONTROLE NO TOPO (Oculta na impressão via no-print) */}
      <div className="no-print bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[#991B1B] text-[11px] font-bold uppercase tracking-wider mb-1">
              <FileText className="w-3.5 h-3.5" />
              Módulo de Devolutiva Individual &amp; Exportação A4
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Relatórios Individuais (Docentes, Gestão &amp; Especialistas)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Selecione um colaborador para conduzir a reunião de feedback/PDI ou gere o pacote completo em lote para impressão A4 multipágina.
            </p>
          </div>

          {/* Botões de Download PDF A4 Vertical Direto e Impressão */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadIndividualPdf}
              disabled={!activeColaborador || isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-everest-navy hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 text-amber-300 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-amber-300" />
              )}
              Imprimir / Salvar PDF Individual
            </button>

            <button
              type="button"
              onClick={handleDownloadBatchPdf}
              disabled={filteredColaboradores.length === 0 || isGeneratingPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 text-amber-200 animate-spin" />
              ) : (
                <Files className="w-4 h-4 text-amber-200" />
              )}
              Imprimir Todos em Lote ({filteredColaboradores.length} PDF)
            </button>

            <button
              type="button"
              onClick={handleNativeBrowserPrint}
              disabled={!activeColaborador || isGeneratingPdf}
              title="Abrir diálogo de impressora física do sistema"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Impressora
            </button>
          </div>
        </div>

        {isGeneratingPdf && pdfProgressText && (
          <div className="bg-blue-50 border border-blue-200 text-blue-950 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 text-everest-blue animate-spin shrink-0" />
            <span>{pdfProgressText}</span>
          </div>
        )}

        {/* Filtros e Seletor de Colaborador */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* Busca por nome */}
          <div className="lg:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              1. Buscar por Nome ou Líder
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome do avaliado..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-everest-blue"
              />
            </div>
          </div>

          {/* Filtro por Grupo / Cargo */}
          <div className="lg:col-span-3">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              2. Filtrar por Grupo / Cargo
            </label>
            <select
              value={grupoCargoFilter}
              onChange={(e) => setGrupoCargoFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-everest-blue"
            >
              <option value="TODOS">Todos os Colaboradores ({allColaboradores.length})</option>
              <option value="GRUPO_DOCENTES">Somente Quadro Docente</option>
              <option value="GRUPO_GESTAO">Somente Gestão &amp; Especialistas</option>
              <optgroup label="Por Cargo Específico">
                {availableCargos.map((cargo) => (
                  <option key={cargo} value={cargo}>
                    {cargo}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Filtro por Ciclo Escolar */}
          <div className="lg:col-span-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              3. Ciclo Escolar
            </label>
            <select
              value={cicloFilter}
              onChange={(e) => setCicloFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-everest-blue"
            >
              <option value="TODOS">Todos os Ciclos</option>
              <option value="EI">Educação Infantil (EI)</option>
              <option value="EFI">Ensino Fundamental I (EFI)</option>
              <option value="EFII">Ensino Fundamental II (EFII)</option>
              <option value="EM">Ensino Médio (EM)</option>
              <option value="Geral / Transversal">Geral / Transversal</option>
            </select>
          </div>

          {/* Seletor Direto do Colaborador + Navegação Anterior/Próximo */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                4. Colaborador Selecionado ({filteredColaboradores.length > 0 ? currentIndex + 1 : 0} de{' '}
                {filteredColaboradores.length})
              </label>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (currentIndex > 0) {
                    setSelectedId(filteredColaboradores[currentIndex - 1].id);
                  }
                }}
                disabled={currentIndex <= 0}
                title="Colaborador anterior"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="flex-1 py-2 px-3 bg-blue-50/60 border border-blue-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-everest-blue truncate"
              >
                {filteredColaboradores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} — {c.cargo} ({c.segmento} • {c.unidade}) [Nota:{' '}
                    {c.nota_final !== null ? c.nota_final.toFixed(2) : 'N/A'}]
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  if (currentIndex >= 0 && currentIndex < filteredColaboradores.length - 1) {
                    setSelectedId(filteredColaboradores[currentIndex + 1].id);
                  }
                }}
                disabled={currentIndex < 0 || currentIndex >= filteredColaboradores.length - 1}
                title="Próximo colaborador"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Aviso de Modo de Visualização em Lote */}
        {batchPrintMode && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-lg text-[11px] font-bold">
              <span>Modo de Impressão em Lote Ativo ({filteredColaboradores.length} relatórios renderizados)</span>
              <button
                type="button"
                onClick={() => setBatchPrintMode(false)}
                className="underline text-[#991B1B] ml-2"
              >
                Voltar à visão individual
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ÁREA DE RENDERIZAÇÃO DAS FOLHAS A4 */}
      {filteredColaboradores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <p className="text-base font-bold text-slate-700">
            Nenhum colaborador encontrado para os filtros selecionados.
          </p>
          <p className="text-xs text-slate-500">
            Ajuste os filtros de Unidade, Grupo/Cargo, Ciclo Escolar ou termo de busca acima.
          </p>
        </div>
      ) : batchPrintMode ? (
        <div className="space-y-8 print:space-y-0">
          {filteredColaboradores.map((colab, idx) => (
            <RelatorioIndividualSheet
              key={colab.id}
              colab={colab}
              isBatchItem={true}
              isLastBatchItem={idx === filteredColaboradores.length - 1}
            />
          ))}
        </div>
      ) : (
        activeColaborador && (
          <RelatorioIndividualSheet
            key={activeColaborador.id}
            colab={activeColaborador}
            isBatchItem={false}
          />
        )
      )}
    </div>
  );
}
