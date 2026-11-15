import os
import json
import re
import csv
import unicodedata
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F1_PATH = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
F2_PATH = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'
CTBA_STUDENTS_CSV = os.path.join(BASE_DIR, 'src', 'data', 'raw', 'respostas_alunos_ctba.csv')
RJ_STUDENTS_CSV = os.path.join(BASE_DIR, 'src', 'data', 'raw', 'respostas_alunos_rj.csv')
OUTPUT_JSON = os.path.join(BASE_DIR, 'src', 'data', 'dashboard_data.json')

MALE_NAMES = {
    'allander', 'arlindo', 'bernardo', 'carlos', 'danilo', 'david', 'dennis', 'euclides',
    'fernando', 'gabriel', 'guilherme', 'ivan', 'joao', 'jonas', 'juliano', 'lucas',
    'luiz', 'marcio', 'raphael', 'rene', 'rodrigo', 'silvio', 'thales', 'wellington',
    'yuri', 'alex', 'darlan', 'felipe', 'pedro'
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

def run():
    print("=" * 80)
    print("GERANDO DATASET FINAL INTEGRADO COM RESPOSTAS DOS ALUNOS 2026")
    print("=" * 80)

    # 1. Load sheets from Qulture.Rocks
    df1_m = pd.read_excel(F1_PATH, sheet_name='Médias', header=1)
    df1_t = pd.read_excel(F1_PATH, sheet_name='Tópicos', header=1)
    df1_p = pd.read_excel(F1_PATH, sheet_name='Perguntas computáveis', header=[0, 1])

    df2_m = pd.read_excel(F2_PATH, sheet_name='Médias', header=1)
    df2_t = pd.read_excel(F2_PATH, sheet_name='Tópicos', header=1)
    df2_p = pd.read_excel(F2_PATH, sheet_name='Perguntas computáveis', header=[0, 1])

    ambitos = [
        'Compromisso com a aprendizagem',
        'Compromisso com ensino',
        'Crescimento pessoal e profissional',
        'Integração com a instituição',
        'Papel como formador'
    ]

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

    def extract_rows(df_m, df_t, df_p, src):
        rows = []
        for i in range(len(df_m)):
            m_row = df_m.iloc[i]
            t_row = df_t.iloc[i]
            p_row = df_p.iloc[i]

            email = str(m_row['Email']).strip().lower()
            nome = str(m_row['Nome']).strip()
            dept = clean_str(m_row['Departamento durante a avaliação'])
            area = clean_str(m_row['Área durante a avaliação'])
            tag = clean_str(m_row['Tags durante a avaliação'])
            leader = clean_str(m_row['Líder'])

            nota_final = clean_val(m_row['Nota Final (sem calibração)'])
            media = clean_val(m_row['Média'])
            auto = clean_val(m_row['Autoavaliação'])
            lider = clean_val(m_row['Do Líder'])
            outros = clean_val(m_row['Outros'])
            colegas = clean_val(m_row['Colegas'])
            pares = clean_val(m_row['Dos Pares'])
            subord = clean_val(m_row['Dos Subordinados'])

            topicos = {
                'Compromisso com a aprendizagem': clean_val(t_row.get('Compromisso com a aprendizagem')),
                'Compromisso com ensino': clean_val(t_row.get('Compromisso com ensino')),
                'Crescimento pessoal e profissional': clean_val(t_row.get('Crescimento pessoal e profissional')),
                'Integração com a instituição': clean_val(t_row.get('Integração com a instituição')),
                'Papel como formador': clean_val(t_row.get('Papel como formador')),
            }

            questoes = {}
            for q_id, meta in q_map.items():
                if meta['perfil'] != 'Alunos':
                    col_idx = q_id + 11
                    questoes[meta['key']] = clean_val(p_row.iloc[col_idx])

            rows.append({
                'src': src,
                'nome': nome,
                'email': email,
                'dept_raw': dept,
                'area_raw': area,
                'tag_raw': tag,
                'lider_raw': leader,
                'nota_final': nota_final,
                'media': media,
                'autoavaliação': auto,
                'do_líder': lider,
                'outros': outros,
                'colegas': colegas,
                'dos_pares': pares,
                'dos_subordinados': subord,
                'topicos': topicos,
                'questoes': questoes
            })
        return rows

    rows_f1 = extract_rows(df1_m, df1_t, df1_p, 'F1')
    rows_f2 = extract_rows(df2_m, df2_t, df2_p, 'F2')

    # Rayane merge logic
    cleaned_rows_f2 = []
    rayane_65 = None
    rayane_66 = None
    for r in rows_f2:
        if 'rayane' in r['email'] or 'rayane' in r['nome'].lower():
            if r['do_líder'] is not None:
                rayane_65 = r
            else:
                rayane_66 = r
        else:
            cleaned_rows_f2.append(r)

    if rayane_65 and rayane_66:
        merged_rayane = dict(rayane_65)
        merged_rayane['email'] = 'rayane.cavalcante@everestrj.net.br'
        merged_rayane['autoavaliação'] = rayane_66['autoavaliação']
        for q_key, val in rayane_66['questoes'].items():
            if val is not None:
                merged_rayane['questoes'][q_key] = val
        scores = [merged_rayane['do_líder'], merged_rayane['colegas'], merged_rayane['autoavaliação']]
        valid_scores = [s for s in scores if s is not None]
        if valid_scores:
            merged_rayane['nota_final'] = round(float(np.mean(valid_scores)), 2)
            merged_rayane['media'] = merged_rayane['nota_final']
        cleaned_rows_f2.append(merged_rayane)

    # Filter out empty Viviane from F1
    final_rows = []
    for r in rows_f1:
        if r['email'] == 'viviane.miquelao@professoreverest.curitiba.br' and r['nota_final'] is None:
            continue
        final_rows.append(r)

    overlap_keep_f1 = {
        'larissa.haag@professoreverest.curitiba.br',
        'larissa.farinazzo@everestrj.net.br',
        'raphael.mota@everestrj.net.br',
        'fernando.azevedo@professoreverest.curitiba.br'
    }
    for r in cleaned_rows_f2:
        if r['email'] in overlap_keep_f1:
            continue
        final_rows.append(r)

    # Add metadata
    for r in final_rows:
        r['unidade'] = infer_unit(r['email'], r['tag_raw'])
        r['segmento'] = normalize_segment(r['dept_raw'], r['tag_raw'], r['lider_raw'], r['email'])
        r['sexo'] = infer_gender(r['nome'])
        r['cargo'] = infer_role(r['nome'], r['dept_raw'], r['lider_raw'], r['email'])
        r['nivel'] = get_performance_level(r['nota_final'])

    # 2. Integrate Student Evaluations
    student_evals = load_student_evaluations()
    print(f"Total de professores com avaliações de alunos carregados: {len(student_evals)}")

    # Update existing teachers with student evaluations
    matched_teachers_count = 0
    for r in final_rows:
        norm = norm_person_name(r['nome'])
        if norm in student_evals:
            matched_teachers_count += 1
            sdata = student_evals[norm]
            overall_student_avg = round(float(np.mean(sdata['all_scores'])), 2)
            r['dos_subordinados'] = overall_student_avg

            # Populate student questions
            for qi in range(11):
                sq_meta = STUDENT_QUESTIONS_META[qi]
                scores_q = sdata['by_q'][qi]
                if scores_q:
                    r['questoes'][sq_meta['key']] = round(float(np.mean(scores_q)), 2)
                else:
                    r['questoes'][sq_meta['key']] = None

    print(f"Professores na base associados às respostas dos alunos: {matched_teachers_count}")

    # Add teachers who only exist in the student survey (Pedro Ramos Losso & Tatiana Brandão Mazzei de Oliveira)
    for norm, sdata in student_evals.items():
        if not any(norm_person_name(r['nome']) == norm for r in final_rows):
            raw_name = sdata['raw_name']
            overall_avg = round(float(np.mean(sdata['all_scores'])), 2)
            q_dict = {}
            for qi in range(11):
                sq_meta = STUDENT_QUESTIONS_META[qi]
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
                'unidade': 'Rio de Janeiro',
                'segmento': 'EFII',
                'sexo': infer_gender(raw_name),
                'cargo': 'Docentes',
                'nivel': get_performance_level(overall_avg)
            })
            print(f"Adicionado professor avaliado pelos alunos: {raw_name} (RJ - EFII) -> Média: {overall_avg}")

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
        top5 = sorted_desc[:5]
        sorted_asc = sorted(quesito_stats, key=lambda x: x['media'])
        bottom5 = sorted_asc[:5]
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

        ciclos_data = {}
        for seg in ['EI', 'EFI', 'EFII', 'EM', 'Geral / Transversal']:
            seg_rows = [r for r in scope_rows if r['segmento'] == seg]
            ciclos_data[seg] = {
                'total': len(seg_rows),
                'media_geral': round(float(np.mean([r['nota_final'] for r in seg_rows if r['nota_final'] is not None])), 2) if seg_rows else 0.0,
                'ambitos': compute_ambito_means(seg_rows),
                'perfis_avaliadores': compute_evaluator_profiles(seg_rows),
                'rankings': compute_rankings(seg_rows),
                'cargos': {
                    'Docentes': compute_ambito_means([r for r in seg_rows if r['cargo'] == 'Docentes']),
                    'Coordenação': compute_ambito_means([r for r in seg_rows if r['cargo'] == 'Coordenação / Direção']),
                    'Psicólogos': compute_ambito_means([r for r in seg_rows if r['cargo'] == 'Psicólogos']),
                }
            }

        comparativo_ciclos = {
            'Docentes': {
                seg: compute_ambito_means([r for r in scope_rows if r['segmento'] == seg and r['cargo'] == 'Docentes'])
                for seg in ['EI', 'EFI', 'EFII', 'EM']
            },
            'Coordenação': {
                seg: compute_ambito_means([r for r in scope_rows if r['segmento'] == seg and r['cargo'] == 'Coordenação / Direção'])
                for seg in ['EI', 'EFI', 'EFII', 'EM']
            },
            'Psicólogos': {
                seg: compute_ambito_means([r for r in scope_rows if r['segmento'] == seg and r['cargo'] == 'Psicólogos'])
                for seg in ['EI', 'EFI', 'EFII', 'EM']
            }
        }
        comparativo_ciclos['Docentes']['Total Geral'] = compute_ambito_means([r for r in scope_rows if r['cargo'] == 'Docentes'])
        comparativo_ciclos['Coordenação']['Total Geral'] = compute_ambito_means([r for r in scope_rows if r['cargo'] == 'Coordenação / Direção'])
        comparativo_ciclos['Psicólogos']['Total Geral'] = compute_ambito_means([r for r in scope_rows if r['cargo'] == 'Psicólogos'])

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
            'comparativo_ciclos': comparativo_ciclos
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
            }
        },
        'scopes': analytics_by_scope,
        'avaliados': final_rows
    }

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(output_payload, f, ensure_ascii=False, indent=2)

    print(f"JSON gerado com sucesso em: {OUTPUT_JSON} ({os.path.getsize(OUTPUT_JSON)} bytes)")
    print(f"Total de avaliados consolidado: {len(final_rows)}")
    print(f"Perfis avaliadores Geral (Alunos): {analytics_by_scope['Todas']['perfis_avaliadores_geral']['alunos']}")
    print(f"Perfis avaliadores Curitiba (Alunos): {analytics_by_scope['Curitiba']['perfis_avaliadores_geral']['alunos']}")
    print(f"Perfis avaliadores Rio de Janeiro (Alunos): {analytics_by_scope['Rio de Janeiro']['perfis_avaliadores_geral']['alunos']}")
    print(f"EFII Curitiba (Alunos): {analytics_by_scope['Curitiba']['ciclos']['EFII']['perfis_avaliadores']['alunos']}")
    print(f"EM Curitiba (Alunos): {analytics_by_scope['Curitiba']['ciclos']['EM']['perfis_avaliadores']['alunos']}")
    print(f"EFII Rio (Alunos): {analytics_by_scope['Rio de Janeiro']['ciclos']['EFII']['perfis_avaliadores']['alunos']}")
    print(f"EM Rio (Alunos): {analytics_by_scope['Rio de Janeiro']['ciclos']['EM']['perfis_avaliadores']['alunos']}")
    print("ETL concluído com 100% de sucesso!")

if __name__ == '__main__':
    run()
