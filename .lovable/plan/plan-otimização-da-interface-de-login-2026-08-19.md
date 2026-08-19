# Plan: Otimização da Interface de Login

O objetivo deste plano é simplificar a interface de login do administrador, removendo o painel de diagnóstico e garantindo que a tela seja totalmente responsiva.

## User Review Required

> [!IMPORTANT]
> A remoção do painel de diagnóstico significa que não teremos mais informações visíveis sobre o estado da sessão (LocalStorage, Cookies, Erros brutos) diretamente na tela durante o login. O feedback de erros continuará sendo exibido via notificações (Toasts).

## Proposed Changes

### Login do Administrador

#### [src/routes/admin.login.tsx]
- Remover o estado `debugInfo` e a função `updateDebugInfo`.
- Remover o componente visual do "Painel de Diagnóstico (Admin)" (linhas 201 a 246).
- Ajustar o layout do contêiner principal para centralizar apenas o cartão de login, removendo o empilhamento vertical com o diagnóstico.
- Garantir que o cartão de login seja responsivo em telas pequenas (ajuste de padding e largura máxima).

## Technical Details

- **Simplificação de Estado:** Remoção de hooks `useState` e `useEffect` que serviam apenas para o diagnóstico técnico.
- **Limpeza de UI:** O layout passará a ter um único ponto focal: o formulário de login.
- **CSS:** Utilização de classes utilitárias do Tailwind (`flex`, `items-center`, `justify-center`) para garantir centralização perfeita e adaptabilidade mobile.

## Verification Plan

### Manual Verification
- Acessar `/admin/login` em desktop e dispositivos móveis (via DevTools).
- Verificar se o painel escuro de diagnóstico desapareceu.
- Testar o login com credenciais válidas e inválidas para garantir que os Toasts de sucesso/erro continuam funcionando.
- Validar se o layout se mantém centralizado e legível em diferentes resoluções.
