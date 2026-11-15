export type UnidadeScope = 'Todas' | 'Curitiba' | 'Rio de Janeiro';
export type CicloEscolar = 'EI' | 'EFI' | 'EFII' | 'EM' | 'Geral / Transversal';
export type PerformanceLevel = 'Inicial' | 'Em Desenvolvimento' | 'Atuação Adequada' | 'Referência';
export type CargoAvaliado = 'Docentes' | 'Coordenação / Direção' | 'Psicólogos' | 'Supervisão de Inglês';
export type InstrumentoGestao = 'coordenadores_ciclo' | 'psicologos' | 'gestao_ingles' | 'disciplinas_institucionais';

export interface QuesitoMeta {
  id: number;
  ambito: string;
  perfil: string;
  quesito: string;
  raw_sub?: string;
  raw?: string;
  key: string;
}

export interface RankedQuesito {
  id: number;
  ambito: string;
  perfil: string;
  quesito: string;
  media: number;
  total_respostas: number;
}

export interface RankingsData {
  todos: RankedQuesito[];
  top5: RankedQuesito[];
  bottom5: RankedQuesito[];
}

export interface EvaluatorProfiles {
  coordenador: number;
  autoavaliação: number;
  pares: number;
  outros_psicólogo: number;
  alunos: number;
  autoavaliacao?: number;
  outros?: number;
  colegas?: number;
  dos_pares?: number;
  dos_subordinados?: number;
  do_lider?: number;
}

export interface MatrixCell {
  count: number;
  pct: number;
  total_ciclo: number;
}

export type PerformanceMatrix = Record<string, Record<PerformanceLevel, MatrixCell>>;

export interface CicloData {
  total: number;
  media_geral: number;
  ambitos: Record<string, number>;
  perfis_avaliadores: EvaluatorProfiles;
  rankings: RankingsData;
  cargos: {
    Docentes: Record<string, number>;
    Coordenação: Record<string, number>;
    Psicólogos: Record<string, number>;
    'Supervisão de Inglês'?: Record<string, number>;
  };
}

export interface GestaoInstrumentAnalytics {
  total: number;
  media_geral: number;
  ambitos: Record<string, number>;
  perfis_avaliadores: Record<string, number>;
  rankings: RankingsData;
  distribuicao_ciclo: Record<string, number>;
  distribuicao_nivel: Record<string, number>;
}

export interface ScopeAnalytics {
  kpis: {
    total_avaliados: number;
    media_geral: number;
    mulheres_count: number;
    homens_count: number;
    mulheres_pct: number;
    homens_pct: number;
  };
  distribuicao_ciclo: Record<string, number>;
  matriz_desempenho: PerformanceMatrix;
  cargos_resumo: Record<string, {
    total: number;
    media_geral: number;
    ambitos: Record<string, number>;
    rankings: RankingsData;
  }>;
  ambitos_gerais: Record<string, number>;
  perfis_avaliadores_geral: EvaluatorProfiles;
  rankings_gerais: RankingsData;
  ciclos: Record<string, CicloData>;
  comparativo_ciclos: {
    Docentes: Record<string, Record<string, number>>;
    Coordenação: Record<string, Record<string, number>>;
    Psicólogos: Record<string, Record<string, number>>;
  };
  gestao_especialistas?: Record<InstrumentoGestao, GestaoInstrumentAnalytics>;
}

export interface AvaliadoRecord {
  src: string;
  nome: string;
  email: string;
  dept_raw: string | null;
  area_raw: string | null;
  tag_raw: string | null;
  lider_raw: string | null;
  nota_final: number | null;
  media: number | null;
  autoavaliação: number | null;
  do_líder: number | null;
  outros: number | null;
  colegas: number | null;
  dos_pares: number | null;
  dos_subordinados: number | null;
  topicos: Record<string, number | null>;
  questoes: Record<string, number | null>;
  unidade: 'Curitiba' | 'Rio de Janeiro';
  segmento: CicloEscolar;
  sexo: 'Feminino' | 'Masculino';
  cargo: CargoAvaliado;
  nivel: PerformanceLevel | null;
}

export interface EspecialistaRecord {
  nome: string;
  email: string;
  unidade: 'Curitiba' | 'Rio de Janeiro';
  segmento: string;
  segmentos_list: string[];
  cargo: string;
  instrumento: InstrumentoGestao;
  lider: string;
  nota_final: number | null;
  media: number | null;
  autoavaliacao: number | null;
  do_lider: number | null;
  outros: number | null;
  colegas: number | null;
  dos_pares: number | null;
  dos_subordinados: number | null;
  nivel: PerformanceLevel | null;
  topicos: Record<string, number | null>;
  questoes: Record<string, number | null>;
}

export interface DashboardData {
  metadata: {
    titulo: string;
    colegios: string[];
    total_avaliados: number;
    ano: number;
    escala: { min: number; max: number; tipo: string };
    ambitos: string[];
    questoes_meta: QuesitoMeta[];
    cortes: Record<PerformanceLevel, {
      min: number;
      max: number;
      label: string;
      cor: string;
    }>;
    gestao_especialistas_meta?: {
      ambitos_coordenadores: string[];
      ambitos_psicologos: string[];
      ambitos_gestao_ingles: string[];
      ambitos_disciplinas_institucionais: string[];
      questoes_coordenadores: QuesitoMeta[];
      questoes_psicologos: QuesitoMeta[];
      questoes_gestao_ingles: QuesitoMeta[];
      questoes_disciplinas_institucionais: QuesitoMeta[];
    };
  };
  scopes: Record<UnidadeScope, ScopeAnalytics>;
  avaliados: AvaliadoRecord[];
  gestao_especialistas?: {
    coordenadores_ciclo: EspecialistaRecord[];
    psicologos: EspecialistaRecord[];
    gestao_ingles: EspecialistaRecord[];
    disciplinas_institucionais: EspecialistaRecord[];
  };
}
