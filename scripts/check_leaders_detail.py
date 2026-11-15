import pandas as pd

f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

df1 = pd.read_excel(f1, sheet_name='Médias', header=1)
df2 = pd.read_excel(f2, sheet_name='Médias', header=1)

# Check all non-teachers or people whose department doesn't have DOCENTE or who might be Coordinators/Psychologists
print("--- Check distinct leaders in CTBA ---")
ctba = df1[df1['Email'].str.contains('curitiba', case=False, na=False)]._append(df2[df2['Email'].str.contains('curitiba', case=False, na=False)])
print("CTBA Leaders:", ctba['Líder'].value_counts())

print("\n--- Check distinct leaders in RJ ---")
rj = df1[df1['Email'].str.contains('rj', case=False, na=False)]._append(df2[df2['Email'].str.contains('rj', case=False, na=False)])
print("RJ Leaders:", rj['Líder'].value_counts())
