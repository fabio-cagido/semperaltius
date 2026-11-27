import os
import json
import re
import csv
import unicodedata
import openpyxl
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F1_PATH = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
F2_PATH = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'
CTBA_STUDENTS_CSV = os.path.join(BASE_DIR, 'src', 'data', 'raw', 'respostas_alunos_ctba.csv')
RJ_STUDENTS_CSV = os.path.join(BASE_DIR, 'src', 'data', 'raw', 'respostas_alunos_rj.csv')
OUTPUT_JSON = os.path.join(BASE_DIR, 'src', 'data', 'dashboard_data.json')

# New instruments files
COORD_XLSX = os.path.join(BASE_DIR, 'src', 'data', 'raw', 'coordenadores_ciclo.xlsx')
PSICO_XLSX = os.path.join(BASE_DIR, 'src', 'data', 'raw', 'psicologos.xlsx')
SUP_INGLES_XLSX = os.path.join(BASE_DIR, 'src', 'data', 'raw', 'supervisores_ingles.xlsx')
COORD_INGLES_XLSX = os.path.join(BASE_DIR, 'src', 'data', 'raw', 'coordenadores_ingles.xlsx')
DISC_INST_XLSX = os.path.join(BASE_DIR, 'src', 'data', 'raw', 'disciplinas_institucionais.xlsx')
ED_FISICA_XLSX = os.path.join(BASE_DIR, 'src', 'data', 'raw', 'educacao_fisica.xlsx')

MALE_NAMES = {
    'allander', 'arlindo', 'bernardo', 'carlos', 'danilo', 'david', 'dennis', 'euclides',
    'fernando', 'gabriel', 'guilherme', 'ivan', 'joao', 'jonas', 'juliano', 'lucas',
    'luiz', 'marcio', 'raphael', 'rene', 'rodrigo', 'silvio', 'thales', 'wellington',
    'yuri', 'alex', 'darlan', 'felipe', 'pedro', 'reinaldo', 'igor', 'agostinho', 'rafael'
}

STUDENT_QUESTIONS_META = [
    {
        'id': 50,
        'ambito': 'Compromisso com ensino',
        'perfil': 'Alunos',
        'quesito': 'Metodologias CAR',
        'raw_sub': '[Alunos] Metodologias CAR',
        'key': 'Alunos::Metodologias CAR'
    },
    {
        'id': 51,
        'ambito': 'Compromisso com ensino',
        'perfil': 'Alunos',
        'quesito': 'Eixos e temas contemporâneos transversais',
        'raw_sub': '[Alunos] Eixos e temas contemporâneos transversais',
        'key': 'Alunos::Eixos e temas contemporâneos transversais'
    },
    {
        'id': 52,
        'ambito': 'Compromisso com ensino',
        'perfil': 'Alunos',
        'quesito': 'Utilização de espaços além da sala de aula',
        'raw_sub': '[Alunos] Utilização de espaços além da sala de aula',
        'key': 'Alunos::Utilização de espaços além da sala de aula'
    },
    {
        'id': 53,
        'ambito': 'Compromisso com a aprendizagem',
        'perfil': 'Alunos',
        'quesito': 'Instrução diferenciada',
        'raw_sub': '[Alunos] Instrução diferenciada',
        'key': 'Alunos::Instrução diferenciada'
    },
    {
        'id': 54,
        'ambito': 'Compromisso com a aprendizagem',
        'perfil': 'Alunos',
        'quesito': 'Avaliação Formativa',
        'raw_sub': '[Alunos] Avaliação Formativa',
        'key': 'Alunos::Avaliação Formativa'
    },
    {
        'id': 55,
        'ambito': 'Compromisso com a aprendizagem',
        'perfil': 'Alunos',
        'quesito': 'Rubricas',
        'raw_sub': '[Alunos] Rubricas',
        'key': 'Alunos::Rubricas'
    },
    {
        'id': 56,
        'ambito': 'Compromisso com a aprendizagem',
        'perfil': 'Alunos',
        'quesito': 'Auto e coavaliação',
        'raw_sub': '[Alunos] Auto e coavaliação',
        'key': 'Alunos::Auto e coavaliação'
    },
    {
        'id': 57,
        'ambito': 'Compromisso com a aprendizagem',
        'perfil': 'Alunos',
        'quesito': 'Portfólio',
        'raw_sub': '[Alunos] Portfólio',
        'key': 'Alunos::Portfólio'
    },
    {
        'id': 58,
        'ambito': 'Compromisso com a aprendizagem',
        'perfil': 'Alunos',
        'quesito': 'Evidências de aprendizagem',
        'raw_sub': '[Alunos] Evidências de aprendizagem',
        'key': 'Alunos::Evidências de aprendizagem'
    },
    {
        'id': 59,
        'ambito': 'Papel como formador',
        'perfil': 'Alunos',
        'quesito': 'Percurso de Desenvolvimento Socioemocional',
        'raw_sub': '[Alunos] Percurso de Desenvolvimento Socioemocional',
        'key': 'Alunos::Percurso de Desenvolvimento Socioemocional'
    },
    {
        'id': 60,
        'ambito': 'Papel como formador',
        'perfil': 'Alunos',
        'quesito': 'Ambiente inclusivo e prevenção ao bullying',
        'raw_sub': '[Alunos] Ambiente inclusivo e prevenção ao bullying',
        'key': 'Alunos::Ambiente inclusivo e prevenção ao bullying'
    }
]

# Mapping for Leadership & Specialists
COORD_MAP = {
    'Adriane de Fatima Bueno Baggio': {'unidade': 'Curitiba', 'segmento': 'EI', 'segmentos_list': ['EI'], 'cargo': 'Coordenador de Ciclo'},
    'Cintia de Moraes Voss': {'unidade': 'Curitiba', 'segmento': 'EFI', 'segmentos_list': ['EFI'], 'cargo': 'Coordenador de Ciclo'},
    'Reinaldo Rodrigues dos Santos': {'unidade': 'Curitiba', 'segmento': 'EFII', 'segmentos_list': ['EFII'], 'cargo': 'Coordenador de Ciclo'},
    'Tatiana Salomão Eulalio de Souza': {'unidade': 'Curitiba', 'segmento': 'EM', 'segmentos_list': ['EM'], 'cargo': 'Coordenador de Ciclo'},
    'Adriana Jorge': {'unidade': 'Rio de Janeiro', 'segmento': 'EI', 'segmentos_list': ['EI'], 'cargo': 'Coordenador de Ciclo'},
    'Mariana Rigo': {'unidade': 'Rio de Janeiro', 'segmento': 'EFI', 'segmentos_list': ['EFI'], 'cargo': 'Coordenador de Ciclo'},
    'Margareth R Paraguassu': {'unidade': 'Rio de Janeiro', 'segmento': 'EFII', 'segmentos_list': ['EFII'], 'cargo': 'Coordenador de Ciclo'},
}

PSICO_MAP = {
    'Monalisa Mascouto Peixoto': {'unidade': 'Rio de Janeiro', 'segmento': 'EI', 'segmentos_list': ['EI'], 'cargo': 'Psicólogo Escolar'},
    'Rebeca Cardoso de Oliviera': {'unidade': 'Curitiba', 'segmento': 'EFI', 'segmentos_list': ['EFI'], 'cargo': 'Psicólogo Escolar'},
    'Adriana Pereira do Nascimento': {'unidade': 'Rio de Janeiro', 'segmento': 'EFI', 'segmentos_list': ['EFI'], 'cargo': 'Psicólogo Escolar'},
    'Andrea de Carvalho Constantino': {'unidade': 'Curitiba', 'segmento': 'EFII', 'segmentos_list': ['EFII'], 'cargo': 'Psicólogo Escolar'},
    'Luise Kindel Monteiro': {'unidade': 'Rio de Janeiro', 'segmento': 'EFII', 'segmentos_list': ['EFII'], 'cargo': 'Psicólogo Escolar'},
    'Quefli Rodrigues da Silva': {'unidade': 'Curitiba', 'segmento': 'EI', 'segmentos_list': ['EI'], 'cargo': 'Psicólogo Escolar'},
}

