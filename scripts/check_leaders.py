import pandas as pd

f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

df1 = pd.read_excel(f1, sheet_name='Médias', header=1)
df2 = pd.read_excel(f2, sheet_name='Médias', header=1)

print('=== ALL UNIQUE LEADERS ===')
print('F1 Leaders:', df1['Líder'].value_counts())
print('F2 Leaders:', df2['Líder'].value_counts())

print('\n=== ALL UNIQUE TAGS ===')
print('F1 Tags:', df1['Tags durante a avaliação'].value_counts())
print('F2 Tags:', df2['Tags durante a avaliação'].value_counts())

print('\n=== ALL UNIQUE DEPARTMENTS ===')
print('F1 Depts:', df1['Departamento durante a avaliação'].value_counts())
print('F2 Depts:', df2['Departamento durante a avaliação'].value_counts())
