# Dashboard Executivo - Avaliação Institucional 360º (2026)
### Rede de Colégios Semper Altius • Colégios Everest (Curitiba e Rio de Janeiro)

Dashboard interativo desenvolvido em **Next.js (App Router)**, **React**, **Tailwind CSS** e **Recharts**, projetado para visualização executiva dos resultados da Avaliação Institucional 360º de 2026, pronto para deploy instantâneo na **Vercel** via GitHub.

---

## 🚀 Funcionalidades Principais

1. **Filtro Global por Unidade:**
   - Alternância imediata entre `Todas as Unidades (Rede)`, `Curitiba` e `Rio de Janeiro`.
   - Atualização em tempo real de todos os indicadores, gráficos e tabelas.

2. **Cenário Geral & Matriz de Níveis de Desempenho (Novidade 2026):**
   - KPIs de participantes, média geral institucional, distribuição por segmento e gênero.
   - **Matriz de Distribuição por Níveis de Desempenho** (Slides 8 e 9): tabela cruzada por ciclo escolar (`EI`, `EFI`, `EFII`, `EM`) e gráfico de barras empilhadas 100% com os 4 níveis oficiais:
     - `Inicial [I]`: `< 2.50`
     - `Em Desenvolvimento [ED]`: `2.50 a 2.99`
     - `Atuação Adequada [AA]`: `3.00 a 3.59`
     - `Referência [REF]`: `≥ 3.60`
   - Respostas analíticas diretas às 4 perguntas estratégicas da Direção.

3. **Visão por Ciclos Escolares (`EI`, `EFI`, `EFII`, `EM`):**
   - **Gráfico Aranha (Radar) dos 5 Âmbitos (Novidade 2026 - Slides 13, 17, 21 e 25):** sobreposição das curvas de `Coordenador`, `Docentes`, `Psicólogo` e `Supervisor de Inglês` (quando Curitiba).
   - Tratamento elegante com avisos informativos quando algum cargo não possui avaliados específicos no ciclo.
   - **Top 5 e Bottom 5 gerais do ciclo** (sem separar por âmbito).

4. **Análise 360º Docente (Referência 2025):**
   - Radares individuais dos papéis avaliadores (`Coordenador`, `Autoavaliação`, `Pares`, `Psicólogo` e `Alunos`).
   - Radar sobreposto dos segmentos escolares.

5. **Comparativo entre Ciclos (Slides 27, 28 e 29):**
   - Gráficos de barras agrupadas comparando os 5 âmbitos em 3 visões independentes:
     - Visão Coordenação
     - Visão Psicologia
     - Visão Docentes

6. **Explorador Detalhado de Quesitos (Drill-down):**
   - Filtros por Âmbito, Perfil Avaliador e Segmento.
   - Busca textual instantânea e ordenação por maior/menor nota.

7. **Quadro Geral de Avaliados & Devolutivas:**
   - Lista completa dos 129 profissionais com status, segmento, cargo, nota final e nível.
   - Modal com detalhamento individual dos 5 âmbitos e papéis avaliadores.
   - Botão para exportação direta em formato **CSV**.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS (Paleta institucional Everest Semper Altius)
- **Visualização de Dados:** Recharts
- **Ícones:** Lucide React
- **ETL e Engenharia de Dados:** Python (Pandas, Openpyxl)

---

## 💻 Como Executar Localmente

### 1. Clonar o repositório ou abrir a pasta do projeto:
```bash
cd everest-dashboard-2026
```

### 2. Instalar as dependências:
```bash
npm install
```

### 3. Rodar em ambiente de desenvolvimento:
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### 4. Compilar para produção:
```bash
npm run build
npm run start
```

---

## ☁️ Deploy na Vercel via GitHub

1. Inicialize o repositório git e faça o push para o seu GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: Everest 360 Institutional Dashboard 2026"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```
2. Acesse [vercel.com](https://vercel.com) e clique em **"Add New Project"**.
3. Importe o repositório criado.
4. O framework **Next.js** será detectado automaticamente.
5. Clique em **Deploy** — a aplicação estará no ar em poucos segundos!
