import pandas as pd

f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

df1 = pd.read_excel(f1, sheet_name='Médias', header=1)
df2 = pd.read_excel(f2, sheet_name='Médias', header=1)

df = pd.concat([df1.assign(src='F1'), df2.assign(src='F2')], ignore_index=True)

# Curitiba
ctba = df[df['Email'].str.contains('curitiba', case=False, na=False)]
print('=== Curitiba Departments ===')
print(ctba['Departamento durante a avaliação'].value_counts(dropna=False))

print('\n=== Curitiba Participants with Dept NaN or DIREÇÃO ===')
print(ctba[ctba['Departamento durante a avaliação'].isna() | (ctba['Departamento durante a avaliação'] == 'DIREÇÃO')][['Nome', 'Email', 'Tags durante a avaliação', 'Líder']].to_string())

# RJ
rj = df[df['Email'].str.contains('rj', case=False, na=False)]
print('\n=== RJ Departments ===')
print(rj['Departamento durante a avaliação'].value_counts(dropna=False))

print('\n=== RJ Participants with Dept NaN ===')
print(rj[rj['Departamento durante a avaliação'].isna()][['Nome', 'Email', 'Tags durante a avaliação', 'Líder']].to_string())
