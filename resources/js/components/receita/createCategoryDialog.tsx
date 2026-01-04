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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { PlusCircle } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'O nome da categoria é obrigatório.'),
});

type FormValues = z.infer<typeof formSchema>;

interface Category {
  id: number;
  name: string;
}

export function CreateCategoryDialog({ onCategoryCreated }: { onCategoryCreated?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  function onSubmit(values: FormValues) {
    axios.post('/categories', values)
      .then(response => {
        console.log("Categoria criada successfully", response.data);
        setOpen(false);
        form.reset();
        if (onCategoryCreated) {
          onCategoryCreated();
        } else {
          window.location.reload();
        }
      })
      .catch(error => {
        console.error("Erro ao criar categoria", error);
        if (error.response && error.response.status === 403) {
          alert("Você não tem permissão para criar categorias.");
        }
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Criar Categoria</DialogTitle>
              <DialogDescription>
                Adicione uma nova categoria geral.
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Alimentação, Transporte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
