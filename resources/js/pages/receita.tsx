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

type GetTotalResponse = {
    total: number;
};

export default function Receita() {
    const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        axios
            .get<GetTotalResponse>(revenues.getTotal.url({ type: 'revenue' }))
            .then((response) => {
                setTotalRevenue(response.data.total);
            })
            .catch((error) => {
                console.error('Erro ao buscar total de receitas:', error);
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
                <RevenueHeader />

                {/* 2. Cards de Estatísticas */}
                <RevenueStats
                    totalRevenue={totalRevenue}
                    isLoading={isLoading}
                />

                {/* 3. Tabela de Dados */}
                <Card>
                    <RevenueDataTable />
                </Card>
            </div>
        </AppLayout>
    );
}
