import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export default function CreateHome() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/create-home', {
      onSuccess: () => {
        // Redirect is handled by backend usually
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <Head title="Criar Nova Casa" />

      <Card className="w-full max-w-md">
        <CardHeader>
          <div className='flex items-center gap-2 mb-2'>
            <Button variant="ghost" size="icon" onClick={() => window.history.back()} type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">Criar Nova Casa</CardTitle>
          </div>
          <CardDescription>
            Cadastre uma nova organização para gerenciar suas despesas.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Casa</Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Ex: Apartamento Praia"
                required
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Uma breve descrição..."
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={processing}>
                Criar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
