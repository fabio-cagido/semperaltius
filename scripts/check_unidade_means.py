import pandas as pd
import numpy as np

f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

df1 = pd.read_excel(f1, sheet_name='Médias', header=1)
df2 = pd.read_excel(f2, sheet_name='Médias', header=1)

df = pd.concat([df1, df2], ignore_index=True)

# Determine Unidade
def get_unit(row):
    email = str(row['Email']).lower()
    tag = str(row['Tags durante a avaliação'])
    if 'curitiba' in email or 'CTBA' in tag:
        return 'Curitiba'
    if 'everestrj' in email or 'everstrj' in email or 'RJ' in tag:
        return 'Rio de Janeiro'
    return 'Unknown'

df['Unidade'] = df.apply(get_unit, axis=1)

# Score columns (replace 0 with NaN)
score_cols = ['Nota Final (sem calibração)', 'Média', 'Autoavaliação', 'Do Líder', 'Outros', 'Colegas', 'Dos Pares', 'Média Sem Autoavaliação', 'Dos Subordinados']
for c in score_cols:
    df[c] = pd.to_numeric(df[c], errors='coerce').replace(0, np.nan)

print('=== MEANS BY UNIDADE ===')
print(df.groupby('Unidade')[score_cols].mean().round(2).to_string())

print('\n=== NON-ZERO / NON-NAN COUNTS BY UNIDADE ===')
print(df.groupby('Unidade')[score_cols].count().to_string())
