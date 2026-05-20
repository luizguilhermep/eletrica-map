# ⚡ Eletrica Map

Sistema de gerenciamento de planta elétrica com mapa interativo. Permite cadastrar equipamentos elétricos em uma planta visual, conectá-los entre si, editar propriedades e persistir tudo em banco de dados.

---

## 📐 Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER                            │
│                                                         │
│  React + Vite                                           │
│  ┌──────────────┐   ┌──────────────┐  ┌─────────────┐  │
│  │   Canvas     │   │   Sidebar    │  │  Properties │  │
│  │ (React Flow) │   │  (Palette)   │  │    Panel    │  │
│  └──────────────┘   └──────────────┘  └─────────────┘  │
│           │                                             │
│     Zustand Store (estado global)                       │
│           │                                             │
│     src/lib/db.js  ──── fetch + Bearer Token ───────┐  │
└─────────────────────────────────────────────────────┼──┘
                                                      │
           ┌──────────────────────────────────────────┘
           │  HTTP  (Authorization: Bearer <JWT>)
           ▼
┌───────────────────────────────┐
│   Spring Boot API  :8080      │
│                               │
│  FirebaseTokenFilter          │  ← valida token via Firebase Admin SDK
│  SecurityConfig               │
│                               │
│  Controllers:                 │
│   /api/plant                  │
│   /api/nodes                  │
│   /api/edges                  │
│   /api/alimentadores          │
│                               │
│  Services / Repositories      │
└──────────────┬────────────────┘
               │  JPA / Hibernate
               ▼
┌──────────────────────────────┐
│   PostgreSQL (Neon Cloud)    │
│                              │
│  plants  │  nodes  │  edges  │
└──────────────────────────────┘

       Autenticação separada:
┌──────────────────────────────┐
│   Firebase Authentication    │
│   (email/senha)              │
│   → gera JWT (ID Token)      │
└──────────────────────────────┘
```

### Fluxo de autenticação

1. Usuário faz login no frontend com email/senha via **Firebase Auth**
2. Firebase retorna um **ID Token** (JWT assinado pelo Google)
3. A cada chamada à API, o frontend inclui o token: `Authorization: Bearer <token>`
4. O **Spring Boot** valida o token usando o **Firebase Admin SDK** e extrai o UID
5. O backend usa o UID para isolar os dados de cada usuário

---

## 🖥️ Frontend

**Repositório:** `eletrica-map`  
**URL local:** `http://localhost:5173`

### Tecnologias