INGLES_MAP = {
    'Ana Paula Nagamine Lucca': {'unidade': 'Curitiba', 'segmento': 'EI', 'segmentos_list': ['EI'], 'cargo': 'Supervisor de Inglês'},
    'Luma Marchi': {'unidade': 'Curitiba', 'segmento': 'EFI', 'segmentos_list': ['EFI'], 'cargo': 'Supervisor de Inglês'},
    'Malena Areal Calvano Souza': {'unidade': 'Rio de Janeiro', 'segmento': 'EI/EFI', 'segmentos_list': ['EI', 'EFI'], 'cargo': 'Supervisor de Inglês'},
    'Igor Guilherme Romko': {'unidade': 'Curitiba', 'segmento': 'EFII/EM', 'segmentos_list': ['EFII', 'EM'], 'cargo': 'Coordenador Geral de Inglês'},
    'Fernanda Macena Siqueira': {'unidade': 'Rio de Janeiro', 'segmento': 'EFII/EM', 'segmentos_list': ['EFII', 'EM'], 'cargo': 'Coordenador Geral de Inglês'},
}

INST_MAP = {
    'Agostinho Hilario Obzut': {'unidade': 'Curitiba', 'segmento': 'Transversal', 'segmentos_list': ['Transversal'], 'cargo': 'Coordenador de Disciplinas Institucionais'},
}

def infer_gender(name):
    first_name = name.strip().split()[0].lower()
    first_name = re.sub(r'[^a-z]', '', first_name)
    if first_name in MALE_NAMES:
        return 'Masculino'
    return 'Feminino'

def normalize_segment(dept, tag, leader, email):
    dept_str = str(dept).strip().upper() if pd.notna(dept) else ''
    tag_str = str(tag).strip().upper() if pd.notna(tag) else ''
    leader_str = str(leader).strip().upper() if pd.notna(leader) else ''
    email_str = str(email).strip().lower() if pd.notna(email) else ''

    # Special transversal cases
    if 'FANTINI' in leader_str:
        return 'Geral / Transversal'
    if email_str in ['mariana.menezes@everestrj.net.br', 'yuri.jesus@everestrj.net.br']:
        return 'Geral / Transversal'

    # Check department (Fundamental 2 / II BEFORE Fundamental 1 / I to prevent substring mismatch)
    if 'PRÉ-ESCOLAR' in dept_str or 'INFANTIL' in dept_str:
        return 'EI'
    if 'FUNDAMENTAL 2' in dept_str or 'FUNDAMENTAL II' in dept_str:
        return 'EFII'
    if 'FUNDAMENTAL 1' in dept_str or 'FUNDAMENTAL I' in dept_str:
        return 'EFI'
    if 'MÉDIO' in dept_str or 'MEDIO' in dept_str:
        return 'EM'

    # Check tag
    if '- EI' in tag_str or 'ADRIANE' in tag_str or 'ADRIANA JORGE' in tag_str:
        return 'EI'
    if '- F2' in tag_str or 'REINALDO' in tag_str:
        return 'EFII'
    if '- F1' in tag_str or 'CINTIA' in tag_str or 'MARIANA RIGGO' in tag_str:
        return 'EFI'
    if '- EM' in tag_str or 'TATIANA' in tag_str:
        return 'EM'

    # Check leader
    if 'ADRIANE' in leader_str or 'ADRIANA JORGE' in leader_str:
        return 'EI'
    if 'REINALDO' in leader_str:
        return 'EFII'
    if 'TATIANA' in leader_str:
        return 'EM'
    if 'CINTIA' in leader_str or 'MARIANA' in leader_str or 'MALENA' in leader_str:
        return 'EFI'
    if 'MARGARETH' in leader_str:
        return 'EFII'
    if 'FERNANDA MACENA' in leader_str:
        return 'Geral / Transversal'

    return 'Geral / Transversal'

def infer_unit(email, tag):
    email_str = str(email).lower() if pd.notna(email) else ''
    tag_str = str(tag).upper() if pd.notna(tag) else ''
    if 'curitiba' in email_str or 'CTBA' in tag_str:
        return 'Curitiba'
    if 'everestrj' in email_str or 'everstrj' in email_str or 'RJ' in tag_str:
        return 'Rio de Janeiro'
    return 'Desconhecida'

def infer_role(nome, dept, leader, email):
    name_str = str(nome).strip()
    dept_str = str(dept).strip().upper() if pd.notna(dept) else ''
    leader_str = str(leader).strip().upper() if pd.notna(leader) else ''

    if name_str == 'Alex Rafael Ribas' or 'DIREÇÃO' in dept_str:
        return 'Coordenação / Direção'

    if 'FANTINI' in leader_str:
        return 'Psicólogos'

    return 'Docentes'

def compute_weighted_final_score_with_students(auto, do_lider, dos_pares, outros, dos_subord):
    """
    Official 2026 weighting incorporating student evaluations (EFII / EM):
    - 25% Autoavaliação
    - 45% Líder
    - 10% Alunos (dos_subordinados)
    - 10% Pares
    - 10% Outros (Psicólogo)
    Redistributes weights proportionally if any profile is None.
    """
    weights = [
        (auto, 0.25),
        (do_lider, 0.45),
        (dos_subord, 0.10),
        (dos_pares, 0.10),
        (outros, 0.10),
    ]
    num = sum(val * w for val, w in weights if val is not None)
    den = sum(w for val, w in weights if val is not None)
    if den == 0:
        return None
    return round(float(num / den), 2)

def get_performance_level(score):
    if score is None:
        return None
    if score < 2.50:
        return 'Inicial'
    elif score < 3.00:
        return 'Em Desenvolvimento'
    elif score < 3.60:
        return 'Atuação Adequada'
    else:
        return 'Referência'

def clean_val(val):
    if pd.isna(val) or val is None:
        return None
    try:
        f = float(val)
        if np.isnan(f) or f == 0:
            return None
        return round(f, 2)
    except:
        return None

def clean_str(val):
    if pd.isna(val) or val is None:
        return None
    s = str(val).strip()
    if s.lower() == 'nan' or not s:
        return None
    return s

def norm_person_name(s):
    if not s:
        return ''
    s = s.replace('ã¡Ssia', 'ássia').replace('ã£O', 'ão').replace('Mã¼ller', 'Müller')
    s = s.replace('Cã¡Ssia', 'Cássia').replace('Antã£O', 'Antão')
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'\s+', ' ', s).strip().lower()

def load_student_evaluations():
    def parse_student_val(t):
        if not t:
            return None
        s = t.strip()
        if s.startswith('1'):
            return 1.0
        if s.startswith('2'):
            return 2.0
        if s.startswith('3'):
            return 3.0
        if s.startswith('4'):
            return 4.0
        return None

    ALIASES = {
        norm_person_name('Raphael Mota'): norm_person_name('Raphael de Miranda Mota'),
        norm_person_name('Rita de Cã¡Ssia Fernandes de Lima'): norm_person_name('Rita de Cássia Fernandes de Lima'),
        norm_person_name('Euclides Antã£O Mã¼ller'): norm_person_name('Euclides Antão Müller'),
    }

    teacher_student_data = {}

    # Load Curitiba
    if os.path.exists(CTBA_STUDENTS_CSV):
        with open(CTBA_STUDENTS_CSV, encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)
            for r in reader:
                if not r or len(r) <= 2:
                    continue
                raw_name = r[2].strip()
                n = norm_person_name(raw_name)
                n = ALIASES.get(n, n)
                if n not in teacher_student_data:
                    teacher_student_data[n] = {
                        'raw_name': raw_name,
                        'unidade': 'Curitiba',
                        'count': 0,
                        'by_q': [[] for _ in range(11)],
                        'all_scores': []
                    }
                teacher_student_data[n]['count'] += 1
                for qi in range(11):
                    col_idx = 3 + qi
                    if col_idx < len(r):
                        val = parse_student_val(r[col_idx])
                        if val is not None:
                            teacher_student_data[n]['by_q'][qi].append(val)
                            teacher_student_data[n]['all_scores'].append(val)

    # Load Rio
    if os.path.exists(RJ_STUDENTS_CSV):
        with open(RJ_STUDENTS_CSV, encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)
            for r in reader:
                if not r or len(r) <= 1:
                    continue
                raw_name = r[1].strip()
                n = norm_person_name(raw_name)
                n = ALIASES.get(n, n)
                if n not in teacher_student_data:
                    teacher_student_data[n] = {
                        'raw_name': raw_name,
                        'unidade': 'Rio de Janeiro',
                        'count': 0,
                        'by_q': [[] for _ in range(11)],
                        'all_scores': []
                    }
                teacher_student_data[n]['count'] += 1
                for qi in range(11):
                    col_idx = 2 + qi
                    if col_idx < len(r):
                        val = parse_student_val(r[col_idx])
                        if val is not None:
                            teacher_student_data[n]['by_q'][qi].append(val)
                            teacher_student_data[n]['all_scores'].append(val)

    return teacher_student_data

