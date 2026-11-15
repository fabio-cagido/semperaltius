import os
import json
import pandas as pd
import numpy as np

# File paths
F1_PATH = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
F2_PATH = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'
OUTPUT_JSON = r'C:\Users\fabio\.gemini\antigravity\scratch\everest-dashboard-2026\src\data\dashboard_data.json'

def process():
    print("=" * 80)
    print("PROCESSAMENTO E VALIDAÇÃO DOS DADOS - AVALIAÇÃO INSTITUCIONAL 2026")
    print("=" * 80)

    # 1. Read files
    df1_m = pd.read_excel(F1_PATH, sheet_name='Médias', header=1)
    df1_t = pd.read_excel(F1_PATH, sheet_name='Tópicos', header=1)
    df1_p = pd.read_excel(F1_PATH, sheet_name='Perguntas computáveis', header=[0, 1])

    df2_m = pd.read_excel(F2_PATH, sheet_name='Médias', header=1)
    df2_t = pd.read_excel(F2_PATH, sheet_name='Tópicos', header=1)
    df2_p = pd.read_excel(F2_PATH, sheet_name='Perguntas computáveis', header=[0, 1])

    print(f"Planilha 1 (F1): {len(df1_m)} linhas")
    print(f"Planilha 2 (F2): {len(df2_m)} linhas")

    # Let's inspect questions structure
    ambitos = [
        'Compromisso com a aprendizagem',
        'Compromisso com ensino',
        'Crescimento pessoal e profissional',
        'Integração com a instituição',
        'Papel como formador'
    ]

    # Map question columns
    q_cols_1 = df1_p.columns[12:]
    q_cols_2 = df2_p.columns[12:]

    # Clean string names
    # Create unified question definitions: (ambito, perfil, quesito_nome, full_key)
    questions_meta = []
    for top, sub in q_cols_1:
        # sub is like "[Coordenadores] Instrução diferenciada"
        perfil = sub[sub.find('[')+1 : sub.find(']')]
        quesito = sub[sub.find(']')+1 : ].strip()
        # standardize minor typos
        quesito_norm = quesito.replace('Pró atividade profissonal', 'Proatividade profissional')
        questions_meta.append({
            'ambito': top,
            'perfil': perfil,
            'quesito': quesito_norm,
            'col_name_f1': (top, sub),
        })

    print(f"Total de questões computáveis mapeadas: {len(questions_meta)}")

    # Let's verify score ranges across all questions and sheets
    all_q_vals = []
    for df_p in [df1_p, df2_p]:
        for col in df_p.columns[12:]:
            vals = pd.to_numeric(df_p[col], errors='coerce').replace(0, np.nan).dropna().tolist()
            all_q_vals.extend(vals)

    min_val = min(all_q_vals)
    max_val = max(all_q_vals)
    print(f"\nEscala de notas dos quesitos (sem zeros): Mínimo = {min_val}, Máximo = {max_val}")

    return True

if __name__ == '__main__':
    process()
