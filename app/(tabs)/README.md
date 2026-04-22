# 🏁 Driver Planner - Gestão de Logística e Alertas Nativos

O **Driver Planner** é um aplicativo robusto desenvolvido para motoristas que necessitam de um gerenciamento rigoroso de agenda. Diferente de uma agenda comum, ele automatiza o ciclo de vida das corridas, removendo registros passados e gerenciando notificações push nativas para garantir que o profissional nunca perca um horário.

---

## 🚀 Funcionalidades Técnicas

* **📅 Agendamento Inteligente**: Sistema que diferencia Corridas Únicas de Recorrentes (semanais) com persistência local.
* **🔔 Notificações em Tempo Real**: Integração com `expo-notifications` para disparar alertas com prioridade máxima no sistema operacional.
* **🧹 Auto-Cleaning**: Algoritmo de limpeza automática que filtra e remove corridas únicas que já foram concluídas, mantendo o banco de dados local otimizado.
* **💾 Persistência Offline**: Uso de `AsyncStorage` para garantir que todos os dados estejam disponíveis mesmo sem conexão com a internet.
* **🔄 Sincronização de Foco**: Uso do hook `useFocusEffect` para garantir que a lista de compromissos esteja sempre atualizada ao navegar entre telas (evitando dados obsoletos na UI).

---

## 🛠️ Stack Tecnológica

* **Framework**: React Native com Expo (Router).
* **Linguagem**: TypeScript (Tipagem rigorosa para interfaces de dados).
* **Armazenamento**: AsyncStorage (Persistência NoSQL local).
* **Native Features**: Expo Notifications (Gerenciamento de agendamentos semanais e triggers locais).
* **UI/UX**: Design responsivo com componentes nativos e ícones da biblioteca Lucide.

---

## 🧠 Desafios de Engenharia Solucionados

1.  **Lógica de Notificações Semanais**: Implementação de gatilhos baseados em dias da semana (`SchedulableTriggerInputTypes.WEEKLY`), exigindo tratamento de índices de arrays para sincronização com o calendário do sistema.
2.  **Gerenciamento de I/O Assíncrono**: Desenvolvimento de um fluxo de carga e limpeza de dados que garante a integridade do estado da aplicação antes da renderização.
3.  **Configuração de Handlers de Notificação**: Ajuste fino dos comportamentos de notificação em primeiro plano (foreground), garantindo que banners e sons sejam disparados com alta prioridade.

---

## 📂 Como Executar o Projeto

1.  **Clone este repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/driver-planner.git](https://github.com/seu-usuario/driver-planner.git)
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Inicie o ambiente de desenvolvimento:**
    ```bash
    npx expo start
    ```
4.  Escaneie o QR Code com o aplicativo **Expo Go** em um dispositivo Android ou iOS.

---