def build_individual_details(questoes_dict, meta_list, ambitos_list, topicos_dict, mode='docentes'):
    """
    Computes per-collaborator:
    1) ambitos_por_avaliador: { ambito: { lider, autoavaliacao, pares_psicologos, alunos, geral } }
    2) indicadores: [ { codigo, enunciado, ambito, lider, autoavaliacao, pares_psicologos, alunos, media } ]
    """
    def map_profile(p):
        if mode == 'docentes':
            if p == 'Coordenadores':
                return 'lider'
            elif p == 'Autoavaliação':
                return 'autoavaliacao'
            elif p == 'Psicologos e Pares':
                return 'pares_psicologos'
            elif p == 'Alunos':
                return 'alunos'
        elif mode == 'psicologos':
            if p == 'Superior Imediato/Pares':
                return 'lider_and_pares'
            elif p == 'Autoavaliação':
                return 'autoavaliacao'
        else:
            # coordenadores_ciclo, gestao_ingles, disciplinas_institucionais
            if p == 'Diretor':
                return 'lider'
            elif p == 'Autoavaliação':
                return 'autoavaliacao'
            elif p in ('Psicólogas', 'Professores'):
                return 'pares_psicologos'
        return 'outros'

    # 1. Group questions by (ambito, quesito) preserving order of appearance
    indicator_order = []
    indicator_groups = {}
    for m in meta_list:
        amb = m['ambito']
        q_name = m['quesito']
        g_key = (amb, q_name)
        if g_key not in indicator_groups:
            indicator_order.append(g_key)
            indicator_groups[g_key] = {
                'lider': [],
                'autoavaliacao': [],
                'pares_psicologos': [],
                'alunos': []
            }
        val = questoes_dict.get(m['key'])
        if val is not None:
            mapped = map_profile(m['perfil'])
            if mapped == 'lider_and_pares':
                indicator_groups[g_key]['lider'].append(val)
                indicator_groups[g_key]['pares_psicologos'].append(val)
            elif mapped in indicator_groups[g_key]:
                indicator_groups[g_key][mapped].append(val)

    indicadores = []
    for idx, (amb, q_name) in enumerate(indicator_order, start=1):
        grp = indicator_groups[(amb, q_name)]
        v_lider = round(float(np.mean(grp['lider'])), 2) if grp['lider'] else None
        v_auto = round(float(np.mean(grp['autoavaliacao'])), 2) if grp['autoavaliacao'] else None
        v_pares = round(float(np.mean(grp['pares_psicologos'])), 2) if grp['pares_psicologos'] else None
        v_alunos = round(float(np.mean(grp['alunos'])), 2) if grp['alunos'] else None

        # Media geral do quesito
        if mode == 'psicologos':
            all_vals = grp['lider'] + grp['autoavaliacao']
        else:
            all_vals = grp['lider'] + grp['autoavaliacao'] + grp['pares_psicologos'] + grp['alunos']
        v_media = round(float(np.mean(all_vals)), 2) if all_vals else None

        indicadores.append({
            'codigo': f"IND-{idx:02d}",
            'enunciado': q_name,
            'ambito': amb,
            'lider': v_lider,
            'autoavaliacao': v_auto,
            'pares_psicologos': v_pares,
            'alunos': v_alunos,
            'media': v_media
        })

    # 2. Group by ambito and evaluator profile
    ambitos_por_avaliador = {}
    for amb in ambitos_list:
        amb_lider = []
        amb_auto = []
        amb_pares = []
        amb_alunos = []
        for m in meta_list:
            if m['ambito'] != amb:
                continue
            val = questoes_dict.get(m['key'])
            if val is None:
                continue
            mapped = map_profile(m['perfil'])
            if mapped == 'lider_and_pares':
                amb_lider.append(val)
                amb_pares.append(val)
            elif mapped == 'lider':
                amb_lider.append(val)
            elif mapped == 'autoavaliacao':
                amb_auto.append(val)
            elif mapped == 'pares_psicologos':
                amb_pares.append(val)
            elif mapped == 'alunos':
                amb_alunos.append(val)

        v_lider = round(float(np.mean(amb_lider)), 2) if amb_lider else None
        v_auto = round(float(np.mean(amb_auto)), 2) if amb_auto else None
        v_pares = round(float(np.mean(amb_pares)), 2) if amb_pares else None
        v_alunos = round(float(np.mean(amb_alunos)), 2) if amb_alunos else None

        geral_val = topicos_dict.get(amb)
        if mode == 'docentes' and v_alunos is not None:
            # Incorporate student score into the ambito average using official weights (25% Auto, 45% Líder, 20% Pares/Outros, 10% Alunos)
            w_amb = [
                (v_auto, 0.25),
                (v_lider, 0.45),
                (v_pares, 0.20),
                (v_alunos, 0.10),
            ]
            num_a = sum(v * w for v, w in w_amb if v is not None)
            den_a = sum(w for v, w in w_amb if v is not None)
            if den_a > 0:
                geral_val = round(float(num_a / den_a), 2)
        elif geral_val is None:
            combined = amb_lider + amb_auto + (amb_pares if mode != 'psicologos' else []) + amb_alunos
            geral_val = round(float(np.mean(combined)), 2) if combined else None

        ambitos_por_avaliador[amb] = {
            'lider': v_lider,
            'autoavaliacao': v_auto,
            'pares_psicologos': v_pares,
            'alunos': v_alunos,
            'geral': geral_val
        }

    return ambitos_por_avaliador, indicadores

def load_educacao_fisica_evaluations():
    if not os.path.exists(ED_FISICA_XLSX):
        return []
    wb = openpyxl.load_workbook(ED_FISICA_XLSX, data_only=True)
    ws_m = wb['Médias']
    ws_t = wb['Tópicos']
    ws_p = wb['Perguntas computáveis']

    t_headers = []
    for c in range(13, ws_t.max_column + 1):
        v = ws_t.cell(2, c).value
        if v:
            t_headers.append((c, str(v).strip()))

    p_headers = []
    for c in range(13, ws_p.max_column + 1):
        amb = ws_p.cell(1, c).value
        q_raw = ws_p.cell(2, c).value
        if q_raw:
            amb = str(amb).strip() if amb else 'Geral'
            q_str = str(q_raw).strip()
            m = re.match(r'\[(.*?)\]\s*(.*)', q_str)
            perfil = m.group(1) if m else 'Geral'
            quesito = m.group(2) if m else q_str
            quesito_clean = quesito.replace('Pró atividade profissonal', 'Proatividade profissional')
            p_headers.append({
                'col': c,
                'ambito': amb,
                'perfil': perfil,
                'quesito': quesito_clean,
                'key': f"{perfil}::{quesito_clean}"
            })

    ed_records = []
    for r in range(3, ws_m.max_row + 1):
        nome = clean_str(ws_m.cell(r, 1).value)
        if not nome:
            continue
        email = clean_str(ws_m.cell(r, 2).value) or ''
        area = clean_str(ws_m.cell(r, 5).value) or 'Educação Física'
        dept = clean_str(ws_m.cell(r, 6).value) or 'Educação Física'
        tag = clean_str(ws_m.cell(r, 9).value)
        lider = clean_str(ws_m.cell(r, 10).value)

        nota_final = clean_val(ws_m.cell(r, 14).value) or clean_val(ws_m.cell(r, 15).value) or clean_val(ws_m.cell(r, 16).value)
        media = clean_val(ws_m.cell(r, 16).value)
        auto = clean_val(ws_m.cell(r, 17).value)
        do_lider = clean_val(ws_m.cell(r, 18).value)
        outros = clean_val(ws_m.cell(r, 19).value)
        colegas = clean_val(ws_m.cell(r, 20).value)
        dos_pares = clean_val(ws_m.cell(r, 21).value)

        topicos = {}
        for c, tname in t_headers:
            topicos[tname] = clean_val(ws_t.cell(r, c).value)

        questoes = {}
        for p in p_headers:
            questoes[p['key']] = clean_val(ws_p.cell(r, p['col']).value)

        ed_records.append({
            'nome': nome,
            'email': email,
            'area_raw': area,
            'dept_raw': dept,
            'tag_raw': tag,
            'lider_raw': lider,
            'nota_final': nota_final,
            'media': media,
            'autoavaliação': auto,
            'do_líder': do_lider,
            'outros': outros,
            'colegas': colegas,
            'dos_pares': dos_pares,
            'topicos': topicos,
            'questoes': questoes
        })
    return ed_records

