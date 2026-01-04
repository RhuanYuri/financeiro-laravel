import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import CardData from '@/components/dashboard/card-data';
import { DollarSign, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardStats {
    monthRevenue: number;
    monthExpense: number;
    pendingRevenue: number;
    pendingExpense: number;
    activeClients: number;
    revenueDesc: string;
    expenseDesc: string;
    clientsDesc: string;
    chartData: Array<{
        month: string;
        revenue: number;
        expense: number;
    }>;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    useEffect(() => {
        axios.get('/revenue/stats', { params: { year: selectedYear } })
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, [selectedYear]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Generate years for select (Current year +/- 2 years)
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-4">
                    <CardData
                        icon={TrendingUp}
                        title="Receita do Mês"
                        value={stats?.monthRevenue || 0}
                        description={stats?.revenueDesc || "Carregando..."}
                        className="text-green-600"
                    />
                    <CardData
                        icon={TrendingDown}
                        title="Despesa do Mês"
                        value={stats?.monthExpense || 0}
                        description={stats?.expenseDesc || "Carregando..."}

                    />
                    {/* Custos em Aberto (Pending Expenses) */}
                    <CardData
                        icon={DollarSign}
                        title="Custos em Aberto"
                        value={stats?.pendingExpense || 0}
                        description="Total acumulado pendente"
                    />
                    <CardData
                        icon={Users}
                        title="Usuários Ativos"
                        value={stats?.activeClients || 0}
                        description={stats?.clientsDesc || "Carregando..."}
                        format="number"
                    />
                </div>

                {/* Grafico */}
                <Card className="flex flex-col h-[500px]">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Histórico Financeiro</CardTitle>
                            <CardDescription>Receitas vs. Despesas ({selectedYear})</CardDescription>
                        </div>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione o ano" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="flex-1 pb-4">
                        <div className="h-full w-full">
                            {stats?.chartData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        />
                                        <YAxis
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `R$ ${value}`}
                                        />
                                        <Tooltip
                                            formatter={(value: any) => formatCurrency(Number(value))}
                                            labelStyle={{ color: 'black' }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            name="Receitas"
                                            stroke="#16a34a"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="expense"
                                            name="Despesas"
                                            stroke="#dc2626"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                    Carregando gráfico...
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
