// src/components/receita/revenue-data-table.tsx
import { useState, useEffect } from 'react';
import { columns, type Revenue } from './columns';
import { DataTable } from '@/components/ui/data-table'; // Componente reutilizável
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

// Mock de dados - Substitua isso pela sua chamada de API
async function getRevenueData(): Promise<Revenue[]> {
    // Simula um delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
        {
            id: 'REV-001',
            description: 'Desenvolvimento de Landing Page',
            amount: 2500.0,
            status: 'paid',
            date: '2025-10-25',
            customer: 'Empresa X',
        },
        {
            id: 'REV-002',
            description: 'Manutenção de Sistema',
            amount: 750.0,
            status: 'pending',
            date: '2025-11-05',
            customer: 'Empresa Y',
        },
        {
            id: 'REV-003',
            description: 'Consultoria SEO',
            amount: 1200.0,
            status: 'overdue',
            date: '2025-10-01',
            customer: 'Empresa Z',
        },
    ];
}

export default function RevenueDataTable() {
    const [data, setData] = useState<Revenue[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getRevenueData()
            .then(setData)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4 p-6">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }

    return (
        <>
            <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
                <CardDescription>
                    Acompanhe aqui todas as suas receitas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Aqui você usa o componente DataTable reutilizável do shadcn/ui.
                  Se você ainda não o criou, siga a documentação do shadcn/ui "Data Table".
                */}
                <DataTable columns={columns} data={data} />
            </CardContent>
        </>
    );
}
