import { router } from '@inertiajs/react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Home, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { useEffect, useState } from 'react';

// Tipagem da Casa
interface HomeData {
  id: number;
  name: string;
  description: string | null;
}

// Tipagem do Convite
interface InviteData {
  id: number;
  home: {
    id: number;
    name: string;
  }
  type: string;
}

export default function SelectHome() {
  const { post, processing } = useForm();
  const [homes, setHomes] = useState<HomeData[]>([]);
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [homesRes, invitesRes] = await Promise.all([
        axios.get('api/user-homes'),
        axios.get('api/invites')
      ]);
      setHomes(homesRes.data);
      setInvites(invitesRes.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    axios.post('/logout')
      .then(() => {
        router.visit('/');
      })
      .catch((error) => {
        console.error('Erro ao fazer logout:', error);
      });
  };

  const handleSelectHome = (homeId: number) => {
    axios.post('api/select-home', { homeId })
      .then(() => {
        router.visit('dashboard');
      })
      .catch((error) => {
        console.error('Erro ao selecionar casa:', error);
      });
  };

  const handleAcceptInvite = (id: number) => {
    axios.post(`api/invites/${id}/accept`)
      .then(() => {
        alert('Convite aceito!'); // Or simple toast
        fetchData(); // Refresh data
      })
      .catch(err => alert('Erro ao aceitar convite.'));
  };

  const handleDenyInvite = (id: number) => {
    if (confirm('Tem certeza que deseja recusar este convite?')) {
      axios.post(`api/invites/${id}/deny`)
        .then(() => {
          fetchData();
        })
        .catch(err => alert('Erro ao recusar convite.'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <Head title="Escolha sua Organização" />

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Home className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Bem-vindo de volta!</CardTitle>
          <CardDescription>
            Escolha uma organização para continuar.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center py-6">Carregando...</div>
          ) : (
            <div className="space-y-4">
              {homes?.length > 0 ? (
                <div className="grid gap-4">
                  {homes.map((home) => (
                    <Button
                      key={home.id}
                      variant="outline"
                      className="flex h-auto w-full flex-col items-start p-4 hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleSelectHome(home.id)}
                      disabled={processing}
                    >
                      <span className="font-semibold text-lg">{home.name}</span>
                      {home.description && (
                        <span className="text-sm text-muted-foreground font-normal">
                          {home.description}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-muted-foreground">
                    Você ainda não participa de nenhuma casa.
                  </p>
                </div>
              )}

              <Link href="/create-home" className="w-full block">
                <Button variant={homes?.length > 0 ? "secondary" : "default"} className="w-full">
                  {homes?.length > 0 ? "Cadastrar outra casa" : "Cadastrar nova casa"}
                </Button>
              </Link>
            </div>
          )}

          {/* Pending Invites Section */}
          {invites.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <h3 className="text-sm font-medium">Convites Pendentes</h3>
              </div>
              <div className="space-y-3">
                {invites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between rounded-lg border p-3 bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{invite.home.name}</p>
                      <p className="text-xs text-muted-foreground">Convite para participar</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => handleAcceptInvite(invite.id)}
                      >
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-red-500 hover:text-red-900 border-red-200 hover:bg-red-50"
                        onClick={() => handleDenyInvite(invite.id)}
                      >
                        Recusar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Deseja sair?{' '}
            <Button
              onClick={() => handleLogout()}
              variant="link"
              className="p-0 h-auto font-normal underline hover:text-primary"
            >
              Fazer Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}