def parse_generic_instrument(filepath, mapping_dict, default_instrument_key):
    wb = openpyxl.load_workbook(filepath, data_only=True)
    ws_m = wb['Médias']
    ws_t = wb['Tópicos']
    ws_p = wb['Perguntas computáveis']

    t_headers = []
    for c in range(13, ws_t.max_column + 1):
        v = ws_t.cell(2, c).value
        if v:
            t_headers.append((c, str(v).strip()))

    p_headers = []
    for c in range(13, ws_p.max_column + 1):
        amb = ws_p.cell(1, c).value
        q_raw = ws_p.cell(2, c).value
        if q_raw:
            amb = str(amb).strip() if amb else 'Geral'
            q_str = str(q_raw).strip()
            m = re.match(r'\[(.*?)\]\s*(.*)', q_str)
            perfil = m.group(1) if m else 'Geral'
            quesito = m.group(2) if m else q_str
            quesito_clean = quesito.replace('Pró atividade profissonal', 'Proatividade profissional')
            p_headers.append({
                'id': len(p_headers) + 1,
                'col': c,
                'ambito': amb,
                'perfil': perfil,
                'quesito': quesito_clean,
                'raw': q_str,
                'key': f"{perfil}::{quesito_clean}"
            })

    records = []
    for r in range(3, ws_m.max_row + 1):
        nome = ws_m.cell(r, 1).value
        if not nome or not str(nome).strip():
            continue
        nome = str(nome).strip()
        email = str(ws_m.cell(r, 2).value or '').strip()

        info = mapping_dict.get(nome, {})
        unidade = info.get('unidade')
        if not unidade:
            unidade = 'Curitiba' if 'curitiba' in email.lower() else 'Rio de Janeiro'
        segmento = info.get('segmento', 'Transversal')
        segmentos_list = info.get('segmentos_list', [segmento])
        cargo = info.get('cargo', default_instrument_key)

        nota_final = clean_val(ws_m.cell(r, 14).value)
        media = clean_val(ws_m.cell(r, 16).value)
        auto = clean_val(ws_m.cell(r, 17).value)
        lider = clean_val(ws_m.cell(r, 18).value)
        outros = clean_val(ws_m.cell(r, 19).value)
        colegas = clean_val(ws_m.cell(r, 20).value)
        pares = clean_val(ws_m.cell(r, 21).value)
        subord = clean_val(ws_m.cell(r, 23).value)

        topicos = {}
        for c, tname in t_headers:
            topicos[tname] = clean_val(ws_t.cell(r, c).value)

        questoes = {}
        for p in p_headers:
            questoes[p['key']] = clean_val(ws_p.cell(r, p['col']).value)

        mode_key = 'psicologos' if default_instrument_key == 'psicologos' else 'gestao'
        amb_por_av, ind_list = build_individual_details(
            questoes,
            p_headers,
            [t[1] for t in t_headers],
            topicos,
            mode=mode_key
        )

        records.append({
            'nome': nome,
            'email': email,
            'unidade': unidade,
            'segmento': segmento,
            'segmentos_list': segmentos_list,
            'cargo': cargo,
            'instrumento': default_instrument_key,
            'lider': str(ws_m.cell(r, 10).value or '').strip(),
            'nota_final': nota_final,
            'media': media,
            'autoavaliacao': auto,
            'do_lider': lider,
            'outros': outros,
            'colegas': colegas,
            'dos_pares': pares,
            'dos_subordinados': subord,
            'nivel': get_performance_level(nota_final),
            'topicos': topicos,
            'questoes': questoes,
            'ambitos_por_avaliador': amb_por_av,
            'indicadores': ind_list
        })

    return {
        'records': records,
        'p_headers': p_headers,
        't_headers': [t[1] for t in t_headers]
    }

def compute_instrument_analytics(records, p_headers, t_headers):
    if not records:
        return {
            'total': 0,
            'media_geral': 0.0,
            'ambitos': {t: 0.0 for t in t_headers},
            'perfis_avaliadores': {},
            'rankings': {'todos': [], 'top5': [], 'bottom5': []},
            'distribuicao_ciclo': {},
            'distribuicao_nivel': {'Inicial': 0, 'Em Desenvolvimento': 0, 'Atuação Adequada': 0, 'Referência': 0}
        }

    scores = [r['nota_final'] for r in records if r['nota_final'] is not None]
    media_geral = round(float(np.mean(scores)), 2) if scores else 0.0

    # Ambitos
    ambitos_res = {}
    for t in t_headers:
        vals = [r['topicos'].get(t) for r in records if r['topicos'].get(t) is not None]
        ambitos_res[t] = round(float(np.mean(vals)), 2) if vals else 0.0

    # Perfis avaliadores
    def mean_eval(key):
        v = [r.get(key) for r in records if r.get(key) is not None]
        return round(float(np.mean(v)), 2) if v else 0.0

    perfis = {
        'autoavaliacao': mean_eval('autoavaliacao'),
        'do_lider': mean_eval('do_lider'),
        'outros': mean_eval('outros'),
        'colegas': mean_eval('colegas'),
        'dos_pares': mean_eval('dos_pares'),
        'dos_subordinados': mean_eval('dos_subordinados'),
    }

    # Rankings
    quesito_stats = []
    for meta in p_headers:
        k = meta['key']
        vals = [r['questoes'].get(k) for r in records if r['questoes'].get(k) is not None]
        if vals:
            quesito_stats.append({
                'id': meta['id'],
                'ambito': meta['ambito'],
                'perfil': meta['perfil'],
                'quesito': meta['quesito'],
                'media': round(float(np.mean(vals)), 2),
                'total_respostas': len(vals)
            })

    sorted_desc = sorted(quesito_stats, key=lambda x: x['media'], reverse=True)
    top5 = []
    seen_top = set()
    for item in sorted_desc:
        if item['quesito'] not in seen_top:
            seen_top.add(item['quesito'])
            top5.append(item)
            if len(top5) == 5:
                break

    sorted_asc = sorted(quesito_stats, key=lambda x: x['media'])
    bottom5 = []
    seen_bottom = set()
    for item in sorted_asc:
        if item['quesito'] not in seen_bottom:
            seen_bottom.add(item['quesito'])
            bottom5.append(item)
            if len(bottom5) == 5:
                break

    # Distribuição por ciclo
    ciclo_counts = {'EI': 0, 'EFI': 0, 'EFII': 0, 'EM': 0, 'Transversal': 0}
    for r in records:
        for s in r.get('segmentos_list', [r.get('segmento')]):
            if s in ciclo_counts:
                ciclo_counts[s] += 1
            else:
                ciclo_counts['Transversal'] += 1

    # Distribuição por nível
    nivel_counts = {'Inicial': 0, 'Em Desenvolvimento': 0, 'Atuação Adequada': 0, 'Referência': 0}
    for r in records:
        nv = r.get('nivel')
        if nv in nivel_counts:
            nivel_counts[nv] += 1

    return {
        'total': len(records),
        'media_geral': media_geral,
        'ambitos': ambitos_res,
        'perfis_avaliadores': perfis,
        'rankings': {
            'todos': sorted_desc,
            'top5': top5,
            'bottom5': bottom5
        },
        'distribuicao_ciclo': ciclo_counts,
        'distribuicao_nivel': nivel_counts
    }

