# Documentação da API Zenni

Esta documentação descreve os endpoints disponíveis na API do Zenni, um sistema SaaS para envio automatizado e em massa de mensagens WhatsApp.

## Índice

1. [Autenticação](#autenticação)
2. [Usuários](#usuários)
3. [Empresas](#empresas)
4. [Contatos](#contatos)
5. [Campanhas](#campanhas)
6. [Estágios do Funil](#estágios-do-funil)
7. [WhatsApp](#whatsapp)
8. [Funil de Vendas](#funil-de-vendas)
9. [CRM](#crm)

## Base URL

Todas as URLs listadas são relativas à base URL da API:

```
http://localhost:3000/api
```

## Autenticação

A API utiliza autenticação baseada em JWT (JSON Web Token). Para acessar endpoints protegidos, inclua o token no cabeçalho de autorização:

```
Authorization: Bearer <seu_token>
```

### Endpoints de Autenticação

#### Registro de Empresa e Usuário Administrador

```
POST /auth/register
```

**Corpo da Requisição:**
```json
{
  "user": {
    "name": "Nome do Administrador",
    "email": "admin@empresa.com",
    "password": "senha123"
  },
  "company": {
    "name": "Nome da Empresa",
    "domain": "empresa.com",
    "plan": "basic"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Registro realizado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "name": "Nome do Administrador",
      "email": "admin@empresa.com",
      "role": "admin",
      "companyId": 1
    },
    "company": {
      "id": 1,
      "name": "Nome da Empresa",
      "domain": "empresa.com",
      "plan": "basic",
      "active": true
    }
  }
}
```

#### Login

```
POST /auth/login
```

**Corpo da Requisição:**
```json
{
  "email": "admin@empresa.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Nome do Administrador",
      "email": "admin@empresa.com",
      "role": "admin",
      "companyId": 1
    },
    "company": {
      "id": 1,
      "name": "Nome da Empresa",
      "domain": "empresa.com",
      "plan": "basic",
      "active": true
    }
  }
}
```

#### Verificar Token

```
GET /auth/verify
```

**Cabeçalhos:**
```
Authorization: Bearer <seu_token>
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Nome do Administrador",
      "email": "admin@empresa.com",
      "role": "admin",
      "companyId": 1
    },
    "company": {
      "id": 1,
      "name": "Nome da Empresa",
      "domain": "empresa.com",
      "plan": "basic",
      "active": true
    }
  }
}
```

## Usuários

### Endpoints de Usuários

#### Listar Usuários

```
GET /users
```

**Parâmetros de Consulta:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Limite de itens por página (padrão: 10)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Nome do Administrador",
        "email": "admin@empresa.com",
        "role": "admin",
        "active": true
      },
      {
        "id": 2,
        "name": "Nome do Usuário",
        "email": "usuario@empresa.com",
        "role": "user",
        "active": true
      }
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

#### Obter Usuário

```
GET /users/:id
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nome do Administrador",
    "email": "admin@empresa.com",
    "role": "admin",
    "active": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Criar Usuário

```
POST /users
```

**Corpo da Requisição:**
```json
{
  "name": "Novo Usuário",
  "email": "novo@empresa.com",
  "password": "senha123",
  "role": "user"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "id": 3,
    "name": "Novo Usuário",
    "email": "novo@empresa.com",
    "role": "user",
    "active": true
  }
}
```

#### Atualizar Usuário

```
PUT /users/:id
```

**Corpo da Requisição:**
```json
{
  "name": "Usuário Atualizado",
  "role": "admin"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "data": {
    "id": 3,
    "name": "Usuário Atualizado",
    "email": "novo@empresa.com",
    "role": "admin",
    "active": true
  }
}
```

#### Desativar Usuário

```
DELETE /users/:id
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário desativado com sucesso"
}
```

## Empresas

### Endpoints de Empresas

#### Obter Empresa Atual

```
GET /companies/current
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nome da Empresa",
    "domain": "empresa.com",
    "plan": "basic",
    "active": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Atualizar Empresa

```
PUT /companies/current
```

**Corpo da Requisição:**
```json
{
  "name": "Novo Nome da Empresa",
  "plan": "premium"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Empresa atualizada com sucesso",
  "data": {
    "id": 1,
    "name": "Novo Nome da Empresa",
    "domain": "empresa.com",
    "plan": "premium",
    "active": true
  }
}
```

## Contatos

### Endpoints de Contatos

#### Listar Contatos

```
GET /contacts
```

**Parâmetros de Consulta:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Limite de itens por página (padrão: 10)
- `search` (opcional): Termo de busca
- `stageId` (opcional): Filtrar por estágio
- `tags` (opcional): Filtrar por tags (separadas por vírgula)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": 1,
        "name": "Nome do Contato",
        "phone": "5511999999999",
        "email": "contato@exemplo.com",
        "tags": ["lead", "website"],
        "stageId": 1,
        "stage": {
          "id": 1,
          "name": "Novo Lead",
          "color": "#3498db"
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

#### Obter Contato

```
GET /contacts/:id
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nome do Contato",
    "phone": "5511999999999",
    "email": "contato@exemplo.com",
    "address": "Endereço do Contato",
    "city": "Cidade",
    "state": "Estado",
    "zipCode": "00000-000",
    "tags": ["lead", "website"],
    "notes": "Observações sobre o contato",
    "stageId": 1,
    "stage": {
      "id": 1,
      "name": "Novo Lead",
      "color": "#3498db"
    },
    "active": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Criar Contato

```
POST /contacts
```

**Corpo da Requisição:**
```json
{
  "name": "Novo Contato",
  "phone": "5511999999999",
  "email": "novo@exemplo.com",
  "tags": ["lead", "website"],
  "stageId": 1
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Contato criado com sucesso",
  "data": {
    "id": 2,
    "name": "Novo Contato",
    "phone": "5511999999999",
    "email": "novo@exemplo.com",
    "tags": ["lead", "website"],
    "stageId": 1,
    "active": true
  }
}
```

#### Atualizar Contato

```
PUT /contacts/:id
```

**Corpo da Requisição:**
```json
{
  "name": "Contato Atualizado",
  "tags": ["lead", "website", "cliente"]
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Contato atualizado com sucesso",
  "data": {
    "id": 2,
    "name": "Contato Atualizado",
    "phone": "5511999999999",
    "email": "novo@exemplo.com",
    "tags": ["lead", "website", "cliente"],
    "stageId": 1,
    "active": true
  }
}
```

#### Desativar Contato

```
DELETE /contacts/:id
```

**Resposta:**
```json
{
  "success": true,
  "message": "Contato desativado com sucesso"
}
```

#### Importar Contatos

```
POST /contacts/import
```

**Corpo da Requisição:**
Formulário multipart com arquivo CSV

**Resposta:**
```json
{
  "success": true,
  "message": "Importação concluída",
  "data": {
    "totalProcessed": 10,
    "successCount": 8,
    "errorCount": 2,
    "errors": [
      {
        "row": 3,
        "data": {
          "nome": "Contato Com Erro",
          "telefone": "telefone_invalido"
        },
        "error": "Telefone inválido"
      }
    ]
  }
}
```

#### Adicionar Tags

```
POST /contacts/:id/tags
```

**Corpo da Requisição:**
```json
{
  "tags": ["vip", "prioridade"]
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Tags adicionadas com sucesso",
  "data": {
    "id": 2,
    "tags": ["lead", "website", "cliente", "vip", "prioridade"]
  }
}
```

#### Remover Tags

```
DELETE /contacts/:id/tags
```

**Corpo da Requisição:**
```json
{
  "tags": ["website"]
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Tags removidas com sucesso",
  "data": {
    "id": 2,
    "tags": ["lead", "cliente", "vip", "prioridade"]
  }
}
```

#### Mover para Estágio

```
PUT /contacts/:id/stage
```

**Corpo da Requisição:**
```json
{
  "stageId": 2
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Contato movido para o estágio com sucesso",
  "data": {
    "id": 2,
    "stageId": 2,
    "stage": {
      "id": 2,
      "name": "Qualificado",
      "color": "#2ecc71"
    }
  }
}
```

## Campanhas

### Endpoints de Campanhas

#### Listar Campanhas

```
GET /campaigns
```

**Parâmetros de Consulta:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Limite de itens por página (padrão: 10)
- `status` (opcional): Filtrar por status (draft, scheduled, in_progress, completed, cancelled, error)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": 1,
        "name": "Campanha de Boas-vindas",
        "status": "draft",
        "totalContacts": 0,
        "sentCount": 0,
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

#### Obter Campanha

```
GET /campaigns/:id
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Campanha de Boas-vindas",
    "description": "Mensagem de boas-vindas para novos leads",
    "message": "Olá {nome}, seja bem-vindo! Estamos felizes em ter você como cliente.",
    "status": "draft",
    "filters": {
      "tags": ["lead"]
    },
    "totalContacts": 0,
    "sentCount": 0,
    "deliveredCount": 0,
    "readCount": 0,
    "responseCount": 0,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Criar Campanha

```
POST /campaigns
```

**Corpo da Requisição:**
```json
{
  "name": "Nova Campanha",
  "description": "Descrição da campanha",
  "message": "Olá {nome}, temos uma oferta especial para você!",
  "filters": {
    "tags": ["cliente"],
    "stageId": 2
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Campanha criada com sucesso",
  "data": {
    "id": 2,
    "name": "Nova Campanha",
    "description": "Descrição da campanha",
    "message": "Olá {nome}, temos uma oferta especial para você!",
    "status": "draft",
    "filters": {
      "tags": ["cliente"],
      "stageId": 2
    },
    "totalContacts": 0,
    "sentCount": 0,
    "deliveredCount": 0,
    "readCount": 0,
    "responseCount": 0
  }
}
```

#### Atualizar Campanha

```
PUT /campaigns/:id
```

**Corpo da Requisição:**
```json
{
  "name": "Campanha Atualizada",
  "message": "Olá {nome}, temos uma super oferta para você!"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Campanha atualizada com sucesso",
  "data": {
    "id": 2,
    "name": "Campanha Atualizada",
    "message": "Olá {nome}, temos uma super oferta para você!",
    "status": "draft"
  }
}
```

#### Preparar Campanha

```
POST /campaigns/:id/prepare
```

**Resposta:**
```json
{
  "success": true,
  "message": "Campanha preparada com sucesso",
  "data": {
    "campaign": {
      "id": 2,
      "name": "Campanha Atualizada",
      "status": "scheduled",
      "totalContacts": 15
    },
    "totalContacts": 15
  }
}
```

#### Iniciar Campanha

```
POST /campaigns/:id/start
```

**Resposta:**
```json
{
  "success": true,
  "message": "Campanha iniciada com sucesso",
  "data": {
    "id": 2,
    "name": "Campanha Atualizada",
    "status": "in_progress",
    "startedAt": "2023-01-01T12:00:00.000Z"
  }
}
```

#### Cancelar Campanha

```
POST /campaigns/:id/cancel
```

**Resposta:**
```json
{
  "success": true,
  "message": "Campanha cancelada com sucesso",
  "data": {
    "id": 2,
    "name": "Campanha Atualizada",
    "status": "cancelled",
    "cancelledAt": "2023-01-01T12:30:00.000Z"
  }
}
```

#### Obter Estatísticas da Campanha

```
GET /campaigns/:id/stats
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": 2,
      "name": "Campanha Atualizada",
      "status": "completed"
    },
    "stats": {
      "totalContacts": 15,
      "sentCount": 15,
      "deliveredCount": 14,
      "readCount": 10,
      "failedCount": 1,
      "responseCount": 5,
      "deliveryRate": 93.33,
      "readRate": 71.43,
      "responseRate": 35.71,
      "failureRate": 6.67
    }
  }
}
```

## Estágios do Funil

### Endpoints de Estágios

#### Listar Estágios

```
GET /stages
```

**Parâmetros de Consulta:**
- `archived` (opcional): Incluir estágios arquivados (true/false, padrão: false)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Novo Lead",
      "color": "#3498db",
      "order": 1,
      "isDefault": true,
      "archived": false
    },
    {
      "id": 2,
      "name": "Qualificado",
      "color": "#2ecc71",
      "order": 2,
      "isDefault": false,
      "archived": false
    }
  ]
}
```

#### Obter Estágio

```
GET /stages/:id
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Novo Lead",
    "color": "#3498db",
    "order": 1,
    "isDefault": true,
    "archived": false,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Criar Estágio

```
POST /stages
```

**Corpo da Requisição:**
```json
{
  "name": "Novo Estágio",
  "color": "#9b59b6",
  "isDefault": false
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Estágio criado com sucesso",
  "data": {
    "id": 7,
    "name": "Novo Estágio",
    "color": "#9b59b6",
    "order": 7,
    "isDefault": false,
    "archived": false
  }
}
```

#### Atualizar Estágio

```
PUT /stages/:id
```

**Corpo da Requisição:**
```json
{
  "name": "Estágio Atualizado",
  "color": "#e74c3c"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Estágio atualizado com sucesso",
  "data": {
    "id": 7,
    "name": "Estágio Atualizado",
    "color": "#e74c3c",
    "order": 7,
    "isDefault": false,
    "archived": false
  }
}
```

#### Reordenar Estágios

```
PUT /stages/reorder
```

**Corpo da Requisição:**
```json
{
  "stageOrder": [1, 3, 2, 4, 5, 6, 7]
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Estágios reordenados com sucesso",
  "data": [
    {
      "id": 1,
      "name": "Novo Lead",
      "order": 1
    },
    {
      "id": 3,
      "name": "Proposta Enviada",
      "order": 2
    },
    {
      "id": 2,
      "name": "Qualificado",
      "order": 3
    }
  ]
}
```

#### Arquivar Estágio

```
PUT /stages/:id/archive
```

**Corpo da Requisição:**
```json
{
  "targetStageId": 1
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Estágio arquivado com sucesso",
  "data": {
    "archivedStage": {
      "id": 7,
      "name": "Estágio Atualizado",
      "archived": true
    },
    "activeStages": [
      {
        "id": 1,
        "name": "Novo Lead",
        "order": 1
      },
      {
        "id": 3,
        "name": "Proposta Enviada",
        "order": 2
      }
    ]
  }
}
```

#### Restaurar Estágio

```
PUT /stages/:id/restore
```

**Resposta:**
```json
{
  "success": true,
  "message": "Estágio restaurado com sucesso",
  "data": {
    "restoredStage": {
      "id": 7,
      "name": "Estágio Atualizado",
      "archived": false,
      "order": 7
    },
    "activeStages": [
      {
        "id": 1,
        "name": "Novo Lead",
        "order": 1
      },
      {
        "id": 7,
        "name": "Estágio Atualizado",
        "order": 7
      }
    ]
  }
}
```

## WhatsApp

### Endpoints de WhatsApp

#### Iniciar Sessão

```
POST /whatsapp/session/init
```

**Resposta:**
```json
{
  "success": true,
  "message": "Sessão do WhatsApp iniciada com sucesso",
  "data": {
    "sessionName": "company_1"
  }
}
```

#### Verificar Status da Sessão

```
GET /whatsapp/session/status
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "isActive": true,
    "connectionState": "CONNECTED"
  }
}
```

#### Enviar Mensagem de Texto

```
POST /whatsapp/send/text
```

**Corpo da Requisição:**
```json
{
  "to": "5511999999999",
  "message": "Olá, esta é uma mensagem de teste!"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Mensagem enviada com sucesso",
  "data": {
    "id": "message-id-123",
    "status": "sent"
  }
}
```

#### Enviar Mensagem com Mídia

```
POST /whatsapp/send/media
```

**Corpo da Requisição:**
Formulário multipart com:
- `to`: Número de telefone
- `caption`: Legenda (opcional)
- `mediaType`: Tipo de mídia (image, video, document)
- `media`: Arquivo de mídia

**Resposta:**
```json
{
  "success": true,
  "message": "Mídia enviada com sucesso",
  "data": {
    "id": "message-id-456",
    "status": "sent"
  }
}
```

#### Enviar Mensagem com Botões

```
POST /whatsapp/send/buttons
```

**Corpo da Requisição:**
```json
{
  "to": "5511999999999",
  "title": "Título da Mensagem",
  "body": "Corpo da mensagem com botões",
  "buttons": [
    {
      "id": "btn1",
      "text": "Sim"
    },
    {
      "id": "btn2",
      "text": "Não"
    }
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Mensagem com botões enviada com sucesso",
  "data": {
    "id": "message-id-789",
    "status": "sent"
  }
}
```

#### Fechar Sessão

```
POST /whatsapp/session/close
```

**Resposta:**
```json
{
  "success": true,
  "message": "Sessão do WhatsApp fechada com sucesso"
}
```

## Funil de Vendas

### Endpoints de Funil de Vendas

#### Obter Estatísticas do Funil

```
GET /sales-funnel/stats
```

**Parâmetros de Consulta:**
- `period` (opcional): Período para as estatísticas (week, month, quarter, year, padrão: month)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "stages": [
      {
        "id": 1,
        "name": "Novo Lead",
        "color": "#3498db",
        "count": 25
      },
      {
        "id": 2,
        "name": "Qualificado",
        "color": "#2ecc71",
        "count": 15
      }
    ],
    "totalContacts": 40,
    "conversionRates": [
      {
        "fromStage": "Novo Lead",
        "toStage": "Qualificado",
        "rate": 60.0
      }
    ],
    "averageTimeInStage": [
      {
        "stage": "Novo Lead",
        "days": 3
      },
      {
        "stage": "Qualificado",
        "days": 5
      }
    ]
  }
}
```

#### Obter Distribuição de Contatos

```
GET /sales-funnel/distribution
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "stage": "Novo Lead",
      "count": 25,
      "color": "#3498db"
    },
    {
      "stage": "Qualificado",
      "count": 15,
      "color": "#2ecc71"
    }
  ]
}
```

#### Obter Taxa de Conversão por Campanha

```
GET /sales-funnel/campaigns/conversion
```

**Parâmetros de Consulta:**
- `period` (opcional): Período para as estatísticas (week, month, quarter, year, padrão: month)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "campaignId": 1,
      "campaignName": "Campanha de Boas-vindas",
      "sentCount": 50,
      "responseCount": 20,
      "conversionRate": 40.0
    },
    {
      "campaignId": 2,
      "campaignName": "Campanha Atualizada",
      "sentCount": 15,
      "responseCount": 5,
      "conversionRate": 33.33
    }
  ]
}
```

