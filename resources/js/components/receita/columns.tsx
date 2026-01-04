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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '../ui/checkbox';
import { AddRevenueDialog } from './addRevenueDialog';
import { RevenueDetailsDialog } from './RevenueDetailsDialog';
import { useState } from 'react';
import axios from 'axios';

// Definição do tipo de dado
// Definição do tipo de dado
export type Revenue = {
    id: number;
    description: string;
    value: number; // matched from backend 'value'
    status: 'pending' | 'open' | 'paid' | 'overdue';
    date: string;
    member?: {
        user?: {
            name: string;
        }
    }
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
                    {row.original.member?.user?.name || 'Cliente desconhecido'}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'value',
        header: 'Valor',
        cell: ({ row }) => (
            <div className="font-mono">
                {formatCurrency(Number(row.original.value))}
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
            const status = row.original.status || 'open'; // Fallback to 'open' if expected
            let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
            if (status === 'paid') variant = 'default';
            if (status === 'overdue') variant = 'destructive';
            if (status === 'open') variant = 'outline'; // or secondary

            const statusText: Record<string, string> = {
                pending: 'Pendente',
                open: 'Em Aberto',
                paid: 'Pago',
                overdue: 'Vencido',
            };

            return (
                <Badge variant={variant} className="capitalize">
                    {statusText[status] || status}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const revenue = row.original;
            const [showEditDialog, setShowEditDialog] = useState(false);
            const [showDetailsDialog, setShowDetailsDialog] = useState(false);
            const [showDeleteDialog, setShowDeleteDialog] = useState(false);

            return (
                <>
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
                                    navigator.clipboard.writeText(revenue.id.toString())
                                }
                            >
                                Copiar ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => setShowDetailsDialog(true)}>
                                Detalhes / Parcelas
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
                                Editar Receita
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onSelect={() => setShowDeleteDialog(true)}
                            >
                                Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {showEditDialog && (
                        <AddRevenueDialog
                            revenueToEdit={revenue}
                        />
                    )}

                    {showDetailsDialog && (
                        <RevenueDetailsDialog
                            revenue={revenue}
                            open={showDetailsDialog}
                            onClose={() => setShowDetailsDialog(false)}
                            onUpdate={() => window.location.reload()}
                        />
                    )}

                    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente a transação e todas as parcelas associadas.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        axios.delete(`/revenue/${revenue.id}`)
                                            .then(() => window.location.reload())
                                            .catch(err => console.error("Erro ao excluir", err));
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            );
        },
    },
];
