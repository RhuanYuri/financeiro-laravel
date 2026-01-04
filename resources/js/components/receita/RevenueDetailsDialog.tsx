'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface Installment {
  id: number;
  value: number;
  installments_number: number;
  status: 'paid' | 'open';
  dueDate: string;
  pay_day?: string;
}

interface Revenue {
  id: number;
  description: string;
  value: number;
  status: string;
  installments?: Installment[];
}

export function RevenueDetailsDialog({
  revenue,
  open,
  onClose,
  onUpdate
}: {
  revenue: Revenue | null,
  open: boolean,
  onClose: () => void,
  onUpdate: () => void
}) {
  const [installments, setInstallments] = React.useState<Installment[]>([]);
  // We need to track changes locally before saving.
  // Actually, user asked: "quando selecionar no checkbox aparecer a opção salvar".
  // This implies: Select checkboxes -> Click Save -> All selected get updated.
  // We can track pending status changes. 
  const [pendingChanges, setPendingChanges] = React.useState<Record<number, { status: 'paid' | 'open', pay_day?: string }>>({});

  React.useEffect(() => {
    if (revenue) {
      axios.get(`/revenue/${revenue.id}`)
        .then(res => {
          const sorted = (res.data.installments || []).sort((a: Installment, b: Installment) => a.installments_number - b.installments_number);
          setInstallments(sorted);
          setPendingChanges({});
        })
        .catch(err => console.error(err));
    }
  }, [revenue, open]);

  // Helper to parse YYYY-MM-DD as local date
  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleChange = (id: number, field: 'status' | 'pay_day', value: any) => {
    setPendingChanges(prev => {
      const currentInst = installments.find(i => i.id === id);
      const currentPending = prev[id] || { status: currentInst?.status || 'open', pay_day: currentInst?.pay_day };

      let newState = { ...currentPending };

      if (field === 'status') {
        newState.status = value ? 'paid' : 'open';
        if (value && !newState.pay_day) {
          // If checking 'paid' and no date set, default to today
          newState.pay_day = format(new Date(), 'yyyy-MM-dd');
        }
      } else if (field === 'pay_day') {
        newState.pay_day = value ? format(value, 'yyyy-MM-dd') : undefined;
        // If setting a date, automatically mark as paid
        if (value) newState.status = 'paid';
      }

      return { ...prev, [id]: newState };
    });
  };

  const handleSave = async () => {
    // Process all pending changes
    const promises = Object.entries(pendingChanges).map(([id, changes]) => {
      return axios.put(`/installments/${id}`, {
        status: changes.status,
        pay_day: changes.pay_day
      });
    });

    try {
      await Promise.all(promises);
      setPendingChanges({});
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar parcelas", error);
    }
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  if (!revenue) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Receita: {revenue.description}</DialogTitle>
          <DialogDescription>
            Selecione as parcelas para atualizar e clique em Salvar.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Pago</TableHead>
                <TableHead>Parcela</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installments.map((inst) => {
                const pending = pendingChanges[inst.id];
                const isPaid = pending ? pending.status === 'paid' : inst.status === 'paid';
                const payDay = pending && pending.pay_day !== undefined ? pending.pay_day : inst.pay_day;

                return (
                  <TableRow key={inst.id}>
                    <TableCell>
                      <Checkbox
                        checked={isPaid}
                        onCheckedChange={(checked) => handleChange(inst.id, 'status', checked)}
                      />
                    </TableCell>
                    <TableCell>
                      {inst.installments_number}ª
                    </TableCell>
                    <TableCell>
                      {format(parseLocalDate(inst.dueDate), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[140px] pl-3 text-left font-normal h-8",
                              !payDay && "text-muted-foreground"
                            )}
                          >
                            {payDay ? (
                              format(parseLocalDate(payDay), "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={payDay ? parseLocalDate(payDay) : undefined}
                            onSelect={(date) => handleChange(inst.id, 'pay_day', date)}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {Number(inst.value).toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {hasChanges && (
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