#### Obter Previsão de Vendas

```
GET /sales-funnel/forecast
```

**Parâmetros de Consulta:**
- `period` (opcional): Período para a previsão (week, month, quarter, year, padrão: month)
- `conversionRate` (opcional): Taxa de conversão personalizada
- `averageDealValue` (opcional): Valor médio por negócio

**Resposta:**
```json
{
  "success": true,
  "data": {
    "period": 30,
    "expectedDeals": 8,
    "totalValue": 8000,
    "averageDealValue": 1000
  }
}
```

#### Obter Contatos Parados

```
GET /sales-funnel/stuck-contacts
```

**Parâmetros de Consulta:**
- `stageId` (opcional): Filtrar por estágio
- `days` (opcional): Número de dias para considerar um contato como parado (padrão: 30)

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "Contato Parado",
      "phone": "5511999999999",
      "email": "parado@exemplo.com",
      "stage": {
        "id": 2,
        "name": "Qualificado",
        "color": "#2ecc71"
      },
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

## CRM

### Endpoints de CRM

#### Criar Atividade

```
POST /crm/contacts/:contactId/activities
```

**Corpo da Requisição:**
```json
{
  "type": "call",
  "title": "Ligação de Apresentação",
  "description": "Apresentação inicial do produto",
  "scheduledDate": "2023-01-15T14:00:00.000Z",
  "duration": 30
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Atividade criada com sucesso",
  "data": {
    "id": 1,
    "type": "call",
    "title": "Ligação de Apresentação",
    "description": "Apresentação inicial do produto",
    "scheduledDate": "2023-01-15T14:00:00.000Z",
    "duration": 30,
    "completed": false,
    "contactId": 1,
    "userId": 1
  }
}
```

