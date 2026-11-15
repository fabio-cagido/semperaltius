import pandas as pd

f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

df1 = pd.read_excel(f1, sheet_name='Médias', header=1)
df2 = pd.read_excel(f2, sheet_name='Médias', header=1)

# Check all participants whose Dept is NaN or DIREÇÃO
df = pd.concat([df1, df2], ignore_index=True)
nan_dept = df[df['Departamento durante a avaliação'].isna() | (df['Departamento durante a avaliação'] == 'DIREÇÃO')]
print(f'Total rows with Dept NaN or DIREÇÃO: {len(nan_dept)}')
for idx, r in nan_dept.iterrows():
    print(f"{r['Nome']} | Email: {r['Email']} | Dept: {r['Departamento durante a avaliação']} | Tags: {r['Tags durante a avaliação']} | Lider: {r['Líder']}")
