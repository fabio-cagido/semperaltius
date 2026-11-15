import pandas as pd

f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

df1 = pd.read_excel(f1, sheet_name='Médias', header=1)
df2 = pd.read_excel(f2, sheet_name='Médias', header=1)

df = pd.concat([df1, df2], ignore_index=True)
people = df[['Nome', 'Email', 'Área durante a avaliação', 'Departamento durante a avaliação', 'Tags durante a avaliação', 'Líder']].drop_duplicates(subset=['Email'])

print(f'Total unique emails: {len(people)}')
# Let us group by Leader and see who reports to whom
for leader, grp in people.groupby('Líder', dropna=False):
    print(f"\n=== LEADER: {leader} (Count: {len(grp)}) ===")
    for idx, r in grp.iterrows():
        print(f"  {r['Nome']} | Dept: {r['Departamento durante a avaliação']} | Area: {r['Área durante a avaliação']} | Tags: {r['Tags durante a avaliação']} | Email: {r['Email']}")
