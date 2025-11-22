// Dashboard de Vendas - Componente React Principal
// Usa Recharts para visualizações tipo PowerBI
// Estrutura e lógica desenvolvida com assistência de IA (Claude)

import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// URL base da API
const API_URL = 'http://localhost:3001/api';

// Cores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function Dashboard() {
    // Estados para armazenar dados da API
    const [kpis, setKpis] = useState(null);
    const [monthlySales, setMonthlySales] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Buscar todos os dados ao montar o componente
    useEffect(() => {
        fetchAllData();
    }, []);

    // Função para buscar todos os dados da API
    const fetchAllData = async () => {
        try {
            setLoading(true);

            // Fazer requests paralelos para melhor performance
            const [kpisRes, monthlyRes, categoryRes, statusRes, topRes] = await Promise.all([
                fetch(`${API_URL}/stats/kpis`),
                fetch(`${API_URL}/stats/monthly-sales`),
                fetch(`${API_URL}/stats/sales-by-category`),
                fetch(`${API_URL}/stats/sales-status`),
                fetch(`${API_URL}/stats/top-products`)
            ]);

            // Processar respostas
            const kpisData = await kpisRes.json();
            const monthlyData = await monthlyRes.json();
            const categoryDataRes = await categoryRes.json();
            const statusDataRes = await statusRes.json();
            const topProductsData = await topRes.json();

            // Atualizar estados
            setKpis(kpisData);
            setMonthlySales(monthlyData);
            setCategoryData(categoryDataRes);
            setStatusData(statusDataRes);
            setTopProducts(topProductsData);

            setLoading(false);
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
            setError('Falha ao carregar dados. Verifica se o backend está a correr.');
            setLoading(false);
        }
    };

    // Formatador para valores monetários
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    // Renderização durante carregamento
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <h2>A carregar dados...</h2>
            </div>
        );
    }

    // Renderização em caso de erro
    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2 style={{ color: 'red' }}>Erro</h2>
                <p>{error}</p>
                <button onClick={fetchAllData}>Tentar novamente</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Cabeçalho */}
            <header style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '32px', color: '#333', marginBottom: '10px' }}>
                    Dashboard de Vendas 2024
                </h1>
                <p style={{ color: '#666' }}>Análise completa de vendas da loja online</p>
            </header>

            {/* KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <KPICard
                    title="Total de Vendas"
                    value={kpis?.totalSales || 0}
                    color="#0088FE"
                />
                <KPICard
                    title="Receita Total"
                    value={formatCurrency(kpis?.totalRevenue || 0)}
                    color="#00C49F"
                />
                <KPICard
                    title="Clientes Ativos"
                    value={kpis?.totalCustomers || 0}
                    color="#FFBB28"
                />
                <KPICard
                    title="Ticket Médio"
                    value={formatCurrency(kpis?.avgTicket || 0)}
                    color="#FF8042"
                />
            </div>

            {/* Gráficos - Grid Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {/* Gráfico de Linha - Vendas Mensais */}
                <ChartCard title="Evolução de Vendas por Mês">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlySales}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="vendas"
                                stroke="#0088FE"
                                strokeWidth={2}
                                name="Número de Vendas"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="receita"
                                stroke="#00C49F"
                                strokeWidth={2}
                                name="Receita (€)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Gráfico de Barras - Vendas por Categoria */}
                <ChartCard title="Vendas por Categoria">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="categoria" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="vendas" fill="#0088FE" name="Vendas" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Gráfico Pie - Status das Vendas */}
                <ChartCard title="Distribuição de Status">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Tabela - Top Produtos */}
                <ChartCard title="Top 5 Produtos Mais Vendidos">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th style={tableHeaderStyle}>Produto</th>
                                <th style={tableHeaderStyle}>Quantidade</th>
                                <th style={tableHeaderStyle}>Receita</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map((product, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={tableCellStyle}>{product.produto}</td>
                                    <td style={tableCellStyle}>{product.quantidade}</td>
                                    <td style={tableCellStyle}>{formatCurrency(product.receita)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ChartCard>
            </div>

            {/* Footer */}
            <footer style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '14px' }}>
                <p>Dashboard desenvolvido com React + Recharts | Dados gerados com assistência de IA</p>
            </footer>
        </div>
    );
}

// Componente auxiliar para KPI Cards
function KPICard({ title, value, color }) {
    return (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderLeft: `4px solid ${color}`
        }}>
            <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '10px', textTransform: 'uppercase' }}>
                {title}
            </h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', margin: 0 }}>
                {value}
            </p>
        </div>
    );
}

// Componente auxiliar para Cards de Gráficos
function ChartCard({ title, children }) {
    return (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#333' }}>
                {title}
            </h2>
            {children}
        </div>
    );
}

// Estilos para tabela
const tableHeaderStyle = {
    padding: '12px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333'
};

const tableCellStyle = {
    padding: '12px',
    textAlign: 'left',
    color: '#666'
};

export default Dashboard;