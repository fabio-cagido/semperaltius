import pandas as pd
import numpy as np

f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

df1 = pd.read_excel(f1, sheet_name='Médias', header=1)
df2 = pd.read_excel(f2, sheet_name='Médias', header=1)

print('=== F1: 56 participants ===')
for idx, r in df1.iterrows():
    print(f"[{idx+1}] {r['Nome']} | Email: {r['Email']} | Area: {r['Área durante a avaliação']} | Dept: {r['Departamento durante a avaliação']} | Tags: {r['Tags durante a avaliação']} | Lider: {r['Líder']}")

print('\n=== F2: 79 participants ===')
for idx, r in df2.iterrows():
    print(f"[{idx+1}] {r['Nome']} | Email: {r['Email']} | Area: {r['Área durante a avaliação']} | Dept: {r['Departamento durante a avaliação']} | Tags: {r['Tags durante a avaliação']} | Lider: {r['Líder']}")