#### Atualizar Atividade

```
PUT /crm/activities/:activityId
```

**Corpo da Requisição:**
```json
{
  "title": "Ligação de Apresentação Atualizada",
  "scheduledDate": "2023-01-16T15:00:00.000Z"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Atividade atualizada com sucesso",
  "data": {
    "id": 1,
    "title": "Ligação de Apresentação Atualizada",
    "scheduledDate": "2023-01-16T15:00:00.000Z"
  }
}
```

#### Marcar Atividade como Concluída

```
PUT /crm/activities/:activityId/complete
```

**Resposta:**
```json
{
  "success": true,
  "message": "Atividade marcada como concluída",
  "data": {
    "id": 1,
    "completed": true,
    "completedAt": "2023-01-16T15:30:00.000Z"
  }
}
```

#### Criar Tarefa

```
POST /crm/contacts/:contactId/tasks
```

**Corpo da Requisição:**
```json
{
  "title": "Enviar Proposta",
  "description": "Preparar e enviar proposta comercial",
  "dueDate": "2023-01-20T00:00:00.000Z",
  "priority": "high"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Tarefa criada com sucesso",
  "data": {
    "id": 1,
    "title": "Enviar Proposta",
    "description": "Preparar e enviar proposta comercial",
    "dueDate": "2023-01-20T00:00:00.000Z",
    "priority": "high",
    "completed": false,
    "contactId": 1,
    "userId": 1
  }
}
```

