import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react'; // Correct import for Head
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { useToast } from '@/hooks/use-toast';

interface Member {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

const breadcrumbs = [
  {
    title: 'Membros',
    href: '/membros',
  },
];

export default function Membros() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  // const { toast } = useToast(); // If using shadcn toast, uncomment and use

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = () => {
    axios.get('/api/members')
      .then(res => setMembers(res.data))
      .catch(err => console.error(err));
  };

  const handleInvite = () => {
    setLoading(true);
    axios.post('/api/members/invite', { email: inviteEmail })
      .then(() => {
        alert('Convite enviado com sucesso!'); // Replace with Toast
        setIsInviteOpen(false);
        setInviteEmail('');
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Erro ao enviar convite.';
        alert(msg);
      })
      .finally(() => setLoading(false));
  };

  const handleRemove = (id: number) => {
    if (confirm('Tem certeza que deseja remover este membro?')) {
      axios.delete(`/api/members/${id}`)
        .then(() => {
          fetchMembers();
        })
        .catch(err => alert('Erro ao remover membro.'));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Membros" />
      <div className="flex flex-1 flex-col gap-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Membros da Casa</h1>

          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Convidar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Membro</DialogTitle>
                <DialogDescription>
                  Insira o e-mail do usuário que deseja convidar para esta casa.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    placeholder="usuario@exemplo.com"
                    className="col-span-3"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleInvite} disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Convite'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Membros</CardTitle>
            <CardDescription>
              Gerencie quem tem acesso a esta casa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Entrou em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>{member.joined_at}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(member.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {members.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Nenhum membro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
