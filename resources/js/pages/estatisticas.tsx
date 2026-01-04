import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface StatisticsData {
  topExpenses: Array<{
    id: number;
    description: string;
    value: number;
    date: string;
    member?: { user: { name: string } };
    category?: { name: string };
  }>;
  expensesByMember: Array<{ name: string; total: number }>;
  expensesByCategory: Array<{ name: string; total: number }>;
  revenuesByCategory: Array<{ name: string; total: number }>;
  summary: {
    totalRevenue: number;
    totalExpense: number;
    balance: number;
  };
  filters: {
    year: number;
    month: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Statistics() {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString());

  useEffect(() => {
    fetchStatistics();
  }, [selectedYear, selectedMonth]);

  const fetchStatistics = () => {
    axios.get('/statistics/data', {
      params: { year: selectedYear, month: selectedMonth }
    })
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  };

  const formatBRL = (valueMs: number | undefined | null) => {
    const value = valueMs ?? 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];
  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  return (
    <AppLayout breadcrumbs={[{ title: 'Estatísticas', href: '/estatisticas' }]}>
      <Head title="Estatísticas" />

      <div className="flex flex-col gap-6 p-4">
        {/* Filters */}
        <div className="flex flex-row gap-4 items-center bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <span className="font-semibold text-gray-700 dark:text-gray-200">Período:</span>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entradas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats ? formatBRL(stats.summary.totalRevenue) : '...'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saídas Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats ? formatBRL(stats.summary.totalExpense) : '...'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Balanço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats && stats.summary.balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                {stats ? formatBRL(stats.summary.balance) : '...'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Expenses Table */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Maiores Despesas do Mês</CardTitle>
              <CardDescription>As 5 despesas mais altas registradas neste período.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.topExpenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhuma despesa encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                  {stats?.topExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>{expense.category?.name || 'Sem Categoria'}</TableCell>
                      <TableCell>{expense.member?.user?.name || '-'}</TableCell>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-bold text-red-600">
                        {formatBRL(Number(expense.value))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Expenses By Category (Pie Chart) */}
          <Card className="h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
              <CardDescription>Para onde está indo o dinheiro?</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              {stats?.expensesByCategory.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                      nameKey="name"
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {stats.expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => formatBRL(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">Sem dados</div>
              )}
            </CardContent>
          </Card>

          {/* Revenue By Category/Source (Pie Chart) */}
          <Card className="h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle>Entradas por Origem</CardTitle>
              <CardDescription>De onde vem o dinheiro?</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              {stats?.revenuesByCategory.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.revenuesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#82ca9d"
                      dataKey="total"
                      nameKey="name"
                      label={({ name, percent }: { name?: string; percent?: number }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {stats.revenuesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => formatBRL(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">Sem dados</div>
              )}
            </CardContent>
          </Card>

          {/* Expenses By Member (Bar Chart) */}
          <Card className="h-[400px] flex flex-col col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Gastos por Membro</CardTitle>
              <CardDescription>Quem está gastando mais?</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              {stats?.expensesByMember.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.expensesByMember} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(value) => `R$${value}`} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value: number | undefined) => formatBRL(value)} cursor={{ fill: 'transparent' }} />
                    <Legend />
                    <Bar dataKey="total" name="Total Gasto" fill="#FF8042" radius={[0, 4, 4, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">Sem dados</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