#### Atualizar Tarefa

```
PUT /crm/tasks/:taskId
```

**Corpo da Requisição:**
```json
{
  "title": "Enviar Proposta Revisada",
  "priority": "medium"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Tarefa atualizada com sucesso",
  "data": {
    "id": 1,
    "title": "Enviar Proposta Revisada",
    "priority": "medium"
  }
}
```

#### Marcar Tarefa como Concluída

```
PUT /crm/tasks/:taskId/complete
```

**Resposta:**
```json
{
  "success": true,
  "message": "Tarefa marcada como concluída",
  "data": {
    "id": 1,
    "completed": true,
    "completedAt": "2023-01-19T10:00:00.000Z"
  }
}
```

#### Adicionar Nota

```
POST /crm/contacts/:contactId/notes
```

**Corpo da Requisição:**
```json
{
  "content": "Cliente demonstrou interesse no plano premium."
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Nota adicionada com sucesso",
  "data": {
    "id": 1,
    "content": "Cliente demonstrou interesse no plano premium.",
    "contactId": 1,
    "userId": 1
  }
}
```

#### Atualizar Nota

```
PUT /crm/notes/:noteId
```

**Corpo da Requisição:**
```json
{
  "content": "Cliente demonstrou interesse no plano premium. Solicitar retorno em uma semana."
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Nota atualizada com sucesso",
  "data": {
    "id": 1,
    "content": "Cliente demonstrou interesse no plano premium. Solicitar retorno em uma semana."
  }
}
```