def run():
    print("=" * 80)
    print("GERANDO DATASET FINAL INTEGRADO - DOCENTES + LIDERANÇA E ESPECIALISTAS 2026")
    print("=" * 80)

    ambitos = [
        'Compromisso com a aprendizagem',
        'Compromisso com ensino',
        'Crescimento pessoal e profissional',
        'Integração com a instituição',
        'Papel como formador'
    ]

    try:
        # 1. Load sheets from Qulture.Rocks (Docentes)
        df1_m = pd.read_excel(F1_PATH, sheet_name='Médias', header=1)
        df1_t = pd.read_excel(F1_PATH, sheet_name='Tópicos', header=1)
        df1_p = pd.read_excel(F1_PATH, sheet_name='Perguntas computáveis', header=[0, 1])

        df2_m = pd.read_excel(F2_PATH, sheet_name='Médias', header=1)
        df2_t = pd.read_excel(F2_PATH, sheet_name='Tópicos', header=1)
        df2_p = pd.read_excel(F2_PATH, sheet_name='Perguntas computáveis', header=[0, 1])

        q_map = {}
        for idx, (top, sub) in enumerate(df1_p.columns[12:], start=12):
            perfil = sub[sub.find('[')+1 : sub.find(']')]
            quesito = sub[sub.find(']')+1 : ].strip()
            quesito_clean = quesito.replace('Pró atividade profissonal', 'Proatividade profissional')
            q_id = idx - 11
            q_map[q_id] = {
                'id': q_id,
                'ambito': top,
                'perfil': perfil,
                'quesito': quesito_clean,
                'raw_sub': sub,
                'key': f"{perfil}::{quesito_clean}"
            }

        # Add the 11 student questions to metadata
        for sq in STUDENT_QUESTIONS_META:
            q_map[sq['id']] = sq

        student_data = load_student_evaluations()
        print(f"Formulários de Alunos carregados: {len(student_data)} professores avaliados pelos estudantes.")

        final_rows = []
        matched_students = set()

        for df_m, df_t, df_p, src_label in [(df1_m, df1_t, df1_p, 'EI_F1'), (df2_m, df2_t, df2_p, 'F2_EM')]:
            for i, row_m in df_m.iterrows():
                nome = clean_str(row_m['Nome'])
                if not nome:
                    continue

                email = clean_str(row_m['Email'])
                dept = clean_str(row_m['Departamento durante a avaliação'])
                area = clean_str(row_m['Área durante a avaliação'])
                tag = clean_str(row_m['Tags durante a avaliação'])
                lider = clean_str(row_m['Líder'])

                unidade = infer_unit(email, tag)
                segmento = normalize_segment(dept, tag, lider, email)
                cargo = infer_role(nome, dept, lider, email)
                sexo = infer_gender(nome)

                nota_final = clean_val(row_m['Nota Final (com calibração)'])
                if nota_final is None:
                    nota_final = clean_val(row_m['Nota Final (sem calibração)'])
                if nota_final is None:
                    nota_final = clean_val(row_m['Média'])

                media = clean_val(row_m['Média'])
                auto = clean_val(row_m['Autoavaliação'])
                do_lider = clean_val(row_m['Do Líder'])
                outros = clean_val(row_m['Outros'])
                colegas = clean_val(row_m['Colegas'])
                dos_pares = clean_val(row_m['Dos Pares'])
                dos_subord = clean_val(row_m['Dos Subordinados'])

                row_t = df_t.iloc[i]
                topicos = {}
                for amb in ambitos:
                    topicos[amb] = clean_val(row_t[amb]) if amb in row_t else None

                row_p = df_p.iloc[i]
                questoes = {}
                for q_id, meta in q_map.items():
                    if q_id in [sq['id'] for sq in STUDENT_QUESTIONS_META]:
                        continue
                    k = (meta['ambito'], meta['raw_sub'])
                    val = clean_val(row_p[k]) if k in row_p else None
                    questoes[meta['key']] = val

                norm_n = norm_person_name(nome)
                if norm_n in student_data and segmento not in ('EI', 'EFI'):
                    sdata = student_data[norm_n]
                    matched_students.add(norm_n)
                    scores = sdata['all_scores']
                    if scores:
                        mean_subord = round(float(np.mean(scores)), 2)
                        dos_subord = mean_subord
                    for qi, sq_meta in enumerate(STUDENT_QUESTIONS_META):
                        scores_q = sdata['by_q'][qi]
                        questoes[sq_meta['key']] = round(float(np.mean(scores_q)), 2) if scores_q else None

                if src_label == 'EI_F1' or dos_subord is not None:
                    weighted_nf = compute_weighted_final_score_with_students(
                        auto, do_lider, dos_pares, outros, dos_subord
                    )
                    if weighted_nf is not None:
                        nota_final = weighted_nf
                        media = weighted_nf

                amb_por_av, ind_list = build_individual_details(
                    questoes,
                    list(q_map.values()),
                    ambitos,
                    topicos,
                    mode='docentes'
                )
                for amb_k, amb_v in amb_por_av.items():
                    if amb_v.get('geral') is not None:
                        topicos[amb_k] = amb_v['geral']

                final_rows.append({
                    'src': src_label,
                    'nome': nome,
                    'email': email,
                    'dept_raw': dept,
                    'area_raw': area,
                    'tag_raw': tag,
                    'lider_raw': lider,
                    'nota_final': nota_final,
                    'media': media,
                    'autoavaliação': auto,
                    'do_líder': do_lider,
                    'outros': outros,
                    'colegas': colegas,
                    'dos_pares': dos_pares,
                    'dos_subordinados': dos_subord,
                    'topicos': topicos,
                    'questoes': questoes,
                    'ambitos_por_avaliador': amb_por_av,
                    'indicadores': ind_list,
                    'unidade': unidade,
                    'segmento': segmento,
                    'sexo': sexo,
                    'cargo': cargo,
                    'nivel': get_performance_level(nota_final)
                })

        # Add missing evaluated teachers from students CSV if not already present
        for norm_n, sdata in student_data.items():
            if norm_n not in matched_students:
                raw_name = sdata['raw_name']
                all_s = sdata['all_scores']
                overall_avg = round(float(np.mean(all_s)), 2) if all_s else None

                q_dict = {}
                for qi, sq_meta in enumerate(STUDENT_QUESTIONS_META):
                    scores_q = sdata['by_q'][qi]
                    q_dict[sq_meta['key']] = round(float(np.mean(scores_q)), 2) if scores_q else None

                comp_ensino = [q_dict[m['key']] for m in STUDENT_QUESTIONS_META[:3] if q_dict.get(m['key']) is not None]
                comp_aprend = [q_dict[m['key']] for m in STUDENT_QUESTIONS_META[3:9] if q_dict.get(m['key']) is not None]
                papel_form = [q_dict[m['key']] for m in STUDENT_QUESTIONS_META[9:11] if q_dict.get(m['key']) is not None]

                topicos = {
                    'Compromisso com a aprendizagem': round(float(np.mean(comp_aprend)), 2) if comp_aprend else None,
                    'Compromisso com ensino': round(float(np.mean(comp_ensino)), 2) if comp_ensino else None,
                    'Crescimento pessoal e profissional': None,
                    'Integração com a instituição': None,
                    'Papel como formador': round(float(np.mean(papel_form)), 2) if papel_form else None,
                }

                amb_por_av, ind_list = build_individual_details(
                    q_dict,
                    list(q_map.values()),
                    ambitos,
                    topicos,
                    mode='docentes'
                )

                email_alias = f"{raw_name.split()[0].lower()}.{raw_name.split()[-1].lower()}@everestrj.net.br"
                final_rows.append({
                    'src': 'Alunos_Forms',
                    'nome': raw_name,
                    'email': email_alias,
                    'dept_raw': 'FUNDAMENTAL 2 - DOCENTE',
                    'area_raw': 'Pedagógico',
                    'tag_raw': 'RJ - F2',
                    'lider_raw': 'Reinaldo Silva',
                    'nota_final': overall_avg,
                    'media': overall_avg,
                    'autoavaliação': None,
                    'do_líder': None,
                    'outros': None,
                    'colegas': None,
                    'dos_pares': None,
                    'dos_subordinados': overall_avg,
                    'topicos': topicos,
                    'questoes': q_dict,
                    'ambitos_por_avaliador': amb_por_av,
                    'indicadores': ind_list,
                    'unidade': 'Rio de Janeiro',
                    'segmento': 'EFII',
                    'sexo': infer_gender(raw_name),
                    'cargo': 'Docentes',
                    'nivel': get_performance_level(overall_avg)
                })
    except (PermissionError, FileNotFoundError):
        print("Carregando base de Docentes a partir do dashboard_data.json existente...")
        with open(OUTPUT_JSON, 'r', encoding='utf-8') as f_existing:
            existing_payload = json.load(f_existing)
        q_map = {q['id']: q for q in existing_payload['metadata']['questoes_meta']}
        raw_avaliados = existing_payload['avaliados']

        # Integrate Educação Física instrument (src/data/raw/educacao_fisica.xlsx)
        ed_fisica_rows = load_educacao_fisica_evaluations()
        if ed_fisica_rows:
            print(f"Planilha de Educação Física carregada: {len(ed_fisica_rows)} professores avaliados.")
            by_norm_name = {norm_person_name(r.get('nome')): r for r in raw_avaliados}
            for ed in ed_fisica_rows:
                n_ed = norm_person_name(ed['nome'])
                if n_ed in by_norm_name:
                    target = by_norm_name[n_ed]
                    target['email'] = ed['email'] or target.get('email')
                    target['lider_raw'] = ed['lider_raw'] or target.get('lider_raw')
                    if ed['tag_raw']:
                        target['tag_raw'] = ed['tag_raw']
                    target['autoavaliação'] = ed['autoavaliação']
                    target['do_líder'] = ed['do_líder']
                    target['outros'] = ed['outros']
                    target['colegas'] = ed['colegas']
                    target['dos_pares'] = ed['dos_pares']
                    target['nota_final'] = ed['nota_final']
                    target['media'] = ed['media']
                    target['nivel'] = get_performance_level(ed['nota_final'])
                    if target.get('src') == 'Alunos_Forms':
                        target['src'] = 'EI_F1'
                    for tk, tv in ed['topicos'].items():
                        target['topicos'][tk] = tv
                    # Replace non-student questions with the official Educação Física instrument questions
                    for qk in list(target['questoes'].keys()):
                        if not qk.startswith('Alunos::'):
                            target['questoes'][qk] = ed['questoes'].get(qk)
                else:
                    unidade_ed = infer_unit(ed['email'], ed['tag_raw'])
                    seg_ed = normalize_segment(ed['dept_raw'], ed['tag_raw'], ed['lider_raw'], ed['email'])
                    q_full = {m['key']: ed['questoes'].get(m['key']) for m in q_map.values()}
                    raw_avaliados.append({
                        'src': 'Ed_Fisica',
                        'nome': ed['nome'],
                        'email': ed['email'],
                        'dept_raw': ed['dept_raw'],
                        'area_raw': ed['area_raw'],
                        'tag_raw': ed['tag_raw'],
                        'lider_raw': ed['lider_raw'],
                        'nota_final': ed['nota_final'],
                        'media': ed['media'],
                        'autoavaliação': ed['autoavaliação'],
                        'do_líder': ed['do_líder'],
                        'outros': ed['outros'],
                        'colegas': ed['colegas'],
                        'dos_pares': ed['dos_pares'],
                        'dos_subordinados': None,
                        'topicos': ed['topicos'],
                        'questoes': q_full,
                        'unidade': unidade_ed,
                        'segmento': seg_ed,
                        'sexo': infer_gender(ed['nome']),
                        'cargo': 'Docentes',
                        'nivel': get_performance_level(ed['nota_final'])
                    })

        # Pre-merge Larissa Souza Rosa Farinazzo if split into 2 rows (EI_F1 + F2_EM)
        larissa_rows = [x for x in raw_avaliados if x.get('nome') == 'Larissa Souza Rosa Farinazzo']
        larissa_f_sec = None
        if len(larissa_rows) > 1:
            larissa_f_main = next((x for x in larissa_rows if x.get('do_líder') is not None), larissa_rows[0])
            larissa_f_sec = next((x for x in larissa_rows if x is not larissa_f_main), None)
            if larissa_f_main and larissa_f_sec:
                larissa_f_main['outros'] = larissa_f_sec.get('outros', 2.17)
                for k, v2 in (larissa_f_sec.get('questoes') or {}).items():
                    if k.startswith('Psicologos e Pares::') and v2 is not None:
                        v1 = larissa_f_main['questoes'].get(k)
                        larissa_f_main['questoes'][k] = round((v1 + v2) / 2.0, 2) if v1 is not None else v2
                nf_lf = round(
                    0.25 * (larissa_f_main.get('autoavaliação') or 0)
                    + 0.45 * (larissa_f_main.get('do_líder') or 0)
                    + 0.15 * (larissa_f_main.get('dos_pares') or 0)
                    + 0.15 * (larissa_f_main.get('outros') or 0),
                    2
                )
                larissa_f_main['nota_final'] = nf_lf
                larissa_f_main['media'] = nf_lf
                larissa_f_main['nivel'] = get_performance_level(nf_lf)
                larissa_f_main['src'] = 'F2_EM'
                larissa_f_main['segmento'] = 'EFI'

        final_rows = []
        for r in raw_avaliados:
            # 1. Skip Viviane's blank duplicate row (nota_final is None)
            if r.get('nome') == 'Viviane da Silva Moreira Miquelao' and r.get('nota_final') is None:
                continue
            # 2. Skip Rayane's redundant second row (already merged into her EFI row)
            if r.get('nome') == 'Rayane da Costa Padilha Cavalcante' and r.get('segmento') == 'Geral / Transversal':
                continue
            # 3. Skip Larissa Souza Rosa Farinazzo's partial second row (already merged above)
            if r is larissa_f_sec:
                continue
            # 4. Skip Larissa de Oliveira Haag's partial orphan row (no leader and no autoavaliação)
            if r.get('nome') == 'Larissa de Oliveira Haag' and r.get('do_líder') is None and r.get('autoavaliação') is None:
                continue

            # Fix Fernando Pisani Ficha 1 (EI_F1 sheet with Reinaldo & EFII students) -> segment EFII
            if r.get('nome') == 'Fernando Pisani de Azevedo' and r.get('src') == 'EI_F1':
                r['segmento'] = 'EFII'

            # Strict safeguard: EI and EFI never have student (Alunos) evaluations
            if r.get('segmento') in ('EI', 'EFI'):
                r['dos_subordinados'] = None
                if 'questoes' in r and isinstance(r['questoes'], dict):
                    for k in list(r['questoes'].keys()):
                        if k.startswith('Alunos::'):
                            r['questoes'][k] = None

            meta_for_row = (
                [m for m in q_map.values() if m['perfil'] != 'Alunos']
                if r.get('segmento') in ('EI', 'EFI')
                else list(q_map.values())
            )

            # Incorporate official student-weighted formula (25% Auto, 45% Líder, 10% Alunos, 10% Pares, 10% Outros)
            # for EFII/EM teachers (src == 'EI_F1' or records with dos_subordinados)
            if (r.get('src') in ('EI_F1', 'Alunos_Forms') or r.get('dos_subordinados') is not None) and r.get('segmento') not in ('EI', 'EFI'):
                weighted_nf = compute_weighted_final_score_with_students(
                    r.get('autoavaliação'),
                    r.get('do_líder'),
                    r.get('dos_pares'),
                    r.get('outros'),
                    r.get('dos_subordinados')
                )
                if weighted_nf is not None:
                    r['nota_final'] = weighted_nf
                    r['media'] = weighted_nf
                    r['nivel'] = get_performance_level(weighted_nf)

            amb_por_av, ind_list = build_individual_details(
                r.get('questoes', {}),
                meta_for_row,
                ambitos,
                r.get('topicos', {}),
                mode='docentes'
            )
            if r.get('dos_subordinados') is not None and r.get('segmento') not in ('EI', 'EFI'):
                for amb_k, amb_v in amb_por_av.items():
                    if amb_v.get('geral') is not None:
                        r['topicos'][amb_k] = amb_v['geral']
            elif r.get('nome') == 'Larissa Souza Rosa Farinazzo':
                for amb_k, amb_v in amb_por_av.items():
                    if amb_v.get('geral') is not None:
                        r['topicos'][amb_k] = amb_v['geral']
            r['ambitos_por_avaliador'] = amb_por_av
            r['indicadores'] = ind_list
            final_rows.append(r)

    # 2. Parse Leadership & Specialists files
    coords_parsed = parse_generic_instrument(COORD_XLSX, COORD_MAP, 'coordenadores_ciclo')
    psicos_parsed = parse_generic_instrument(PSICO_XLSX, PSICO_MAP, 'psicologos')
    sup_ingles_parsed = parse_generic_instrument(SUP_INGLES_XLSX, INGLES_MAP, 'gestao_ingles')
    coord_ingles_parsed = parse_generic_instrument(COORD_INGLES_XLSX, INGLES_MAP, 'gestao_ingles')
    inst_parsed = parse_generic_instrument(DISC_INST_XLSX, INST_MAP, 'disciplinas_institucionais')

    # Merge Gestão de Inglês (3 supervisores + 2 coordenadores gerais)
    gestao_ingles_records = sup_ingles_parsed['records'] + coord_ingles_parsed['records']
    gestao_ingles_pheaders = sup_ingles_parsed['p_headers']
    gestao_ingles_theaders = sup_ingles_parsed['t_headers']

    coordenadores_records = coords_parsed['records']
    psicologos_records = psicos_parsed['records']
    institucionais_records = inst_parsed['records']

    print(f"Novos instrumentos processados:")
    print(f"  Coordenadores de Ciclo: {len(coordenadores_records)} avaliados")
    print(f"  Psicólogos: {len(psicologos_records)} avaliados")
    print(f"  Gestão de Inglês: {len(gestao_ingles_records)} avaliados (3 supervisores + 2 coordenadores)")
    print(f"  Disciplinas Institucionais: {len(institucionais_records)} avaliado")

    # Helper calculations for Docentes
    def compute_rankings(subset):
        if not subset:
            return {'todos': [], 'top5': [], 'bottom5': []}
        quesito_stats = []
        for q_id, meta in q_map.items():
            k = meta['key']
            vals = [r['questoes'].get(k) for r in subset if r['questoes'].get(k) is not None]
            if vals:
                quesito_stats.append({
                    'id': meta['id'],
                    'ambito': meta['ambito'],
                    'perfil': meta['perfil'],
                    'quesito': meta['quesito'],
                    'media': round(float(np.mean(vals)), 2),
                    'total_respostas': len(vals)
                })
        sorted_desc = sorted(quesito_stats, key=lambda x: x['media'], reverse=True)
        top5 = []
        seen_top = set()
        for item in sorted_desc:
            if item['quesito'] not in seen_top:
                seen_top.add(item['quesito'])
                top5.append(item)
                if len(top5) == 5:
                    break

        sorted_asc = sorted(quesito_stats, key=lambda x: x['media'])
        bottom5 = []
        seen_bottom = set()
        for item in sorted_asc:
            if item['quesito'] not in seen_bottom:
                seen_bottom.add(item['quesito'])
                bottom5.append(item)
                if len(bottom5) == 5:
                    break

        return {
            'todos': sorted_desc,
            'top5': top5,
            'bottom5': bottom5
        }

    def compute_ambito_means(subset):
        if not subset:
            return {a: 0.0 for a in ambitos}
        res = {}
        for a in ambitos:
            vals = [r['topicos'].get(a) for r in subset if r['topicos'].get(a) is not None]
            res[a] = round(float(np.mean(vals)), 2) if vals else 0.0
        return res

    def compute_ambito_evaluator_means(subset):
        res = {}
        for a in ambitos:
            l_vals = [
                r.get('ambitos_por_avaliador', {}).get(a, {}).get('lider')
                for r in subset
                if r.get('ambitos_por_avaliador', {}).get(a, {}).get('lider') is not None
            ]
            au_vals = [
                r.get('ambitos_por_avaliador', {}).get(a, {}).get('autoavaliacao')
                for r in subset
                if r.get('ambitos_por_avaliador', {}).get(a, {}).get('autoavaliacao') is not None
            ]
            p_vals = [
                r.get('ambitos_por_avaliador', {}).get(a, {}).get('pares_psicologos')
                for r in subset
                if r.get('ambitos_por_avaliador', {}).get(a, {}).get('pares_psicologos') is not None
            ]
            al_vals = [
                r.get('ambitos_por_avaliador', {}).get(a, {}).get('alunos')
                for r in subset
                if r.get('ambitos_por_avaliador', {}).get(a, {}).get('alunos') is not None
            ]
            g_vals = [r['topicos'].get(a) for r in subset if r['topicos'].get(a) is not None]

            res[a] = {
                'lider': round(float(np.mean(l_vals)), 2) if l_vals else None,
                'autoavaliacao': round(float(np.mean(au_vals)), 2) if au_vals else None,
                'pares_psicologos': round(float(np.mean(p_vals)), 2) if p_vals else None,
                'alunos': round(float(np.mean(al_vals)), 2) if al_vals else None,
                'geral': round(float(np.mean(g_vals)), 2) if g_vals else None
            }
        return res

    def compute_evaluator_profiles(subset):
        if not subset:
            return {
                'coordenador': 0.0,
                'autoavaliação': 0.0,
                'pares': 0.0,
                'outros_psicólogo': 0.0,
                'alunos': 0.0
            }
        def safe_mean(key):
            v = [r.get(key) for r in subset if r.get(key) is not None]
            return round(float(np.mean(v)), 2) if v else 0.0

        return {
            'coordenador': safe_mean('do_líder'),
            'autoavaliação': safe_mean('autoavaliação'),
            'pares': safe_mean('dos_pares'),
            'outros_psicólogo': safe_mean('outros'),
            'alunos': safe_mean('dos_subordinados')
        }

    def compute_performance_matrix(subset):
        cycles = ['EI', 'EFI', 'EFII', 'EM', 'Geral / Transversal', 'Total']
        levels = ['Inicial', 'Em Desenvolvimento', 'Atuação Adequada', 'Referência']
        matrix = {c: {lvl: {'count': 0, 'pct': 0.0, 'total_ciclo': 0} for lvl in levels} for c in cycles}

        for c in cycles:
            sub = subset if c == 'Total' else [r for r in subset if r['segmento'] == c]
            total_sub = len(sub)
            for lvl in levels:
                cnt = sum(1 for r in sub if r['nivel'] == lvl)
                pct = round((cnt / total_sub * 100), 1) if total_sub > 0 else 0.0
                matrix[c][lvl] = {'count': cnt, 'pct': pct, 'total_ciclo': total_sub}
            if total_sub > 0:
                diff_pct = round(100.0 - sum(matrix[c][l]['pct'] for l in levels), 1)
                if diff_pct != 0:
                    max_lvl = max(levels, key=lambda l: matrix[c][l]['count'])
                    matrix[c][max_lvl]['pct'] = round(matrix[c][max_lvl]['pct'] + diff_pct, 1)
        return matrix

    def compute_cargo_summary(subset):
        cargos = ['Docentes', 'Coordenação / Direção', 'Psicólogos', 'Supervisão de Inglês']
        res = {}
        for c in cargos:
            sub = [r for r in subset if r['cargo'] == c]
            scores = [r['nota_final'] for r in sub if r['nota_final'] is not None]
            res[c] = {
                'total': len(sub),
                'media_geral': round(float(np.mean(scores)), 2) if scores else 0.0,
                'ambitos': compute_ambito_means(sub),
                'rankings': compute_rankings(sub)
            }

        # Dedicated summary for Alunos
        sub_alunos = [r for r in subset if r.get('dos_subordinados') is not None]
        aluno_scores = [r['dos_subordinados'] for r in sub_alunos if r['dos_subordinados'] is not None]
        q_alunos_ensino = [r['questoes'].get(m['key']) for r in sub_alunos for m in STUDENT_QUESTIONS_META[:3] if r['questoes'].get(m['key']) is not None]
        q_alunos_aprend = [r['questoes'].get(m['key']) for r in sub_alunos for m in STUDENT_QUESTIONS_META[3:9] if r['questoes'].get(m['key']) is not None]
        q_alunos_form = [r['questoes'].get(m['key']) for r in sub_alunos for m in STUDENT_QUESTIONS_META[9:11] if r['questoes'].get(m['key']) is not None]

        res['Alunos'] = {
            'total': len(sub_alunos),
            'media_geral': round(float(np.mean(aluno_scores)), 2) if aluno_scores else 0.0,
            'ambitos': {
                'Compromisso com o ensino': round(float(np.mean(q_alunos_ensino)), 2) if q_alunos_ensino else 0.0,
                'Compromisso com a aprendizagem': round(float(np.mean(q_alunos_aprend)), 2) if q_alunos_aprend else 0.0,
                'Crescimento pessoal e profissional': 0.0,
                'Integração com a instituição': 0.0,
                'Papel como formador': round(float(np.mean(q_alunos_form)), 2) if q_alunos_form else 0.0,
            },
            'rankings': compute_rankings(sub_alunos)
        }
        return res

    # Helper to calculate normalized leadership/specialist ambitos for a cycle
    def get_role_ambitos_for_cycle(records_pool, scope_name, cycle_seg):
        # Filter by unit scope
        if scope_name != 'Todas':
            recs = [r for r in records_pool if r['unidade'] == scope_name]
        else:
            recs = records_pool

        # Filter by cycle
        if cycle_seg != 'Total':
            recs = [r for r in recs if cycle_seg in r.get('segmentos_list', [r.get('segmento')])]

        if not recs:
            return {}

        all_topic_keys = set()
        for r in recs:
            all_topic_keys.update(r['topicos'].keys())

        result = {}
        for k in all_topic_keys:
            vals = [r['topicos'][k] for r in recs if r['topicos'].get(k) is not None]
            if vals:
                mean_v = round(float(np.mean(vals)), 2)
                result[k] = mean_v

        # Provide normalized cross-keys so radar and comparative charts match both naming styles
        if 'Compromisso com o ensino' in result:
            result['Compromisso com ensino'] = result['Compromisso com o ensino']
        if 'Compromisso com a Aprendizagem' in result:
            result['Compromisso com a aprendizagem'] = result['Compromisso com a Aprendizagem']
        if 'Integração com a Instituição' in result:
            result['Integração com a instituição'] = result['Integração com a Instituição']
        if 'Papel como Formador' in result:
            result['Papel como formador'] = result['Papel como Formador']
        # Map Gestão do Ciclo Escolar to Crescimento pessoal e profissional as 5th dimension for spider chart
        if 'Gestão do Ciclo Escolar' in result and 'Crescimento pessoal e profissional' not in result:
            result['Crescimento pessoal e profissional'] = result['Gestão do Ciclo Escolar']

        return result

    scopes = {
        'Todas': final_rows,
        'Curitiba': [r for r in final_rows if r['unidade'] == 'Curitiba'],
        'Rio de Janeiro': [r for r in final_rows if r['unidade'] == 'Rio de Janeiro']
    }

    analytics_by_scope = {}
    for scope_name, scope_rows in scopes.items():
        total_p = len(scope_rows)
        fem_count = sum(1 for r in scope_rows if r['sexo'] == 'Feminino')
        masc_count = sum(1 for r in scope_rows if r['sexo'] == 'Masculino')

        # Filter leadership records for this scope
        if scope_name == 'Todas':
            scope_coords = coordenadores_records
            scope_psicos = psicologos_records
            scope_ingles = gestao_ingles_records
            scope_inst = institucionais_records
        else:
            scope_coords = [r for r in coordenadores_records if r['unidade'] == scope_name]
            scope_psicos = [r for r in psicologos_records if r['unidade'] == scope_name]
            scope_ingles = [r for r in gestao_ingles_records if r['unidade'] == scope_name]
            scope_inst = [r for r in institucionais_records if r['unidade'] == scope_name]

        ciclos_data = {}
        for seg in ['EI', 'EFI', 'EFII', 'EM', 'Geral / Transversal']:
            seg_rows = [r for r in scope_rows if r['segmento'] == seg]
            ciclos_data[seg] = {
                'total': len(seg_rows),
                'media_geral': round(float(np.mean([r['nota_final'] for r in seg_rows if r['nota_final'] is not None])), 2) if seg_rows else 0.0,
                'ambitos': compute_ambito_means(seg_rows),
                'ambitos_por_avaliador': compute_ambito_evaluator_means(seg_rows),
                'perfis_avaliadores': compute_evaluator_profiles(seg_rows),
                'rankings': compute_rankings(seg_rows),
                'cargos': {
                    'Docentes': compute_ambito_means([r for r in seg_rows if r['cargo'] == 'Docentes']),
                    'Coordenação': get_role_ambitos_for_cycle(coordenadores_records, scope_name, seg),
                    'Psicólogos': get_role_ambitos_for_cycle(psicologos_records, scope_name, seg),
                    'Supervisão de Inglês': get_role_ambitos_for_cycle(gestao_ingles_records, scope_name, seg),
                }
            }

        # Comparative between cycles (Slide 27: Coordenação, Slide 28: Psicólogos, Slide 29: Docentes)
        comparativo_ciclos = {
            'Docentes': {
                seg: compute_ambito_means([r for r in scope_rows if r['segmento'] == seg and r['cargo'] == 'Docentes'])
                for seg in ['EI', 'EFI', 'EFII', 'EM']
            },
            'Coordenação': {
                seg: get_role_ambitos_for_cycle(coordenadores_records, scope_name, seg)
                for seg in ['EI', 'EFI', 'EFII', 'EM']
            },
            'Psicólogos': {
                seg: get_role_ambitos_for_cycle(psicologos_records, scope_name, seg)
                for seg in ['EI', 'EFI', 'EFII', 'EM']
            }
        }
        comparativo_ciclos['Docentes']['Total Geral'] = compute_ambito_means([r for r in scope_rows if r['cargo'] == 'Docentes'])
        comparativo_ciclos['Coordenação']['Total Geral'] = get_role_ambitos_for_cycle(coordenadores_records, scope_name, 'Total')
        comparativo_ciclos['Psicólogos']['Total Geral'] = get_role_ambitos_for_cycle(psicologos_records, scope_name, 'Total')

        # Dedicated analytics for the new tab "Gestão & Especialistas"
        gestao_analytics = {
            'coordenadores_ciclo': compute_instrument_analytics(scope_coords, coords_parsed['p_headers'], coords_parsed['t_headers']),
            'psicologos': compute_instrument_analytics(scope_psicos, psicos_parsed['p_headers'], psicos_parsed['t_headers']),
            'gestao_ingles': compute_instrument_analytics(scope_ingles, gestao_ingles_pheaders, gestao_ingles_theaders),
            'disciplinas_institucionais': compute_instrument_analytics(scope_inst, inst_parsed['p_headers'], inst_parsed['t_headers']),
        }

        analytics_by_scope[scope_name] = {
            'kpis': {
                'total_avaliados': total_p,
                'media_geral': round(float(np.mean([r['nota_final'] for r in scope_rows if r['nota_final'] is not None])), 2) if scope_rows else 0.0,
                'mulheres_count': fem_count,
                'homens_count': masc_count,
                'mulheres_pct': round((fem_count / total_p * 100), 1) if total_p > 0 else 0.0,
                'homens_pct': round((masc_count / total_p * 100), 1) if total_p > 0 else 0.0,
            },
            'distribuicao_ciclo': {
                seg: sum(1 for r in scope_rows if r['segmento'] == seg)
                for seg in ['EI', 'EFI', 'EFII', 'EM', 'Geral / Transversal']
            },
            'matriz_desempenho': compute_performance_matrix(scope_rows),
            'cargos_resumo': compute_cargo_summary(scope_rows),
            'ambitos_gerais': compute_ambito_means(scope_rows),
            'perfis_avaliadores_geral': compute_evaluator_profiles(scope_rows),
            'rankings_gerais': compute_rankings(scope_rows),
            'ciclos': ciclos_data,
            'comparativo_ciclos': comparativo_ciclos,
            'gestao_especialistas': gestao_analytics
        }

    output_payload = {
        'metadata': {
            'titulo': 'Avaliação Institucional 360º (2026) - Rede Semper Altius',
            'colegios': ['Colégio Everest Curitiba', 'Colégio Everest Rio de Janeiro'],
            'total_avaliados': len(final_rows),
            'ano': 2026,
            'escala': {'min': 1.0, 'max': 4.0, 'tipo': '1.00 a 4.00'},
            'ambitos': ambitos,
            'questoes_meta': list(q_map.values()),
            'cortes': {
                'Inicial': {'min': 0.0, 'max': 2.49, 'label': 'Inicial [I]', 'cor': '#EF4444'},
                'Em Desenvolvimento': {'min': 2.50, 'max': 2.99, 'label': 'Em Desenvolvimento [ED]', 'cor': '#F59E0B'},
                'Atuação Adequada': {'min': 3.00, 'max': 3.59, 'label': 'Atuação Adequada [AA]', 'cor': '#3B82F6'},
                'Referência': {'min': 3.60, 'max': 4.00, 'label': 'Referência [REF]', 'cor': '#10B981'}
            },
            'gestao_especialistas_meta': {
                'ambitos_coordenadores': coords_parsed['t_headers'],
                'ambitos_psicologos': psicos_parsed['t_headers'],
                'ambitos_gestao_ingles': gestao_ingles_theaders,
                'ambitos_disciplinas_institucionais': inst_parsed['t_headers'],
                'questoes_coordenadores': coords_parsed['p_headers'],
                'questoes_psicologos': psicos_parsed['p_headers'],
                'questoes_gestao_ingles': gestao_ingles_pheaders,
                'questoes_disciplinas_institucionais': inst_parsed['p_headers'],
            }
        },
        'scopes': analytics_by_scope,
        'avaliados': final_rows,
        'gestao_especialistas': {
            'coordenadores_ciclo': coordenadores_records,
            'psicologos': psicologos_records,
            'gestao_ingles': gestao_ingles_records,
            'disciplinas_institucionais': institucionais_records
        }
    }

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(output_payload, f, ensure_ascii=False, indent=2)

    print(f"JSON gerado com sucesso em: {OUTPUT_JSON} ({os.path.getsize(OUTPUT_JSON)} bytes)")
    print(f"Total de avaliados docentes mantido: {len(final_rows)}")
    print(f"Total coordenadores ciclo: {len(coordenadores_records)}")
    print(f"Total psicólogos: {len(psicologos_records)}")
    print(f"Total gestão inglês: {len(gestao_ingles_records)}")
    print(f"Total disciplinas institucionais: {len(institucionais_records)}")
    print("ETL concluído com 100% de sucesso!")

if __name__ == '__main__':
    run()
