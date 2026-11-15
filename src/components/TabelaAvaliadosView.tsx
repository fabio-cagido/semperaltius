'use client';

import React, { useState, useMemo } from 'react';
import { AvaliadoRecord, DashboardData, UnidadeScope } from '@/types/dashboard';
import { Search, Download, Eye, X, Award, CheckCircle2, AlertCircle, Users } from 'lucide-react';

interface TabelaAvaliadosViewProps {
  avaliados: AvaliadoRecord[];
  metadata: DashboardData['metadata'];
  unidade: UnidadeScope;
}

export default function TabelaAvaliadosView({ avaliados, metadata, unidade }: TabelaAvaliadosViewProps) {
  const [search, setSearch] = useState('');
  const [segFilter, setSegFilter] = useState('Todos');
  const [cargoFilter, setCargoFilter] = useState('Todos');
  const [nivelFilter, setNivelFilter] = useState('Todos');
  const [selectedAvaliado, setSelectedAvaliado] = useState<AvaliadoRecord | null>(null);

  // Filter list by selected global unit and local filters
  const filteredList = useMemo(() => {
    return avaliados.filter((a) => {
      // Global unit filter
      if (unidade !== 'Todas' && a.unidade !== unidade) return false;
      // Segment filter
      if (segFilter !== 'Todos' && a.segmento !== segFilter) return false;
      // Cargo filter
      if (cargoFilter !== 'Todos' && a.cargo !== cargoFilter) return false;
      // Nivel filter
      if (nivelFilter !== 'Todos' && a.nivel !== nivelFilter) return false;
      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = a.nome.toLowerCase().includes(q);
        const matchesEmail = a.email.toLowerCase().includes(q);
        const matchesLider = (a.lider_raw || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesLider) return false;
      }
      return true;
    });
  }, [avaliados, unidade, segFilter, cargoFilter, nivelFilter, search]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Nome', 'Email', 'Unidade', 'Segmento', 'Cargo', 'Líder', 'Nota Final', 'Nível',
      'Autoavaliação', 'Do Líder', 'Dos Pares', 'Outros/Psicólogo', 'Alunos'
    ];
    const rows = filteredList.map(a => [
      `"${a.nome}"`,
      `"${a.email}"`,
      `"${a.unidade}"`,
      `"${a.segmento}"`,
      `"${a.cargo}"`,
      `"${a.lider_raw || ''}"`,
      a.nota_final ?? '',
      `"${a.nivel || ''}"`,
      a.autoavaliação ?? '',
      a.do_líder ?? '',
      a.dos_pares ?? '',
      a.outros ?? '',
      a.dos_subordinados ?? ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `avaliados_everest_2026_${unidade.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getNivelBadge = (nivel: string | null) => {
    if (nivel === 'Referência') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Referência [REF]</span>;
    }
    if (nivel === 'Atuação Adequada') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">Adequada [AA]</span>;
    }
    if (nivel === 'Em Desenvolvimento') {
      return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Em Desenv. [ED]</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">Inicial [I]</span>;
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-everest-navy to-everest-blue rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-blue-200 mb-2">
            <Users className="w-3.5 h-3.5" />
            Quadro Consolidado de Participantes • {filteredList.length} registros
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Lista Completa de Avaliados e Devolutivas
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-200">
            Acompanhe o status e a pontuação individual de cada colaborador para suporte às sessões de devolutiva e PDI.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-everest-navy font-bold text-xs shadow hover:bg-slate-100 transition-colors self-start sm:self-auto shrink-0"
        >
          <Download className="w-4 h-4 text-everest-blue" />
          Exportar Planilha (CSV)
        </button>
      </div>

      {/* 2. Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou líder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-everest-blue"
          />
        </div>

        <div>
          <select
            value={segFilter}
            onChange={(e) => setSegFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-everest-blue font-medium"
          >
            <option value="Todos">Todos os Segmentos</option>
            <option value="EI">Educação Infantil (EI)</option>
            <option value="EFI">Ensino Fundamental I (EFI)</option>
            <option value="EFII">Ensino Fundamental II (EFII)</option>
            <option value="EM">Ensino Médio (EM)</option>
            <option value="Geral / Transversal">Geral / Transversal</option>
          </select>
        </div>

        <div>
          <select
            value={cargoFilter}
            onChange={(e) => setCargoFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-everest-blue font-medium"
          >
            <option value="Todos">Todos os Cargos</option>
            <option value="Docentes">Docentes</option>
            <option value="Coordenação / Direção">Coordenação / Direção</option>
            <option value="Psicólogos">Psicólogos</option>
          </select>
        </div>

        <div>
          <select
            value={nivelFilter}
            onChange={(e) => setNivelFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-everest-blue font-medium"
          >
            <option value="Todos">Todos os Níveis</option>
            <option value="Referência">Referência [REF] (≥ 3.60)</option>
            <option value="Atuação Adequada">Atuação Adequada [AA] (3.00-3.59)</option>
            <option value="Em Desenvolvimento">Em Desenvolvimento [ED] (2.50-2.99)</option>
            <option value="Inicial">Inicial [I] (&lt; 2.50)</option>
          </select>
        </div>
      </div>

      {/* 3. Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-left">Profissional</th>
                <th className="py-3 px-3 text-left">Segmento / Cargo</th>
                <th className="py-3 px-3 text-left">Líder Imediato</th>
                <th className="py-3 px-3 text-center">Auto</th>
                <th className="py-3 px-3 text-center">Líder</th>
                <th className="py-3 px-3 text-center">Pares</th>
                <th className="py-3 px-3 text-center bg-blue-50/50 text-blue-900 font-extrabold">Nota Final</th>
                <th className="py-3 px-3 text-center">Nível</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredList.map((a) => (
                <tr key={a.email} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{a.nome}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{a.email}</div>
                  </td>
                  
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-800">{a.segmento}</span>
                    <div className="text-[10px] text-slate-500">{a.cargo}</div>
                  </td>

                  <td className="py-3 px-3 text-slate-600 font-medium">
                    {a.lider_raw || '-'}
                  </td>

                  <td className="py-3 px-3 text-center text-slate-700 font-medium">
                    {a.autoavaliação?.toFixed(2) || '-'}
                  </td>

                  <td className="py-3 px-3 text-center text-slate-700 font-medium">
                    {a.do_líder?.toFixed(2) || '-'}
                  </td>

                  <td className="py-3 px-3 text-center text-slate-700 font-medium">
                    {a.dos_pares?.toFixed(2) || '-'}
                  </td>

                  <td className="py-3 px-3 text-center font-extrabold text-sm text-blue-700 bg-blue-50/20">
                    {a.nota_final?.toFixed(2) || '-'}
                  </td>

                  <td className="py-3 px-3 text-center">
                    {getNivelBadge(a.nivel)}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setSelectedAvaliado(a)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-everest-navy hover:text-white text-slate-700 text-[11px] font-semibold transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Details Modal */}
      {selectedAvaliado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-everest-navy to-everest-blue text-white rounded-t-2xl">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                  Ficha Individual de Avaliação 360º
                </span>
                <h3 className="text-xl font-bold mt-1 text-white">{selectedAvaliado.nome}</h3>
                <p className="text-xs text-slate-200 mt-0.5">{selectedAvaliado.email} • {selectedAvaliado.unidade}</p>
              </div>
              <button
                onClick={() => setSelectedAvaliado(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Nota Final</div>
                  <div className="text-2xl font-extrabold text-blue-700">{selectedAvaliado.nota_final?.toFixed(2)}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Segmento</div>
                  <div className="text-base font-bold text-slate-800">{selectedAvaliado.segmento}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Cargo</div>
                  <div className="text-base font-bold text-slate-800 truncate">{selectedAvaliado.cargo}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Nível</div>
                  <div className="mt-1">{getNivelBadge(selectedAvaliado.nivel)}</div>
                </div>
              </div>

              {/* Âmbitos Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Médias por Âmbito Avaliativo
                </h4>
                <div className="space-y-2">
                  {metadata.ambitos.map((amb) => {
                    const score = selectedAvaliado.topicos[amb] ?? 0;
                    const pct = ((score / 4.0) * 100).toFixed(0);
                    return (
                      <div key={amb} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-slate-800">{amb}</div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-everest-blue h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-extrabold text-slate-900">{score > 0 ? score.toFixed(2) : '-'}</span>
                          <span className="text-[10px] text-slate-400 block">/ 4.00</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Evaluator Profiles breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Notas por Papel Avaliador
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Autoavaliação</span>
                    <strong className="text-base text-slate-800">{selectedAvaliado.autoavaliação?.toFixed(2) || 'N/A'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Do Líder</span>
                    <strong className="text-base text-slate-800">{selectedAvaliado.do_líder?.toFixed(2) || 'N/A'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Dos Pares</span>
                    <strong className="text-base text-slate-800">{selectedAvaliado.dos_pares?.toFixed(2) || 'N/A'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Colegas / Outros</span>
                    <strong className="text-base text-slate-800">{selectedAvaliado.outros?.toFixed(2) || 'N/A'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Alunos (Subordinados)</span>
                    <strong className="text-base text-purple-800">{selectedAvaliado.dos_subordinados?.toFixed(2) || 'N/A'}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Líder</span>
                    <strong className="text-xs text-slate-700 truncate block">{selectedAvaliado.lider_raw || '-'}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => setSelectedAvaliado(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
