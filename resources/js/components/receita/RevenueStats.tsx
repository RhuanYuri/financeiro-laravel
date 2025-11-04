// src/components/receita/revenue-stats.tsx
import CardData from '@/components/dashboard/card-data';
import { Card } from '@/components/ui/card';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

interface RevenueStatsProps {
    totalRevenue: number | null;
    isLoading: boolean;
}

export default function RevenueStats({
                                         totalRevenue,
                                         isLoading,
                                     }: RevenueStatsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {/* Usando o PlaceholderPattern que você importou */}
                <Card>
                    <PlaceholderPattern className="h-[128px] w-full" />
                </Card>
                <Card>
                    <PlaceholderPattern className="h-[128px] w-full" />
                </Card>
                <Card>
                    <PlaceholderPattern className="h-[128px] w-full" />
                </Card>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <CardData
                title="Receita Total (Mês)"
                value={totalRevenue || 0}
                description="+20.1% do último mês"
                icon={DollarSign}
            />
            <CardData
                title="Receita Pendente"
                value={1250.75} // Exemplo estático
                description="+5.2% do último mês"
                icon={TrendingUp}
            />
            <CardData
                title="Clientes Ativos"
                value={23} // Exemplo estático
                description="+2 desde a última hora"
                icon={Users}
            />
        </div>
    );
}
