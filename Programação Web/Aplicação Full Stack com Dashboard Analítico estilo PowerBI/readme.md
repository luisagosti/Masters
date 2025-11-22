# Dashboard de Vendas Online - Projeto Full Stack

## Descrição do Domínio

Sistema de análise de vendas para uma loja online fictícia. O dashboard permite visualizar indicadores de performance (KPIs), tendências temporais, distribuição por categorias e rankings de produtos.

**Domínio escolhido:** E-commerce / Vendas Online

**Justificação:** Dados intuitivos e fáceis de compreender, KPIs claros (receita, ticket médio), múltiplas dimensões de análise (tempo, categoria, produto, geografia).

## Tecnologias Utilizadas

### Backend
- Node.js v18+
- Express 4.18
- MySQL2 (com prepared statements)
- CORS para comunicação cross-origin

### Frontend
- React 18
- Recharts 2.10 (biblioteca de gráficos)
- Fetch API para consumo da API

### Base de Dados
- MySQL 8.0
- 4 tabelas relacionadas
- 200+ registos de vendas

## Estrutura do Projeto

```
projeto/
├── backend/
│   ├── server.js           # API REST com Express
│   ├── package.json
│   └── .env (opcional)
├── frontend/
│   ├── src/
│   │   ├── Dashboard.jsx   # Componente principal
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── database/
│   └── schema.sql          # Script de criação + dados
└── README.md
```

## Modelo de Dados (MER)

### Tabelas

1. **categories** (5 registos)
   - id (PK)
   - name
   - description

2. **products** (18 registos)
   - id (PK)
   - name
   - category_id (FK → categories)
   - price
   - stock

3. **customers** (50 registos)
   - id (PK)
   - name
   - email (UNIQUE)
   - city
   - registration_date

4. **sales** (200 registos)
   - id (PK)
   - customer_id (FK → customers)
   - product_id (FK → products)
   - quantity
   - total_price
   - sale_date
   - status (completed/pending/cancelled)

### Relacionamentos

- Products N:1 Categories
- Sales N:1 Customers
- Sales N:1 Products

## Instalação e Execução

### Passo 1: Base de Dados

```bash
# Aceder ao MySQL
mysql -u root -p

# Executar o script (ou copiar/colar o conteúdo)
source schema.sql;
```

### Passo 2: Backend

```bash
cd backend
npm install
```

Editar `server.js` com credenciais do MySQL (linhas 14-18):

```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'sales_dashboard'
};
```

Iniciar servidor:

```bash
npm start
# Servidor disponível em http://localhost:3001
```

### Passo 3: Frontend

```bash
cd frontend
npm install
npm start
# Aplicação disponível em http://localhost:3000
```

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/stats/kpis` | KPIs gerais (total vendas, receita, clientes, ticket médio) |
| GET | `/api/stats/monthly-sales` | Vendas agregadas por mês (2024) |
| GET | `/api/stats/sales-by-category` | Vendas por categoria de produto |
| GET | `/api/stats/sales-status` | Distribuição de status (completed/pending/cancelled) |
| GET | `/api/stats/top-products` | Top 5 produtos mais vendidos |
| GET | `/api/products` | Listagem completa de produtos |

### Exemplo de Request

```bash
curl http://localhost:3001/api/stats/kpis
```

### Exemplo de Response

```json
{
  "totalSales": 194,
  "totalRevenue": "98765.43",
  "totalCustomers": 50,
  "avgTicket": "509.10"
}
```

## Dashboard - Visualizações

### KPI Cards (4 cards)
- Total de Vendas
- Receita Total
- Clientes Ativos
- Ticket Médio

### Gráfico de Linha
Evolução mensal de vendas em 2024 (dual axis: número de vendas + receita)

### Gráfico de Barras
Comparação de vendas por categoria de produto

### Gráfico Pie
Distribuição percentual de status das vendas

### Tabela Top 5
Ranking dos produtos mais vendidos (quantidade + receita)

## Queries SQL Importantes

### Vendas mensais
```sql
SELECT 
  DATE_FORMAT(sale_date, '%Y-%m') as month,
  COUNT(id) as sales_count,
  SUM(total_price) as revenue
FROM sales 
WHERE status = 'completed' AND YEAR(sale_date) = 2024
GROUP BY month
ORDER BY month;
```

### Vendas por categoria
```sql
SELECT 
  c.name as category,
  COUNT(s.id) as sales_count,
  SUM(s.total_price) as revenue
FROM sales s
JOIN products p ON s.product_id = p.id
JOIN categories c ON p.category_id = c.id
WHERE s.status = 'completed'
GROUP BY c.id, c.name
ORDER BY revenue DESC;
```

## Utilização de IA no Projeto

### Ferramentas Utilizadas
- **Claude (Anthropic)**: Assistência na estruturação do projeto, geração de dados fictícios, criação de queries SQL, organização do código

### Como foi utilizada
1. **Planeamento**: Definição da estrutura de tabelas e relacionamentos
2. **Geração de Dados**: Criação de 200 vendas fictícias com datas distribuídas ao longo de 2024
3. **Desenvolvimento**: Sugestões de organização de código, boas práticas (prepared statements, separação de concerns)
4. **Queries SQL**: Otimização de queries para agregações e joins
5. **Frontend**: Estrutura dos componentes React e integração com Recharts
6. **Documentação**: Elaboração deste README

### Código Compreendido e Ajustado
Todo o código foi revisto e ajustado manualmente:
- Comentários adicionados em português para clareza
- Validações de erro implementadas
- Formatação de valores monetários personalizada para EUR
- Responsividade do dashboard testada

### Limitações da Abordagem com IA
- IA sugeriu estruturas genéricas que precisaram de adaptação ao contexto português
- Queries iniciais não tinham filtros de status, adicionados manualmente
- Design visual básico, melhorias estéticas feitas à mão

## Segurança

- Prepared statements utilizados em todas as queries (proteção contra SQL injection)
- CORS configurado para aceitar apenas localhost (produção requer restrição)
- Validação básica de erros em todos os endpoints
- Sem autenticação implementada (opcional para extensão futura)

## Melhorias Futuras

### Funcionalidades
- Filtros interativos (datas, categorias, cidades)
- Autenticação JWT para proteger endpoints
- CRUD completo (adicionar/editar/eliminar vendas)
- Export de dados para Excel/PDF
- Dashboard em tempo real (WebSockets)

### Performance
- Cache de queries frequentes (Redis)
- Paginação na listagem de produtos
- Lazy loading de gráficos

### UX/UI
- Modo escuro
- Animações nos gráficos
- Design responsivo melhorado para mobile
- Biblioteca de UI (Material-UI ou Ant Design)

## Reflexão Final

### Pontos Fortes
- Arquitetura modular e bem organizada
- Separação clara entre frontend e backend
- Visualizações claras e informativas
- Dados realistas e consistentes

### Limitações
- Design visual básico
- Falta de testes automatizados
- Configuração manual das credenciais da BD
- Sem gestão de estado avançada (Redux/Context API)

### Aprendizagens
- Integração completa de stack moderna (Node + React + MySQL)
- Utilização eficaz de bibliotecas de visualização
- Importância de prepared statements para segurança
- Valor da IA como assistente (não substituto) no desenvolvimento

## Autor

Projeto desenvolvido para o curso de Mestrado, com assistência de IA (Claude) para estruturação, geração de dados e otimizações de código.

## Licença

MIT
