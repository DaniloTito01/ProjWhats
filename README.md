# Zenni - Sistema de Envio de Mensagens WhatsApp

Zenni é uma plataforma SaaS (Software as a Service) completa para envio automatizado e em massa de mensagens WhatsApp, com recursos avançados de CRM e funil de vendas.

## Visão Geral

O Zenni foi projetado para empresas que desejam automatizar e escalar sua comunicação com clientes via WhatsApp. A plataforma oferece recursos como:

- Envio de mensagens em massa para contatos segmentados
- Campanhas automatizadas com mensagens personalizadas
- CRM integrado para gerenciamento de contatos
- Funil de vendas para acompanhamento de leads
- Multi-tenancy para suporte a múltiplas empresas
- Dashboard com métricas e análises

## Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT para autenticação
- Venom Bot para integração com WhatsApp

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- React Router
- Axios

### Infraestrutura
- Docker
- Docker Compose
- Nginx

## Estrutura do Projeto

```
zenni/
├── backend/             # API Node.js/Express
│   ├── src/
│   │   ├── config/      # Configurações
│   │   ├── controllers/ # Controladores
│   │   ├── middlewares/ # Middlewares
│   │   ├── models/      # Modelos Sequelize
│   │   ├── routes/      # Rotas da API
│   │   ├── services/    # Serviços
│   │   ├── utils/       # Utilitários
│   │   └── server.js    # Ponto de entrada
│   ├── Dockerfile
│   └── package.json
├── frontend/            # Aplicação React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── contexts/    # Contextos React
│   │   ├── pages/       # Páginas
│   │   ├── services/    # Serviços de API
│   │   └── types/       # Tipos TypeScript
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml   # Configuração Docker Compose
└── README.md            # Documentação
```

## Requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- PostgreSQL 14+ (para desenvolvimento local)

## Instalação e Execução

### Usando Docker (Recomendado)

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/zenni.git
   cd zenni
   ```

2. Inicie os contêineres:
   ```bash
   docker-compose up -d
   ```

3. Acesse a aplicação:
   - Frontend: http://localhost
   - API: http://localhost:3000
   - PgAdmin: http://localhost:5050

### Desenvolvimento Local

#### Backend

1. Navegue até o diretório do backend:
   ```bash
   cd zenni/backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. Inicie o servidor:
   ```bash
   npm run dev
   ```

#### Frontend

1. Navegue até o diretório do frontend:
   ```bash
   cd zenni/frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm start
   ```

## Funcionalidades Principais

### Autenticação e Multi-tenancy

- Registro de empresas e usuários
- Login com JWT
- Controle de acesso baseado em funções (admin, user)
- Isolamento de dados por empresa

### Gestão de Contatos

- Importação de contatos via CSV
- Segmentação por tags e estágios
- Histórico de interações
- Notas e atividades

### Campanhas de WhatsApp

- Criação de campanhas com mensagens personalizadas
- Agendamento de envios
- Segmentação de destinatários
- Monitoramento de entregas e respostas

### Funil de Vendas

- Estágios personalizáveis
- Movimentação de contatos entre estágios
- Métricas de conversão
- Previsão de vendas

### CRM

- Registro de atividades (ligações, reuniões, emails)
- Tarefas e lembretes
- Notas sobre contatos
- Histórico completo de interações

## API Endpoints

A documentação completa da API está disponível em `/api/docs` quando o servidor está em execução.

### Principais Endpoints

- `/api/auth` - Autenticação
- `/api/users` - Gestão de usuários
- `/api/companies` - Gestão de empresas
- `/api/contacts` - Gestão de contatos
- `/api/campaigns` - Gestão de campanhas
- `/api/stages` - Gestão de estágios do funil
- `/api/whatsapp` - Operações do WhatsApp
- `/api/sales-funnel` - Análises do funil de vendas
- `/api/crm` - Operações de CRM

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Para suporte ou dúvidas, entre em contato pelo email: suporte@zenni.com

# ProjWhats