| Tecnologia | Versão | Função |
|---|---|---|
| [React](https://react.dev) | 19 | Interface de usuário |
| [Vite](https://vitejs.dev) | 8 | Build tool e dev server |
| [Tailwind CSS](https://tailwindcss.com) | v4 | Estilização (via plugin Vite) |
| [@xyflow/react](https://reactflow.dev) | 12 | Canvas interativo (nós, arestas, drag, zoom, pan) |
| [Zustand](https://zustand-demo.pmnd.rs) | 5 | Gerenciamento de estado global |
| [Firebase SDK](https://firebase.google.com/docs/web) | 11 | Autenticação (email/senha) |
| [Lucide React](https://lucide.dev) | latest | Ícones |

### Estrutura de pastas

```
src/
├── components/
│   ├── Auth/              # Tela de login e cadastro
│   ├── Canvas/            # ReactFlow com drag-and-drop
│   ├── Sidebar/           # Paleta de equipamentos + upload de planta
│   ├── PropertiesPanel/   # Painel de edição do nó selecionado
│   ├── AlimentadorCRUD/   # Modal CRUD de alimentadores
│   └── nodes/
│       ├── EquipmentNode.jsx       # Nó customizado com handles
│       └── BackgroundImageNode.jsx # Imagem de fundo da planta
├── data/
│   └── equipmentTypes.js  # Catálogo dos 8 tipos de equipamento
├── lib/
│   ├── firebase.js        # Inicialização do Firebase
│   └── db.js              # Camada de acesso à API REST
└── store/
    └── useStore.js        # Store Zustand (auth + nós + arestas)
```

### Tipos de equipamento

| Tipo | Label |
|---|---|
| `transformer` | Transformador |
| `breaker` | Disjuntor |
| `meter` | Medidor |
| `generator` | Gerador |
| `panel` | Painel |
| `motor` | Motor |
| `load` | Carga |
| `alimentador` | Alimentador |

---

## ⚙️ Backend

**Repositório:** `eletrica-map-api`  
**URL local:** `http://localhost:8080`

### Tecnologias

| Tecnologia | Versão | Função |
|---|---|---|
| [Spring Boot](https://spring.io/projects/spring-boot) | 4.0.6 | Framework principal |
| [Spring Data JPA](https://spring.io/projects/spring-data-jpa) | — | ORM e repositórios |
| [Spring Security](https://spring.io/projects/spring-security) | — | Filtro de autenticação |
| [Hibernate](https://hibernate.org) | 7.2.12 | Implementação JPA, suporte JSONB |
| [PostgreSQL Driver](https://jdbc.postgresql.org) | — | Conexão com banco de dados |
| [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) | 9.4.2 | Validação de tokens JWT |
| [Lombok](https://projectlombok.org) | — | Redução de boilerplate (getters, builders) |
| [HikariCP](https://github.com/brettwooldridge/HikariCP) | — | Pool de conexões |

### Estrutura de pacotes

```
com.eletricalmap.api/
├── config/
│   ├── FirebaseConfig.java      # Inicializa FirebaseApp com service account
│   └── SecurityConfig.java      # CSRF off, stateless, CORS, filtro Firebase
├── security/
│   └── FirebaseTokenFilter.java # Extrai Bearer token e autentica no Security Context
├── model/
│   ├── Plant.java               # Entidade: planta do usuário
│   ├── EquipmentNode.java       # Entidade: nó de equipamento (data em JSONB)
│   └── EdgeConnection.java      # Entidade: aresta (style em JSONB)
├── repository/
│   ├── PlantRepository.java
│   ├── NodeRepository.java      # Queries nativas para filtrar JSONB
│   └── EdgeRepository.java
├── service/
│   ├── PlantService.java        # getOrCreate + updateBackground
│   └── AlimentadorService.java  # Regra: nome único por planta
├── controller/
│   ├── PlantController.java     # GET /api/plant, PATCH /api/plant/background
│   ├── NodeController.java      # CRUD /api/nodes
│   ├── EdgeController.java      # CRUD /api/edges
│   └── AlimentadorController.java # CRUD /api/alimentadores (com validação)
└── dto/
    └── AlimentadorDTO.java
```

### Endpoints da API

Todos os endpoints exigem `Authorization: Bearer <Firebase ID Token>`.

#### Planta
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/plant` | Retorna (ou cria) a planta do usuário |
| `PATCH` | `/api/plant/background` | Atualiza a imagem de fundo |

#### Nós
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/nodes` | Lista todos os nós da planta |
| `POST` | `/api/nodes` | Cria um novo nó |
| `PUT` | `/api/nodes/{id}` | Atualiza um nó completo |
| `PATCH` | `/api/nodes/{id}/position` | Atualiza só a posição (drag) |
| `DELETE` | `/api/nodes/{id}` | Remove nó e suas arestas |

#### Arestas
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/edges` | Lista todas as arestas da planta |
| `POST` | `/api/edges` | Cria uma nova aresta |
| `DELETE` | `/api/edges/{id}` | Remove uma aresta |

#### Alimentadores (com regras de negócio)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/alimentadores` | Lista alimentadores da planta |
| `POST` | `/api/alimentadores` | Cria alimentador (valida nome único) |
| `PUT` | `/api/alimentadores/{id}` | Edita alimentador (valida nome único) |
| `DELETE` | `/api/alimentadores/{id}` | Remove alimentador |

### Modelo de banco de dados

```
plants
  id              UUID   PK
  user_id         TEXT   UNIQUE   ← Firebase UID
  name            TEXT
  background_data TEXT            ← base64 da imagem de fundo
  created_at      TIMESTAMP
  updated_at      TIMESTAMP

nodes
  id              TEXT   PK       ← gerado pelo frontend: "node_<timestamp>"
  plant_id        UUID   FK → plants
  node_type       TEXT            ← tipo do equipamento
  position_x      FLOAT
  position_y      FLOAT
  data            JSONB           ← label, status, brand, model, notes, etc.
  z_index         INT
  draggable       BOOLEAN
  selectable      BOOLEAN
  deletable       BOOLEAN

edges
  id              TEXT   PK
  plant_id        UUID   FK → plants
  source          TEXT            ← id do nó de origem
  target          TEXT            ← id do nó de destino
  source_handle   TEXT
  target_handle   TEXT
  animated        BOOLEAN
  style           JSONB           ← cor, espessura da linha
```

---

## 🚀 Como executar

### Pré-requisitos

- Java 17+
- Node.js 18+
- Maven Wrapper (incluso no projeto backend)

### 1. Backend

```bash
cd eletrica-map-api

# Colocar o arquivo firebase-service-account.json em:
# src/main/resources/firebase-service-account.json

# Criar src/main/resources/application-local.properties com:
# spring.datasource.url=jdbc:postgresql://<host>/<db>?sslmode=require
# spring.datasource.username=<user>
# spring.datasource.password=<password>

.\mvnw.cmd spring-boot:run
# API disponivel em http://localhost:8080
```

### 2. Frontend

```bash
cd eletrica-map

# Criar .env.local com as credenciais do Firebase:
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
# VITE_FIREBASE_PROJECT_ID=...
# VITE_FIREBASE_STORAGE_BUCKET=...
# VITE_FIREBASE_MESSAGING_SENDER_ID=...
# VITE_FIREBASE_APP_ID=...

npm install
npm run dev
# App disponivel em http://localhost:5173
```

---

## 🔒 Segurança

- Senhas nunca chegam ao backend — autenticação é 100% Firebase
- Cada usuário só acessa seus próprios dados (isolamento por `user_id`)
- Tokens JWT são verificados em toda requisição pelo Firebase Admin SDK
- Sessão stateless — nenhum estado de sessão no servidor
- Credenciais sensíveis ficam em arquivos gitignored:
  - `.env.local` (frontend)
  - `application-local.properties` (backend)
  - `firebase-service-account.json` (backend)
