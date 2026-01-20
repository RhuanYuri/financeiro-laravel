'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { CreateCategoryDialog } from './createCategoryDialog';
import { CurrencyInput } from '@/components/ui/currency-input';

// 1. Definição do Schema com Zod
const formSchema = z.object({
    description: z.string().min(2, "Descrição deve ter pelo menos 2 caracteres"),
    value: z.coerce.number().min(0.01, "O valor deve ser maior que 0"),
    total_installments: z.coerce.number().min(1, "Mínimo de 1 parcela"),
    isPublic: z.boolean().default(false),
    member_id: z.string().min(1, "Selecione um membro"),
    category_id: z.string().min(1, "Selecione uma categoria"),
    first_due_date: z.date(),
    status: z.string().nullish(),
    type: z.enum(['revenue', 'expense']),
    is_installment_value: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface Member {
    id: number;
    name: string;
    is_current_user: boolean;
}

interface Category {
    id: number;
    name: string;
}

export function AddRevenueDialog({ revenueToEdit }: { revenueToEdit?: any }) {
    const [open, setOpen] = React.useState(false);
    const [members, setMembers] = React.useState<Member[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            description: '',
            value: 0,
            total_installments: 1,
            isPublic: false,
            member_id: '',
            category_id: '',
            first_due_date: new Date(),
            status: 'open',
            type: 'revenue',
            is_installment_value: false,
        },
    });

    React.useEffect(() => {
        if (revenueToEdit) {
            form.reset({
                description: revenueToEdit.description,
                value: Number(revenueToEdit.value),
                total_installments: revenueToEdit.total_installments || 1,
                isPublic: Boolean(revenueToEdit.isPublic),
                member_id: revenueToEdit.member_id?.toString() || '',
                category_id: revenueToEdit.category_id?.toString() || '',
                first_due_date: new Date(revenueToEdit.date),
                status: revenueToEdit.status,
                type: revenueToEdit.type || 'revenue',
                is_installment_value: false,
            });
            setOpen(true);
        }
    }, [revenueToEdit, form]);

    const fetchCategories = () => {
        axios.get('/categories')
            .then(res => setCategories(res.data))
            .catch(err => console.error("Erro ao buscar categorias", err));
    };

    React.useEffect(() => {
        if (open) {
            axios.get('/revenue/members')
                .then(response => {
                    setMembers(response.data);
                    const currentUser = response.data.find((m: Member) => m.is_current_user);
                    if (currentUser && !form.getValues('member_id') && !revenueToEdit) {
                        form.setValue('member_id', currentUser.id.toString());
                    }
                })
                .catch(err => console.error("Erro ao buscar membros", err));

            fetchCategories();
        }
    }, [open, form, revenueToEdit]);

    function onSubmit(values: FormValues) {
        setIsLoading(true); // Start loading
        let finalValue = values.value;

        // If user input represents installment value, multiply by total installments
        if (values.is_installment_value && values.total_installments > 1) {
            finalValue = values.value * values.total_installments;
        }

        const dataToSend = {
            description: values.description,
            value: finalValue, // Use calculated total value
            total_installments: values.total_installments,
            member_id: values.member_id,
            category_id: values.category_id,
            isPublic: values.isPublic,
            status: values.status,
            type: values.type,
            date: format(values.first_due_date, 'yyyy-MM-dd'),
        };

        const request = revenueToEdit
            ? axios.put(`/revenue/${revenueToEdit.id}`, dataToSend)
            : axios.post('/revenue', dataToSend);

        request
            .then(response => {
                console.log(revenueToEdit ? "Transação atualizada!" : "Transação criada!", response.data);
                setOpen(false);
                form.reset();
                window.location.reload();
            })
            .catch(error => {
                console.error("Erro ao salvar transação:", error);
            })
            .finally(() => {
                setIsLoading(false); // Stop loading
            });
    }

    // Trigger differs based on mode. If editing, we don't show the default trigger button here
    // but rather rely on parent passing revenueToEdit.
    // However, to keep it simple and reusable as a standalone button too:

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!revenueToEdit && (
                <DialogTrigger asChild>
                    <Button className="w-full md:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Cadastrar Receita/Despesa
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>{revenueToEdit ? 'Editar Transação' : 'Cadastrar Nova Transação'}</DialogTitle>
                            <DialogDescription>
                                {revenueToEdit ? 'Atualize os dados.' : 'Preencha os campos abaixo.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="revenue">Receita</SelectItem>
                                                <SelectItem value="expense">Despesa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Salário, Aluguel..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor Total</FormLabel>
                                        <FormControl>
                                            <CurrencyInput
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="R$ 0,00"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="total_installments"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nº de Parcelas</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" step="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="first_due_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{form.watch('status') === 'paid' ? 'Data do Pagamento' : 'Data 1º Vencimento'}</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn(
                                                            'w-full pl-3 text-left font-normal',
                                                            !field.value && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, 'PPP', { locale: ptBR })
                                                        ) : (
                                                            <span>Escolha uma data</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) => date < new Date('1900-01-01')}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="member_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Membro</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um membro" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {members.map((member) => (
                                                    <SelectItem key={member.id} value={member.id.toString()}>
                                                        {member.name} {member.is_current_user && '(Você)'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center justify-between">
                                            Categoria
                                            <CreateCategoryDialog onCategoryCreated={fetchCategories} />
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma categoria" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value as string}
                                            disabled={!!revenueToEdit} // Disable status editing if editing existing revenue
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="open">Em Aberto</SelectItem>
                                                <SelectItem value="paid" disabled={!!revenueToEdit}>Pago (Gerencie via parcelas)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {revenueToEdit && <FormDescription>O status é gerenciado pelas parcelas.</FormDescription>}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_installment_value"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Valor por Parcela?</FormLabel>
                                            <FormDescription>
                                                Se marcado, o valor informado será multiplicado pelo número de parcelas para o total.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isPublic"
                                render={({ field }) => (
                                    <FormItem className="col-span-2 flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Receita Pública</FormLabel>
                                            <FormDescription>
                                                Se ativado, outros membros da casa verão esta receita.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Receita'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
