# 🍽️ Sabor Universitário - Mobile

O **Sabor Universitário Mobile** é o aplicativo para gestão de refeições universitárias e estabelecimentos parceiros, desenvolvido em **React Native** com **Expo SDK 57**, **Expo Router**, **Zustand** e **Supabase**.

A versão mobile oferece uma experiência ágil, responsiva e enxuta, integrando clientes, estabelecimentos parceiros (empresas) e funcionários em uma experiência fluida de compra, acompanhamento e entrega de pedidos via QR Code.

---

## 📱 Perfis de Usuário & Funcionalidades

O sistema detecta automaticamente o perfil do usuário durante o login e o redireciona para a rota apropriada:

### 🎓 1. Cliente (Estudantes e Professores)
- **Início (`PaginaInicial`):** Lista os restaurantes e lanchonetes conveniados com identidade visual dinâmica.
- **Cardápio (`Cardapio`):** Visualização categorizada (Bebidas, Salgados, etc.) com seletor de quantidade e adição ao carrinho.
- **Detalhes do Produto (`DetalheProduto`):** Página com descrição detalhada, fotos, observações e compra direta.
- **Carrinho & Checkout (`ResumoPedido`):** Cálculo reativo via Zustand, escolha de método de pagamento (Dinheiro, PIX, Cartão) e envio do pedido diretamente para o Supabase.
- **Meus Pedidos (`MeusPedidos`):** Acompanhamento em tempo real do status do pedido com **geração visual de QR Code** para retirada no balcão.
- **Meu Perfil (`MeuPerfil`):** Informações cadastrais do cliente, atalhos rápidos e encerramento de sessão.

### 💼 2. Empresa (Restaurantes e Lanchonetes Parceiras)
*Versão mobile otimizada e enxuta, focada nas operações essenciais do estabelecimento:*
- **Dashboard (`Dashboard`):** Indicadores em tempo real de produtos cadastrados, total de pedidos, pedidos pendentes e concluídos, além de atalhos rápidos e suporte a *pull-to-refresh*.
- **Gestão de Produtos (`CadastrarProduto`):** Formulário completo com upload de imagens diretamente para o Supabase Storage.
- **Formas de Pagamento (`FormasPagamento`):** Configuração dos métodos de pagamento aceitos no caixa (Dinheiro, Cartão, PIX) com persistência local.
- **Formas de Recebimento (`FormasRecebimento`):** Configuração de recebimentos da empresa com abas especializadas para **Chaves PIX** (CPF, CNPJ, E-mail, Telefone, Chave Aleatória) e **Transferência Bancária / TED** com lista completa de instituições bancárias reguladas pelo Banco Central.

### 🧑‍🍳 3. Funcionário (Atendimento e Balcão)
- **Scanner de Pedidos (`ScannerPedido`):**
  - Leitor de QR Code via câmera nativa (`expo-camera`) com mira centralizada.
  - Fallback de busca manual pelo número do pedido (ideal para testes ou dispositivos sem câmera).
  - Consulta instantânea no Supabase listando produtos e quantidades do pedido.
  - **Detecção de QR Code Já Utilizado:** Alerta visual em destaque impedindo a entrega duplicada caso o pedido já tenha sido baixado (`status: 'Entregue'`).
  - **Dar Baixa no Pedido:** Atualização do status do pedido para `'Entregue'` no banco com confirmação de segurança.

---

## 🛠️ Tecnologias & Arquitetura

- **Framework:** [Expo](https://expo.dev) (SDK 57) + [React Native](https://reactnative.dev)
- **Roteamento:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Linguagem:** TypeScript com tipagem estrita e documentação JSDoc
- **Gerenciamento de Estado:** [Zustand](https://github.com/pmndrs/zustand) com persistência reativa via `@react-native-async-storage/async-storage`
- **Banco de Dados & Storage:** [Supabase](https://supabase.com) (PostgreSQL + Bucket Storage)
- **Câmera & Leitor Barcode:** `expo-camera` (CameraView para leitura de QR Code)
- **Testes Unitários & Integração:** Vitest
- **Testes E2E de Usuário Real Mobile:** Maestro

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js instalado (v18+)
- Gerenciador de pacotes `npm` ou `yarn`
- Dispositivo com o aplicativo **Expo Go** (iOS / Android) ou emulador configurado

### Passo a passo

1. **Clone o repositório e acesse a pasta do app:**
   ```bash
   cd SaborUniversitarioMobile
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento Expo:**
   ```bash
   npx expo start
   ```

4. **Abra o aplicativo:**
   - Pressione `a` para abrir no emulador Android
   - Pressione `i` para abrir no simulador iOS
   - Pressione `w` para abrir a versão Web no navegador
   - Ou escaneie o QR Code no terminal usando o aplicativo **Expo Go** no celular.

---

## 🧪 Testes Automatizados

O projeto possui uma arquitetura completa de testes automatizados, combinando testes lógicos/unitários com **Vitest** e testes de interface de usuário real no mobile com **Maestro**:

### 1. Testes de Unidade e Integração (Vitest)
| Comando | Descrição | Escopo |
| :--- | :--- | :--- |
| `npm test` | **Testes Unitários** | Regras de negócio, cálculos monetários do carrinho e autenticação (`__tests__/`) |
| `npm run test:integration` | **Testes de Integração** | Validação de schemas Zod e factories com Faker (`tests/integration/`, `tests/factories/`) |
| `npm run test:all` | **Bateria Completa Vitest** | Executa todos os testes unitários e de integração da aplicação |

### 2. Testes de Interface Real Mobile (Maestro)
Automação E2E que entra no aplicativo e interage com toques e inputs reais no emulador/celular:

| Comando | Descrição | Fluxo Testado |
| :--- | :--- | :--- |
| `npm run test:maestro` | **Suíte Completa Mobile** | Executa todos os cenários mobile sequencialmente |
| `npm run test:maestro:login` | **Login & Validações** | Valida campos vazios, credenciais erradas e recuperação |
| `npm run test:maestro:cliente` | **Jornada do Cliente** | Login, restaurantes, navegação lateral e logout |
| `npm run test:maestro:funcionario` | **Jornada do Funcionário** | Login, scanner, alternância para busca manual e logout |
| `npm run test:maestro:empresa` | **Jornada da Empresa** | Login, visualização de métricas no Dashboard e menu |

> 📖 Para instruções detalhadas de como executar em emuladores Android ou iOS, consulte o [MAESTRO_GUIDE.md](file:///c:/Users/Luiza/Projetos/Sabor%20Universitario/SaborUniversitarioMobile/MAESTRO_GUIDE.md).

---

## 🛠️ Outros Scripts

- `npm start`: Inicia o servidor Metro do Expo.
- `npm run lint`: Executa a verificação estática de código com o ESLint (`expo lint`).
