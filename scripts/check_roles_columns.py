import pandas as pd

f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

df1 = pd.read_excel(f1, sheet_name='Médias', header=1)
df2 = pd.read_excel(f2, sheet_name='Médias', header=1)

print('--- Non-empty Area in F1 ---')
print(df1['Área durante a avaliação'].dropna().unique())

print('--- Non-empty Area in F2 ---')
print(df2['Área durante a avaliação'].dropna().unique())

# Are there any other columns in any sheet?
print('F1 columns in sheet Médias with any non-null:', [c for c in df1.columns if df1[c].notna().any()])
print('F2 columns in sheet Médias with any non-null:', [c for c in df2.columns if df2[c].notna().any()])
