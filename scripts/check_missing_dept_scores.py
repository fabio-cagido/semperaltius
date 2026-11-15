import pandas as pd

f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

df1 = pd.read_excel(f1, sheet_name='Médias', header=1)
df2 = pd.read_excel(f2, sheet_name='Médias', header=1)

# Let's inspect all people in F1 and F2
df = pd.concat([df1.assign(src='F1'), df2.assign(src='F2')], ignore_index=True)

# Look at people with missing Dept or DIREÇÃO
print(df[df['Departamento durante a avaliação'].isna() | (df['Departamento durante a avaliação'] == 'DIREÇÃO')][['src', 'Nome', 'Email', 'Tags durante a avaliação', 'Líder', 'Nota Final (sem calibração)', 'Autoavaliação', 'Do Líder', 'Outros', 'Colegas', 'Dos Pares']].to_string())
