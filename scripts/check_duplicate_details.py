import pandas as pd
import numpy as np

f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

p1 = pd.read_excel(f1, sheet_name='Perguntas computáveis', header=[0, 1])
p2 = pd.read_excel(f2, sheet_name='Perguntas computáveis', header=[0, 1])

# Check Viviane
print('Viviane F1 non-zero questions:', (p1[p1.iloc[:, 1] == 'viviane.miquelao@professoreverest.curitiba.br'].iloc[:, 12:] > 0).sum().sum())
print('Viviane F2 non-zero questions:', (p2[p2.iloc[:, 1] == 'viviane.miquelao@professoreverest.curitiba.br'].iloc[:, 12:] > 0).sum().sum())

# Check Larissa Haag
print('Larissa Haag F1 non-zero questions:', (p1[p1.iloc[:, 1] == 'larissa.haag@professoreverest.curitiba.br'].iloc[:, 12:] > 0).sum().sum())
print('Larissa Haag F2 non-zero questions:', (p2[p2.iloc[:, 1] == 'larissa.haag@professoreverest.curitiba.br'].iloc[:, 12:] > 0).sum().sum())

# Check Larissa Farinazzo
print('Larissa Farinazzo F1 non-zero questions:', (p1[p1.iloc[:, 1] == 'larissa.farinazzo@everestrj.net.br'].iloc[:, 12:] > 0).sum().sum())
print('Larissa Farinazzo F2 non-zero questions:', (p2[p2.iloc[:, 1] == 'larissa.farinazzo@everestrj.net.br'].iloc[:, 12:] > 0).sum().sum())

# Check Raphael Mota
print('Raphael Mota F1 non-zero questions:', (p1[p1.iloc[:, 1] == 'raphael.mota@everestrj.net.br'].iloc[:, 12:] > 0).sum().sum())
print('Raphael Mota F2 non-zero questions:', (p2[p2.iloc[:, 1] == 'raphael.mota@everestrj.net.br'].iloc[:, 12:] > 0).sum().sum())

# Check Fernando Azevedo
print('Fernando Azevedo F1 non-zero questions:', (p1[p1.iloc[:, 1] == 'fernando.azevedo@professoreverest.curitiba.br'].iloc[:, 12:] > 0).sum().sum())
print('Fernando Azevedo F2 non-zero questions:', (p2[p2.iloc[:, 1] == 'fernando.azevedo@professoreverest.curitiba.br'].iloc[:, 12:] > 0).sum().sum())

# Check Rayane
print('Rayane row 65 non-zero questions:', (p2[p2.iloc[:, 1] == 'rayane.cavalcante@everstrj.net.br'].iloc[:, 12:] > 0).sum().sum())
print('Rayane row 66 non-zero questions:', (p2[p2.iloc[:, 1] == 'rayane.cavalcante@everestrj.net.br'].iloc[:, 12:] > 0).sum().sum())
