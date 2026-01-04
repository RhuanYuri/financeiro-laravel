import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { AddRevenueDialog } from './addRevenueDialog'; // 1. Importe o novo componente

interface RevenueHeaderProps {
    onStatusChange: (status: string) => void;
}

export default function RevenueHeader({ onStatusChange }: RevenueHeaderProps) {
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
                <Select defaultValue="all" onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="open">Em Aberto</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                    </SelectContent>
                </Select>

                {/* 2. Renderize o componente de diálogo aqui */}
                <AddRevenueDialog />

            </div>
        </div>
    );
}
