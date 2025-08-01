import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Users, AlertTriangle, Eye, HardDrive, Cpu, Monitor, Wifi, LogOut, UserPlus, Settings, Search, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import brvaTechLogo from "@/assets/brvatech-logo-new.svg";
import vezanLogo from "@/assets/vezan-logo-new.png";
import { UserRegistrationModal } from "@/components/UserRegistrationModal";
import { RemoteAccessModal } from "@/components/RemoteAccessModal";
import { differenceInDays } from "date-fns";
import axios from "axios";

// Interface para tipagem dos dados dos clientes
interface Client {
  id: string;
  cnpj: string;
  razao: string;
  regime: string;
  statussos: string;
  hdtotal: string;
  hdlivre: string;
  processador: string;
  memoria: string;
  data: string;
  hora: string;
  revenda: string;
  datamonitor: string;
  horamonitor: string;
  tipoconexao: string;
  versaosos: string;
  conta?: string;
  codigoautorizacao?: string;
  servidor?: string;
  cnae?: string;
  uf?: string;
}

// Interface para acessos remotos
interface RemoteAccess {
  id: string;
  idcliente: string;
  tipoacesso: string;
  acessoid: string;
  nomepc: string;
  senha: string;
}

// Dados fictícios de acessos remotos
const remoteAccesses: RemoteAccess[] = [
  {
    id: "1",
    idcliente: "2",
    tipoacesso: "Anydesk",
    acessoid: "123456789",
    nomepc: "CAIXA01",
    senha: "12345678"
  },
  {
    id: "2",
    idcliente: "2",
    tipoacesso: "Anydesk",
    acessoid: "987654321",
    nomepc: "SERVIDOR",
    senha: "87654321"
  },
  {
    id: "3",
    idcliente: "3",
    tipoacesso: "Anydesk",
    acessoid: "1615577122",
    nomepc: "CAIXA01",
    senha: "senha123"
  },
  {
    id: "4",
    idcliente: "4",
    tipoacesso: "Anydesk",
    acessoid: "456789123",
    nomepc: "PRINCIPAL",
    senha: "acesso456"
  },
  {
    id: "5",
    idcliente: "5",
    tipoacesso: "Anydesk",
    acessoid: "789123456",
    nomepc: "CAIXA01",
    senha: "william123"
  },
  {
    id: "6",
    idcliente: "11",
    tipoacesso: "Anydesk",
    acessoid: "321654987",
    nomepc: "SERVIDOR",
    senha: "romar2025"
  },
  {
    id: "7",
    idcliente: "33",
    tipoacesso: "Anydesk",
    acessoid: "654987321",
    nomepc: "CAIXA01",
    senha: "farias789"
  },
  {
    id: "8",
    idcliente: "43",
    tipoacesso: "Anydesk",
    acessoid: "159753486",
    nomepc: "PRINCIPAL",
    senha: "economia123"
  },
  {
    id: "9",
    idcliente: "26",
    tipoacesso: "Anydesk",
    acessoid: "486159753",
    nomepc: "CAIXA01",
    senha: "rodris456"
  }
];

const Dashboard = () => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ATIVO' | 'INATIVO' | 'ATUALIZADO' | 'DESATUALIZADO'>('ALL');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [remoteAccessModalOpen, setRemoteAccessModalOpen] = useState(false);
  const [selectedClientForAccess, setSelectedClientForAccess] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

// Dados dos clientes Banco Mysql
  const [realClients, setRealClients] = useState<Client[]>([]);

