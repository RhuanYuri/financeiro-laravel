// src/components/receita/revenue-stats.tsx
import CardData from '@/components/dashboard/card-data';
import { Card } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

interface RevenueStatsProps {
    totalRevenue: number | null;
    pendingRevenue: number | null;
    totalExpense: number | null;
    pendingExpense: number | null;
    activeClients: number | null;
    isLoading: boolean;
}

export default function RevenueStats({
    totalRevenue,
    pendingRevenue,
    totalExpense,
    pendingExpense,
    activeClients,
    isLoading,
}: RevenueStatsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                        <PlaceholderPattern className="h-[128px] w-full" />
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-5">
            <CardData
                title="Receita Total"
                value={totalRevenue || 0}
                description="Total de receitas"
                icon={DollarSign}
            />
            <CardData
                title="Receita Pendente"
                value={pendingRevenue || 0}
                description="Receitas a receber"
                icon={TrendingUp}
            />
            <CardData
                title="Despesa Total"
                value={totalExpense || 0}
                description="Total de despesas"
                icon={DollarSign}
            />
            <CardData
                title="Despesa Pendente"
                value={pendingExpense || 0}
                description="Despesas a pagar"
                icon={TrendingUp}
            />
            <CardData
                title="Clientes Ativos"
                value={activeClients || 0}
                description="Membros com transações"
                icon={Users}
                format="number"
            />
        </div>
    );
}
