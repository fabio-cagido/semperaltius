import openpyxl

f1 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_1803d051.xlsx'
f2 = r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.user_uploaded\media_1794739840081_f5427846.xlsx'

for fpath, name in [(f1, 'F1'), (f2, 'F2')]:
    wb = openpyxl.load_workbook(fpath, data_only=True)
    print(f'=== SEARCHING IN {name} ===')
    for sname in wb.sheetnames:
        ws = wb[sname]
        for r in range(1, ws.max_row+1):
            for c in range(1, ws.max_column+1):
                val = str(ws.cell(r, c).value or '')
                if any(k in val.lower() for k in ['supervis', 'psicolog', 'coordenad']):
                    print(f"  {sname} R{r}C{c}: {val[:80]}")
