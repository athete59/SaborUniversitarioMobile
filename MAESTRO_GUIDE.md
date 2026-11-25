# 📱 Guia de Testes E2E Mobile com Maestro

O **Maestro** é o framework moderno padrão da indústria para automação e testes de interface de ponta a ponta (**End-to-End - E2E**) em aplicativos móveis (**Android & iOS**).

Diferente de testes em código que utilizam mocks em memória, o Maestro conecta-se diretamente a um **emulador Android, simulador iOS ou dispositivo físico via USB**, realizando toques na tela, digitação em inputs, verificação de mensagens visuais e fluxos completos de navegação exatamente como um usuário real.

---

## 📂 Estrutura dos Fluxos de Teste Criados (`.maestro/`)

Todos os fluxos foram organizados em arquivos declarativos YAML na pasta `.maestro/`:

| Arquivo | Persona / Escopo | O que é testado na prática |
| :--- | :--- | :--- |
| **`01_login_validacoes.yaml`** | Validação & Borda | • Carregamento inicial da tela com inputs e botões.<br>• Submissão vazia exibindo alerta `*Preencha todos os campos.`<br>• Submissão com credenciais incorretas exibindo `*Email ou senha incorretos.`<br>• Navegação para `Esqueceu a senha?` e retorno. |
| **`02_jornada_cliente.yaml`** | Cliente | • Autenticação com credenciais de cliente.<br>• Validação da lista de restaurantes conveniados.<br>• Abertura do menu lateral e navegação até `Meus Pedidos`.<br>• Visualização de `Minha Conta`.<br>• Logout seguro com retorno à tela de login. |
| **`03_jornada_funcionario.yaml`** | Funcionário / Balcão | • Autenticação com credenciais de funcionário.<br>• Entrada no painel de atendimento.<br>• Alternância para a aba de **Digitação Manual de Código**.<br>• Digitação do ID do pedido (`PEDIDO_42`) e clique em **Localizar Pedido**.<br>• Logout seguro pelo cabeçalho. |
| **`04_jornada_empresa.yaml`** | Empresa Parceira | • Autenticação corporativa com credenciais da empresa.<br>• Validação dos indicadores do Dashboard (`Visão Geral`, `Ações Rápidas`).<br>• Verificação dos botões de `Cadastrar Novo Produto` e `Formas de Pagamento`.<br>• Navegação pelo menu corporativo e logout seguro. |
| **`suite_completa.yaml`** | Suíte Orquestradora | Executa os 4 fluxos críticos em sequência com um único comando. |

---

## 🚀 Como Executar os Testes Localmente

### 1. Instalação do Maestro CLI

* **Windows (via PowerShell / WSL ou curl):**
  ```powershell
  # No Linux / macOS / WSL (Recomendado para Maestro):
  curl -FsSL "https://get.maestro.mobile.dev" | bash
  ```

* **Verifique a instalação:**
  ```bash
  maestro --version
  ```

### 2. Inicie o Emulador Android ou conecte o Celular via USB

1. Abra o **Android Studio** e inicie qualquer emulador Android com Google Play Services (ex: Pixel 7).
2. Verifique se o dispositivo está conectado:
   ```bash
   adb devices
   ```

### 3. Inicie a Aplicação

* **Opção A: No Expo Go:**
  ```bash
  npm start
  ```
  *(Abra o app no emulador via Expo Go)*

* **Opção B: Em Development Build (Recomendado para E2E Puro):**
  ```bash
  npx expo run:android
  ```

### 4. Execute a Suíte de Testes

* **Executar a Suíte Completa:**
  ```bash
  npm run test:maestro
  ```
  *(Se estiver rodando dentro do Expo Go, passe o identificador:)*
  ```bash
  maestro test -e APP_ID=host.exp.exponent .maestro/suite_completa.yaml
  ```

* **Executar Fluxos Isolados:**
  ```bash
  npm run test:maestro:login
  npm run test:maestro:cliente
  npm run test:maestro:funcionario
  npm run test:maestro:empresa
  ```

---

## 🎯 Explicação Técnica para o Professor

1. **Por que o Maestro foi escolhido para o Mobile?**
   O Maestro é o estado da arte para testes de aceitação e E2E no ecossistema mobile. Ele elimina problemas crônicos de testes flaky (instáveis) comuns em ferramentas antigas como Appium, suportando tolerância automática a delays de animação do React Native e Expo.

2. **Como os elementos são localizados na tela?**
   Para garantir robustez internacional e evitar quebras com mudanças cosméticas de texto, implementamos atributos `testID` nativos do React Native (ex: `testID="input-email"`, `testID="btn-entrar"`, `testID="tab-digitar-codigo"`), combinados com validações de textos e acessibilidade.

3. **Integração com CI/CD (GitHub Actions):**
   O fluxo `.github/workflows/ci.yml` valida tanto a suíte de integração no Vitest quanto a integridade e sintaxe de todos os cenários mobile do Maestro a cada `git push` ou `pull request`.
