import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface CardDataProps {
    title: string;
    value: number;
    description: string;
    icon: LucideIcon;
    className?: string;
}

/**
 * Formata um número como moeda BRL (Real Brasileiro).
 */
function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export default function CardData({
    title,
    value,
    description,
    icon: Icon,
    className,
}: CardDataProps) {
    const formattedValue = formatCurrency(value);

    return (
        <Card className={cn(className)}>
            {/* Ajustamos o Header para ter um layout flexível,
        alinhando o título e o ícone.
      */}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {/* Título com estilo mais sutil */}
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {/* Ícone com cor suave */}
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
                {/* Valor principal com grande destaque */}
                <div className="text-2xl font-bold">{formattedValue}</div>
                {/* Descrição (contexto) com cor suave e tamanho menor */}
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
