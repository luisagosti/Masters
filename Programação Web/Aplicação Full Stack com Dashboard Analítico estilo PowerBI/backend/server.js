// Backend API para Dashboard de Vendas
// Tecnologias: Node.js + Express + MySQL2

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração da base de dados
// NOTA: Alterar credenciais conforme o ambiente local
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'sales_dashboard'
};

// Pool de conexões para melhor performance
const pool = mysql.createPool(dbConfig);

// ENDPOINT 1: KPIs Gerais
// Retorna métricas principais: total vendas, receita, número de clientes, ticket médio
app.get('/api/stats/kpis', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        // Query com prepared statement para segurança
        const [results] = await connection.query(`
        SELECT 
            COUNT(DISTINCT id) as total_sales,
            SUM(total_price) as total_revenue,
            COUNT(DISTINCT customer_id) as total_customers,
            AVG(total_price) as avg_ticket
        FROM sales 
        WHERE status = 'completed'
    `);

        connection.release();

        res.json({
            totalSales: results[0].total_sales,
            totalRevenue: parseFloat(results[0].total_revenue || 0).toFixed(2),
            totalCustomers: results[0].total_customers,
            avgTicket: parseFloat(results[0].avg_ticket || 0).toFixed(2)
        });
    } catch (error) {
        console.error('Erro ao buscar KPIs:', error);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

// ENDPOINT 2: Vendas por mês (para gráfico de linha)
// Agrupa vendas mensais de 2024, usado para visualizar tendência temporal
app.get('/api/stats/monthly-sales', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [results] = await connection.query(`
        SELECT 
            DATE_FORMAT(sale_date, '%Y-%m') as month,
            COUNT(id) as sales_count,
            SUM(total_price) as revenue
        FROM sales 
        WHERE status = 'completed' 
            AND YEAR(sale_date) = 2024
        GROUP BY month
        ORDER BY month
    `);

        connection.release();

        // Transformar dados para formato Recharts
        const formattedData = results.map(row => ({
            month: row.month,
            vendas: parseInt(row.sales_count),
            receita: parseFloat(row.revenue)
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Erro ao buscar vendas mensais:', error);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

// ENDPOINT 3: Vendas por categoria (para gráfico de barras)
// Agrega vendas por categoria de produto
app.get('/api/stats/sales-by-category', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [results] = await connection.query(`
        SELECT 
            c.name as category,
            COUNT(s.id) as sales_count,
            SUM(s.total_price) as revenue
        FROM sales s
        JOIN products p ON s.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        WHERE s.status = 'completed'
        GROUP BY c.id, c.name
        ORDER BY revenue DESC
    `);

        connection.release();

        const formattedData = results.map(row => ({
            categoria: row.category,
            vendas: parseInt(row.sales_count),
            receita: parseFloat(row.revenue)
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Erro ao buscar vendas por categoria:', error);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

// ENDPOINT 4: Distribuição de status de vendas (para gráfico pie)
// Mostra proporção de vendas: completadas, pendentes, canceladas
app.get('/api/stats/sales-status', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [results] = await connection.query(`
        SELECT 
            status,
            COUNT(id) as count
        FROM sales
        GROUP BY status
    `);

        connection.release();

        // Traduzir status para português e formatar
        const statusMap = {
            'completed': 'Completadas',
            'pending': 'Pendentes',
            'cancelled': 'Canceladas'
        };

        const formattedData = results.map(row => ({
            name: statusMap[row.status] || row.status,
            value: parseInt(row.count)
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Erro ao buscar status de vendas:', error);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

// ENDPOINT 5: Top 5 produtos mais vendidos
// Usado para tabela ou ranking no dashboard
app.get('/api/stats/top-products', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [results] = await connection.query(`
        SELECT 
            p.name as product_name,
            SUM(s.quantity) as total_quantity,
            SUM(s.total_price) as total_revenue
        FROM sales s
        JOIN products p ON s.product_id = p.id
        WHERE s.status = 'completed'
        GROUP BY p.id, p.name
        ORDER BY total_quantity DESC
        LIMIT 5
    `);

        connection.release();

        const formattedData = results.map(row => ({
            produto: row.product_name,
            quantidade: parseInt(row.total_quantity),
            receita: parseFloat(row.total_revenue).toFixed(2)
        }));

        res.json(formattedData);
    } catch (error) {
        console.error('Erro ao buscar top produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar dados' });
    }
});

// ENDPOINT 6: Listagem de produtos (CRUD - READ)
// Retorna todos os produtos com informação da categoria
app.get('/api/products', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [results] = await connection.query(`
        SELECT 
            p.id,
            p.name,
            p.price,
            p.stock,
            c.name as category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        ORDER BY p.name
    `);

        connection.release();
        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API está funcional' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor a correr em http://localhost:${PORT}`);
    console.log('Endpoints disponíveis:');
    console.log('  GET /api/stats/kpis');
    console.log('  GET /api/stats/monthly-sales');
    console.log('  GET /api/stats/sales-by-category');
    console.log('  GET /api/stats/sales-status');
    console.log('  GET /api/stats/top-products');
    console.log('  GET /api/products');
});

// Gestão de erros não capturados
process.on('unhandledRejection', (err) => {
    console.error('Erro não tratado:', err);
});