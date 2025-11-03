import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

// Importe o CardData
import CardData from '@/components/dashboard/card-data';
// Importe os ícones que você vai usar
import { DollarSign, Users } from 'lucide-react';
// Importe o <Card> base para os placeholders
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import axios from 'axios';
import revenues from '@/routes/revenue';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

type GetTotalResponse = {
    total: number;
};

export default function Dashboard() {
    const [totalRevenue, setTotalRevenue] = useState<number | null>(null)

    useEffect(() => {
        axios
            .get<GetTotalResponse>(revenues.getTotal.url({ type: 'revenue' }))
            .then((response) => {
                // Aqui o TS já sabe que response.data é GetTotalResponse
                setTotalRevenue(response.data.total);
            })
            .catch((error) => {
                console.error('Erro ao buscar total de receitas:', error);
            });
    }, []);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <CardData
                        icon={DollarSign}
                        title="Receita Total"
                        value={totalRevenue || 0}
                        description="+20.1% desde o mês passado"
                    />
                    <CardData
                        icon={Users}
                        title="Novos Clientes"
                        value={2350}
                        description="+19% desde o mês passado"
                    />
                    <Card className="relative flex min-h-[126px] items-center justify-center overflow-hidden p-4">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <span className="relative z-10 text-sm text-muted-foreground">
                            Vendas (Em breve...)
                        </span>
                    </Card>
                </div>
                <div className="relative min-h-[60vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    <div className="absolute top-4 left-4 md:top-6 md:left-6">
                        <h3 className="text-lg font-semibold">
                            Visão Geral da Atividade
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Dados dos últimos 12 meses.
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
