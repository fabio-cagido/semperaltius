import pandas as pd

f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

df1 = pd.read_excel(f1, sheet_name='Médias', header=1)
df2 = pd.read_excel(f2, sheet_name='Médias', header=1)

print('=== F1: Rows without DOCENTE in Dept ===')
for idx, r in df1.iterrows():
    dept = str(r['Departamento durante a avaliação'])
    if 'DOCENTE' not in dept.upper():
        print(f"Name: {r['Nome']} | Email: {r['Email']} | Dept: {dept} | Area: {r['Área durante a avaliação']} | Tags: {r['Tags durante a avaliação']} | Lider: {r['Líder']}")

print('\n=== F2: Rows without DOCENTE in Dept ===')
for idx, r in df2.iterrows():
    dept = str(r['Departamento durante a avaliação'])
    if 'DOCENTE' not in dept.upper():
        print(f"Name: {r['Nome']} | Email: {r['Email']} | Dept: {dept} | Area: {r['Área durante a avaliação']} | Tags: {r['Tags durante a avaliação']} | Lider: {r['Líder']}")
