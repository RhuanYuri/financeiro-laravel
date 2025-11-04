// src/components/receita/revenue-header.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Search } from 'lucide-react';

export default function RevenueHeader() {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
                Minhas Receitas
            </h1>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
            {/* Filtro de Pesquisa */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                    type="search"
                    placeholder="Buscar por descrição..."
                    className="w-full pl-8 md:w-[300px]"
                        />
                </div>

                {/* Filtro de Status */}
                <Select defaultValue="all">
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                        <SelectItem value="overdue">Vencido</SelectItem>
                    </SelectContent>
                </Select>

                {/* Botão de Cadastrar */}
                <Button className="w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Cadastrar Receita
                </Button>
            </div>
        </div>
);
}
