import json

with open(r'C:\Users\fabio\.gemini\antigravity\brain\34aa6095-ea20-4631-a6e6-6855274ee13f\.system_generated\logs\transcript_full.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        content = str(data.get('content', ''))
        if 'Solicitações 2026.pdf' in content or 'Resultados Avaliação Docente 2025.pdf' in content or 'Psicolog' in content:
            print(f"Step {data.get('step_index')}: {data.get('type')}, length {len(content)}")
            for kw in ['Psicolog', 'Coordenad', 'Fantini', 'Ribas', 'Supervis', 'Cargo']:
                count = content.count(kw)
                print(f"  Keyword '{kw}': {count} occurrences")
