import { router } from '@inertiajs/react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Home, Mail, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const { post, processing: formProcessing } = useForm();
  const [homes, setHomes] = useState<HomeData[]>([]);
  const [invites, setInvites] = useState<InviteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Loading states for specific actions
  const [loggingOut, setLoggingOut] = useState(false);
  const [selectingHomeId, setSelectingHomeId] = useState<number | null>(null);
  const [processingInviteId, setProcessingInviteId] = useState<number | null>(null);

  // Dialog states
  const [inviteToDenyId, setInviteToDenyId] = useState<number | null>(null);
  const [messageDialog, setMessageDialog] = useState<{ open: boolean; title: string; description: string }>({
    open: false,
    title: '',
    description: ''
  });

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
    setLoggingOut(true);
    axios.post('/logout')
      .then(() => {
        router.visit('/');
      })
      .catch((error) => {
        console.error('Erro ao fazer logout:', error);
        setLoggingOut(false);
      });
  };

  const handleSelectHome = (homeId: number) => {
    setSelectingHomeId(homeId);
    axios.post('api/select-home', { homeId })
      .then(() => {
        router.visit('dashboard');
      })
      .catch((error) => {
        console.error('Erro ao selecionar casa:', error);
        setSelectingHomeId(null);
      });
  };

  const handleAcceptInvite = (id: number) => {
    setProcessingInviteId(id);
    axios.post(`api/invites/${id}/accept`)
      .then(() => {
        setMessageDialog({
          open: true,
          title: "Sucesso!",
          description: "Convite aceito com sucesso!"
        });
        fetchData();
      })
      .catch(err => {
        setMessageDialog({
          open: true,
          title: "Erro",
          description: "Não foi possível aceitar o convite."
        });
      })
      .finally(() => {
        setProcessingInviteId(null);
      });
  };

  const confirmDenyInvite = () => {
    if (inviteToDenyId === null) return;

    setProcessingInviteId(inviteToDenyId);
    setInviteToDenyId(null); // Close the confirm dialog

    axios.post(`api/invites/${inviteToDenyId}/deny`)
      .then(() => {
        fetchData();
      })
      .catch(err => {
        setMessageDialog({
          open: true,
          title: "Erro",
          description: "Não foi possível recusar o convite."
        });
      })
      .finally(() => {
        setProcessingInviteId(null);
      });
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
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Carregando suas casas...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {homes?.length > 0 ? (
                <div className="grid gap-4">
                  {homes.map((home) => (
                    <Button
                      key={home.id}
                      variant="outline"
                      className="flex h-auto w-full flex-col items-start p-4 hover:bg-accent hover:text-accent-foreground relative"
                      onClick={() => handleSelectHome(home.id)}
                      disabled={selectingHomeId !== null || loggingOut}
                    >
                      <div className="flex items-center w-full justify-between">
                        <span className="font-semibold text-lg">{home.name}</span>
                        {selectingHomeId === home.id && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                      </div>
                      {home.description && (
                        <span className="text-sm text-muted-foreground font-normal text-left">
                          {home.description}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border rounded-lg bg-muted/20 border-dashed">
                  <p className="text-muted-foreground">
                    Você ainda não participa de nenhuma casa.
                  </p>
                </div>
              )}

              <Link href="/create-home" className="w-full block">
                <Button variant={homes?.length > 0 ? "secondary" : "default"} className="w-full" disabled={selectingHomeId !== null || loggingOut}>
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
                      {processingInviteId === invite.id ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleAcceptInvite(invite.id)}
                            disabled={processingInviteId !== null}
                          >
                            Aceitar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-red-500 hover:text-red-900 border-red-200 hover:bg-red-50"
                            onClick={() => setInviteToDenyId(invite.id)}
                            disabled={processingInviteId !== null}
                          >
                            Recusar
                          </Button>
                        </>
                      )}
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
              disabled={loggingOut || selectingHomeId !== null}
            >
              {loggingOut ? <Loader2 className="h-3 w-3 animate-spin mr-1 inline" /> : null}
              Fazer Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages Dialog (Success/Error) */}
      <Dialog open={messageDialog.open} onOpenChange={(open) => setMessageDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messageDialog.title}</DialogTitle>
            <DialogDescription>
              {messageDialog.description}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Confirm Deny Dialog */}
      <AlertDialog open={inviteToDenyId !== null} onOpenChange={(open) => !open && setInviteToDenyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Você recusará o convite para esta casa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDenyInvite} className="bg-red-600 hover:bg-red-700">
              Recusar Convite
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}