useEffect(() => {
  axios.get("http://localhost:3000/clientes") // ou sua rota correta
    .then(response => {
      setRealClients(response.data); // assume que data tem o array igual
    })
    .catch(error => {
      console.error("Erro ao buscar os clientes:", error);
    });
}, []);
  // Dados dos Acessos Banco Mysql
  const [remoteAccesses, setRemoteAccesses] = useState<RemoteAccess[]>([]);

  useEffect(() => {
    axios.get("http://localhost:3000/acessos")
      .then(response => {
        setRemoteAccesses(response.data);
      })
      .catch(error => {
        console.error("Erro ao buscar os acessos remotos:", error);
      });
  }, []);


  // Agrupar clientes por revenda
  const clientsByRevenda = realClients.reduce((acc, client) => {
    if (!acc[client.revenda]) {
      acc[client.revenda] = [];
    }
    acc[client.revenda].push(client);
    return acc;
  }, {} as Record<string, Client[]>);

  // Filtrar clientes baseado no status selecionado e termo de pesquisa
  const statusFilteredClients = statusFilter === 'ALL' 
    ? realClients 
    : statusFilter === 'ATUALIZADO' 
      ? realClients.filter(client => {
          if (client.statussos !== "ATIVO") return false;
          const [day, month, year] = client.data.split('/');
          const lastConsultDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          const daysDiff = differenceInDays(new Date(), lastConsultDate);
          return daysDiff <= 2;
        })
      : statusFilter === 'DESATUALIZADO'
        ? realClients.filter(client => {
            if (client.statussos !== "ATIVO") return false;
            const [day, month, year] = client.data.split('/');
            const lastConsultDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const daysDiff = differenceInDays(new Date(), lastConsultDate);
            return daysDiff > 2;
          })
        : realClients.filter(client => client.statussos === statusFilter);
  
  // Aplicar filtro de pesquisa
  const filteredClients = statusFilteredClients.filter(client =>
    client.razao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cnpj.includes(searchTerm) ||
    client.id.includes(searchTerm)
  );
  const filteredClientsByRevenda = filteredClients.reduce((acc, client) => {
    if (!acc[client.revenda]) {
      acc[client.revenda] = [];
    }
    acc[client.revenda].push(client);
    return acc;
  }, {} as Record<string, Client[]>);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    toast({
      title: "✅ Logout realizado",
      description: "Você foi desconectado com sucesso.",
      variant: "default",
      className: "bg-green-50 border-green-200 text-green-800"
    });
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split('/');
    return `${day}/${month}/${year}`;
  };

  // Função para obter status com verificação de desatualização
  const getClientStatus = (client: Client) => {
    if (client.statussos === "ATIVO") {
      // Verificar se última consulta foi há mais de 2 dias
      const [day, month, year] = client.data.split('/');
      const lastConsultDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const daysDiff = differenceInDays(new Date(), lastConsultDate);
      
      if (daysDiff > 2) {
        return {
          label: "DESATUALIZADO",
          variant: "secondary" as const,
          className: "bg-amber-500 hover:bg-amber-600 text-white"
        };
      }
      return {
        label: "ATUALIZADO",
        variant: "default" as const,
        className: "bg-green-600 hover:bg-green-700 text-white"
      };
    } else {
      return {
        label: "INATIVO",
        variant: "destructive" as const,
        className: ""
      };
    }
  };

  // Calcular estatísticas dos clientes - SEMPRE usar dados completos (não filtrados)
  const totalClients = realClients.length;
  const inactiveClients = realClients.filter(client => client.statussos === "INATIVO").length;
  const activeClients = realClients.filter(client => client.statussos === "ATIVO");
  
  const updatedClients = activeClients.filter(client => {
    const [day, month, year] = client.data.split('/');
    const lastConsultDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const daysDiff = differenceInDays(new Date(), lastConsultDate);
    return daysDiff <= 2;
  }).length;
  
  const outdatedClients = activeClients.filter(client => {
    const [day, month, year] = client.data.split('/');
    const lastConsultDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const daysDiff = differenceInDays(new Date(), lastConsultDate);
    return daysDiff > 2;
  }).length;

  // Função para verificar status de monitoramento
  const getMonitoringStatus = (client: Client) => {
    const now = new Date();
    const [day, month, year] = client.datamonitor.split('/');
    const [hours, minutes, seconds] = client.horamonitor.split(':');
    const monitorDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
    const diffInMinutes = (now.getTime() - monitorDateTime.getTime()) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;

    // Se passou mais de 24 horas ou mais de 5 minutos, status ruim (vermelho)
    if (diffInHours > 24 || diffInMinutes > 5) {
      return {
        color: 'red',
        status: 'offline'
      };
    }

    // Se está dentro de 5 minutos e no dia, status bom (verde)
    return {
      color: 'green',
      status: 'online'
    };
  };

  // Função para abrir AnyDesk
  const openAnyDesk = (accessId: string) => {
    const anydeskUrl = `anydesk:${accessId}`;
    window.open(anydeskUrl, '_blank');
    toast({
      title: "AnyDesk",
      description: `Tentando conectar ao ID: ${accessId}`,
    });
  };

  // Componente do modal de detalhes
  const ClientDetailModal = ({ client }: { client: Client }) => {
    // Buscar acessos remotos do cliente
    const clientAccesses = remoteAccesses.filter(access => access.idcliente === client.id);
    
    return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">{client.razao}</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-6 mt-6">
        {/* Grid com duas colunas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna esquerda: Informações Básicas + Monitor SOS */}
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Informações Básicas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CNPJ:</span>
                  <span className="font-medium">{client.cnpj}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Regime:</span>
                  <span className="font-medium">{client.regime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const status = getClientStatus(client);
                      return (
                        <>
                          {status.label === "ATUALIZADO" ? (
                            <CheckCircle className="h-5 w-5 text-green-600 font-bold" strokeWidth={2.5} />
                          ) : status.label === "DESATUALIZADO" ? (
                            <AlertTriangle className="h-5 w-5 text-amber-500 font-bold" strokeWidth={2.5} />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive font-bold" strokeWidth={2.5} />
                          )}
                          <Badge variant={status.variant} className={`font-semibold ${status.className}`}>
                            {status.label}
                          </Badge>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Revenda:</span>
                  <img 
                    src={client.revenda === "Brvatech" ? brvaTechLogo : vezanLogo} 
                    alt={`${client.revenda} logo`} 
                    className={client.revenda === "Brvatech" ? "h-5 w-auto object-contain" : "h-6 w-auto object-contain"} 
                  />
                </div>
              </div>
            </div>

            {/* Monitor SOS */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Monitor SOS</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última Consulta SOS:</span>
                  <span className="font-medium">{formatDate(client.data)} às {client.hora}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última Atualização Monitor:</span>
                  <span className="font-medium">{formatDate(client.datamonitor)} às {client.horamonitor}</span>
                </div>
                {client.uf && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UF:</span>
                    <span className="font-medium">{client.uf}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna direita: Especificações Técnicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Especificações Técnicas</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Armazenamento</span>
              </div>
              <div className="pl-6 space-y-3">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">HD Total: </span>
                  <span className="text-sm">{client.hdtotal}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2 mt-4">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Hardware</span>
              </div>
              <div className="pl-6 space-y-3">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">Processador: </span>
                  <span className="text-sm break-words leading-tight" title={client.processador}>
                    {client.processador}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">Memória: </span>
                  <span className="text-sm">{client.memoria}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2 mt-4">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Sistema</span>
              </div>
              <div className="pl-6 space-y-3">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">Versão SOS: </span>
                  <span className="text-sm">{client.versaosos}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground text-sm">Tipo Conexão: </span>
                  <span className="text-sm">{client.tipoconexao}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acessos Remotos - Fora do grid, com layout melhorado */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Acessos Remotos</h3>
          {clientAccesses.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 p-3 grid grid-cols-[2fr,1fr,1fr,auto] gap-4 text-sm font-medium">
                <span>Nome do Acesso</span>
                <span>Tipo</span>
                <span>ID de Acesso</span>
                <span className="text-right">Ações</span>
              </div>
              {clientAccesses.map((access) => (
                <div key={access.id} className="p-3 grid grid-cols-[2fr,1fr,1fr,auto] gap-4 items-center border-t">
                  <span className="font-medium">{access.nomepc}</span>
                  <span className="text-sm text-muted-foreground">{access.tipoacesso}</span>
                  <span className="text-sm font-mono">{access.acessoid}</span>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 border border-border"
                      onClick={() => openAnyDesk(access.acessoid)}
                      title="Conectar via AnyDesk"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 border border-dashed rounded-lg">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Nenhum acesso remoto cadastrado</p>
            </div>
          )}
        </div>

        {/* Informações Adicionais */}
        {(client.conta || client.servidor || client.cnae) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Informações Adicionais</h3>
            <div className="space-y-3">
              {client.conta && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conta:</span>
                  <span className="font-medium">{client.conta}</span>
                </div>
              )}
              {client.cnae && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CNAE:</span>
                  <span className="font-medium">{client.cnae}</span>
                </div>
              )}
              {client.servidor && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servidor:</span>
                  <span className="text-xs break-all">{client.servidor}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with title and navigation menu */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 lg:gap-6">
          {/* Page title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Painel de Clientes</h1>
            <p className="text-muted-foreground">Monitore o status e atividade dos seus clientes</p>
          </div>

          {/* Navigation menu */}
          <nav className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserModalOpen(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-full sm:w-auto justify-start sm:justify-center"
            >
              <UserPlus className="h-4 w-4" />
              Cadastro de Usuario
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-full sm:w-auto justify-start sm:justify-center"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </nav>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('ALL')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('ATUALIZADO')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Atualizados</CardTitle>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{updatedClients}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('DESATUALIZADO')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Desatualizados</CardTitle>
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{outdatedClients}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('INATIVO')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Inativos</CardTitle>
              <XCircle className="h-6 w-6 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{inactiveClients}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alerta para clientes inativos */}
        {inactiveClients > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Atenção! Você tem {inactiveClients} cliente{inactiveClients > 1 ? 's' : ''} inativo{inactiveClients > 1 ? 's' : ''} que precisa{inactiveClients > 1 ? 'm' : ''} de atenção.
            </AlertDescription>
          </Alert>
        )}

        {/* Campo de Pesquisa */}
        <div className="relative w-full max-w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar cliente por nome, CNPJ ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-base w-full"
          />
        </div>

        {/* Clientes Agrupados por Revenda */}
        {Object.entries(filteredClientsByRevenda).map(([revenda, clients]) => (
          <div key={revenda} className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex justify-center sm:justify-start">
                <img src={revenda === "Brvatech" ? brvaTechLogo : vezanLogo} alt={`${revenda} logo`} className={revenda === "Brvatech" ? "h-8 w-auto object-contain" : "h-9 w-auto object-contain"} />
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  {clients.filter(c => {
                    if (c.statussos !== "ATIVO") return false;
                    const [day, month, year] = c.data.split('/');
                    const lastConsultDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    const daysDiff = differenceInDays(new Date(), lastConsultDate);
                    return daysDiff <= 2;
                  }).length} atualizados
                </span>
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  {clients.filter(c => {
                    if (c.statussos !== "ATIVO") return false;
                    const [day, month, year] = c.data.split('/');
                    const lastConsultDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    const daysDiff = differenceInDays(new Date(), lastConsultDate);
                    return daysDiff > 2;
                  }).length} desatualizados
                </span>
                <span className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  {clients.filter(c => c.statussos === "INATIVO").length} inativos
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  {clients.length} total
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {clients.map(client => {
                const monitoringStatus = getMonitoringStatus(client);
                return (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm font-medium leading-tight truncate" title={client.razao}>
                                {client.razao}
                              </CardTitle>
                              {(() => {
                                const status = getClientStatus(client);
                                return status.label === "ATUALIZADO" ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 font-bold flex-shrink-0" strokeWidth={2.5} />
                                ) : status.label === "DESATUALIZADO" ? (
                                  <AlertTriangle className="h-4 w-4 text-amber-500 font-bold flex-shrink-0" strokeWidth={2.5} />
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive font-bold flex-shrink-0" strokeWidth={2.5} />
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Wifi className={`h-4 w-4 ${monitoringStatus.color === 'green' ? 'text-green-600' : 'text-destructive'}`} />
                          <span className={`text-xs font-medium ${monitoringStatus.color === 'green' ? 'text-green-600' : 'text-destructive'}`}>
                            {monitoringStatus.status === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">CNPJ:</span>
                          <span className="font-mono text-xs">{client.cnpj}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Status:</span>
                          {(() => {
                            const status = getClientStatus(client);
                            return (
                              <Badge variant={status.variant} className={`text-xs font-semibold ${status.className}`}>
                                {status.label}
                              </Badge>
                            );
                          })()}
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Última Consulta:</span>
                          <span className="text-xs">{formatDate(client.data)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedClient(client)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </DialogTrigger>
                          {selectedClient && <ClientDetailModal client={selectedClient} />}
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setSelectedClientForAccess(client);
                            setRemoteAccessModalOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Cadastrar Acesso
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <UserRegistrationModal 
        open={userModalOpen} 
        onOpenChange={setUserModalOpen} 
      />
      
      <RemoteAccessModal 
        open={remoteAccessModalOpen} 
        onOpenChange={setRemoteAccessModalOpen}
        client={selectedClientForAccess}
      />
    </div>
  );
};

export default Dashboard;