#### Obter Histórico do Contato

```
GET /crm/contacts/:contactId/history
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "note",
      "content": "Cliente demonstrou interesse no plano premium. Solicitar retorno em uma semana.",
      "createdAt": "2023-01-15T10:00:00.000Z",
      "user": {
        "id": 1,
        "name": "Nome do Administrador",
        "email": "admin@empresa.com"
      }
    },
    {
      "id": 1,
      "type": "activity",
      "title": "Ligação de Apresentação Atualizada",
      "completed": true,
      "completedAt": "2023-01-16T15:30:00.000Z",
      "createdAt": "2023-01-14T09:00:00.000Z",
      "user": {
        "id": 1,
        "name": "Nome do Administrador",
        "email": "admin@empresa.com"
      }
    }
  ]
}
```

#### Obter Tarefas Pendentes

```
GET /crm/pending/tasks
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "title": "Agendar Reunião",
      "description": "Agendar reunião de apresentação",
      "dueDate": "2023-01-25T00:00:00.000Z",
      "priority": "medium",
      "completed": false,
      "contact": {
        "id": 3,
        "name": "Contato Importante",
        "phone": "5511999999999",
        "email": "importante@exemplo.com"
      }
    }
  ]
}
```

#### Obter Atividades Pendentes

```
GET /crm/pending/activities
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "type": "meeting",
      "title": "Reunião de Apresentação",
      "description": "Apresentação detalhada do produto",
      "scheduledDate": "2023-01-22T10:00:00.000Z",
      "duration": 60,
      "completed": false,
      "contact": {
        "id": 3,
        "name": "Contato Importante",
        "phone": "5511999999999",
        "email": "importante@exemplo.com"
      }
    }
  ]
}
```

