<<<<<<< HEAD

# 🍽️ Sabor Universitário - Versão Mobile

O **Sabor Universitário** é um sistema de gestão e benefícios alimentares projetado para integrar instituições de ensino, empresas parceiras, funcionários e clientes (estudantes/professores) em uma única plataforma prática e eficiente.
=======
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
- **Qualidade de Código:** ESLint configurado via `expo lint` e Jest para testes unitários

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
>>>>>>> 56ac468071bde1eefe789da40ff06d02f375a91e

---

## 🧪 Scripts Disponíveis

<<<<<<< HEAD
Na versão mobile, o sistema é dividido em 2 níveis de acesso independentes, cada um com suas respectivas funcionalidades:

### 💼 1. Empresa (Restaurantes/Parceiros)
*   **Função:** Responsável por controla as vendas e fluxo de caixa .

### 🎓 2. Cliente (Alunos/Professores/Comunidade)
*   **Função:** O usuário final da aplicação. Pode visualizar cardápios, comprar refeições, gerenciar seus saldos de benefícios e gerar cupons/QR Codes para retirada de alimentos.

---

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** Reactive Native + Expo
*   **Banco de Dados & Autenticação:** [Supabase](https://supabase.com/) (PostgreSQL + Auth nativo)
*   **Controle de Versão:** Git & GitHub



=======
- `npm start`: Inicia o servidor Metro do Expo.
- `npm run lint`: Executa a verificação estática de código com o ESLint.
- `npm test`: Executa a suite de testes unitários com Jest.
>>>>>>> 56ac468071bde1eefe789da40ff06d02f375a91e
