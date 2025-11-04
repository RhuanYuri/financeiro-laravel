// src/components/receita/columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '../ui/checkbox';

// Definição do tipo de dado
export type Revenue = {
    id: string;
    description: string;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    date: string;
    customer: string;
};

// Helper para formatar moeda
const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};

// Helper para formatar data
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const columns: ColumnDef<Revenue>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Selecionar todas"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Selecionar linha"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'description',
        header: 'Descrição',
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">
                    {row.original.description}
                </span>
                <span className="text-sm text-muted-foreground">
                    {row.original.customer}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'amount',
        header: 'Valor',
        cell: ({ row }) => (
            <div className="font-mono">
                {formatCurrency(row.original.amount)}
            </div>
        ),
    },
    {
        accessorKey: 'date',
        header: 'Data',
        cell: ({ row }) => <div>{formatDate(row.original.date)}</div>,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            let variant: 'default' | 'secondary' | 'destructive' = 'secondary';
            if (status === 'paid') variant = 'default';
            if (status === 'overdue') variant = 'destructive';

            const statusText = {
                pending: 'Pendente',
                paid: 'Pago',
                overdue: 'Vencido',
            };

            return (
                <Badge variant={variant} className="capitalize">
                    {statusText[status]}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const revenue = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() =>
                                navigator.clipboard.writeText(revenue.id)
                            }
                        >
                            Copiar ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Editar Receita</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
