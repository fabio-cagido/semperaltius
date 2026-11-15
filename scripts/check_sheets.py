import openpyxl
import pandas as pd

# Let's check if there are other sheets or hidden columns, or notes
f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

wb1 = openpyxl.load_workbook(f1, data_only=True)
wb2 = openpyxl.load_workbook(f2, data_only=True)

print('WB1 sheets:', wb1.sheetnames)
print('WB2 sheets:', wb2.sheetnames)
