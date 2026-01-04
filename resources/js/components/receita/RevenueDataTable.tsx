// src/components/receita/revenue-data-table.tsx
import { useState, useEffect } from 'react';
import { columns, type Revenue } from './columns';
import { DataTable } from '@/components/ui/data-table'; // Componente reutilizável
import { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

// Função de fetch removida pois usamos axios direto ou um helper
import axios from 'axios';

export default function RevenueDataTable({ filterStatus }: { filterStatus?: string }) {
    const [data, setData] = useState<Revenue[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        axios.get<Revenue[]>('/revenue')
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => console.error("Erro ao carregar receitas:", error))
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
                <DataTable
                    columns={columns}
                    data={filterStatus && filterStatus !== 'all'
                        ? data.filter(item => item.status === filterStatus)
                        : data
                    }
                />
            </CardContent>
        </>
    );
}
