// src/pages/Receita.tsx
import AppLayout from '@/layouts/app-layout';
import { receita } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

// Importe os ícones
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import axios from 'axios';
import revenues from '@/routes/revenue';

// Importe os novos componentes
import RevenueHeader from '@/components/receita/RevenueHeader';
import RevenueStats from '@/components/receita/RevenueStats';
import RevenueDataTable from '@/components/receita/RevenueDataTable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Receita',
        href: receita().url,
    },
];

type GetStatsResponse = {
    totalRevenue: number;
    pendingRevenue: number;
    activeClients: number;
};

export default function Receita() {
    const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
    const [pendingRevenue, setPendingRevenue] = useState<number | null>(null);
    const [totalExpense, setTotalExpense] = useState<number | null>(null);
    const [pendingExpense, setPendingExpense] = useState<number | null>(null);
    const [activeClients, setActiveClients] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        axios
            .get<GetStatsResponse | any>('/revenue/stats') // Update type locally or cast to any for quick fix if type is not updated yet
            .then((response) => {
                setTotalRevenue(response.data.totalRevenue);
                setPendingRevenue(response.data.pendingRevenue);
                setTotalExpense(response.data.totalExpense);
                setPendingExpense(response.data.pendingExpense);
                setActiveClients(response.data.activeClients);
            })
            .catch((error) => {
                console.error('Erro ao buscar estatísticas:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Receita" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                {/* 1. Cabeçalho com Filtros e Botão */}
                <RevenueHeader onStatusChange={setFilterStatus} />

                {/* 2. Cards de Estatísticas */}
                <RevenueStats
                    totalRevenue={totalRevenue}
                    pendingRevenue={pendingRevenue}
                    totalExpense={totalExpense}
                    pendingExpense={pendingExpense}
                    activeClients={activeClients}
                    isLoading={isLoading}
                />

                {/* 3. Tabela de Dados */}
                <Card>
                    <RevenueDataTable filterStatus={filterStatus} />
                </Card>
            </div>
        </AppLayout>
    );
}
