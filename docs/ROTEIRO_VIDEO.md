# Roteiro da apresentação em vídeo (até 15 minutos)

Sugestão de divisão para gravar a demonstração do app e explicar os detalhes técnicos. Os tempos somam cerca de 14 minutos, deixando folga.

**Antes de gravar**
- API rodando (`cd backend && npm run seed && npm start`) para começar com os dados de exemplo.
- App aberto no celular (espelhado na tela com scrcpy/QuickTime) ou no navegador (`w` no Expo) com a janela estreita, no formato de celular.
- VS Code aberto no projeto para a parte técnica.

---

## 1. Abertura (0:00 – 1:00)

- Apresentação do grupo e do desafio: interface mobile para o blog da escola em React Native.
- Visão rápida do repositório: `mobile/` (app), `backend/` (API), `docs/`.

## 2. Demonstração como visitante (1:00 – 2:30)

- Lista de posts: título, autor, data, resumo e contador de comentários.
- Busca: digitar "cerrado" e depois "fracoes" (sem acento, mostrando que a busca ignora acentos).
- Abrir um post: conteúdo completo e comentários.
- Mostrar que o visitante não consegue comentar ("Entrar para comentar").

## 3. Login e permissões do aluno (2:30 – 4:00)

- Tentar uma senha errada (mensagem de erro).
- Entrar como aluno (`aluno@escola.com`): só as abas Posts e Perfil, sem botões de criar/editar.
- Comentar em um post.
- Perfil: "O que você pode fazer" e Sair.

## 4. Fluxos do professor (4:00 – 8:30)

- Entrar como professor (`professor@escola.com`): novas abas Admin, Professores e Alunos.
- **Criar post** (botão Novo): mostrar a validação com campos vazios e publicar.
- **Editar post** pela leitura: dados atuais carregados, salvar.
- **Admin**: lista com Editar/Excluir; excluir um post com confirmação.
- **Professores**: listagem paginada (Próxima/Anterior), busca, cadastrar um professor (mostrar o erro de e-mail duplicado), editar e excluir. Mostrar que o botão Excluir do próprio usuário está desabilitado ("VOCÊ").
- **Alunos**: mesma estrutura, com matrícula no lugar da disciplina.
- Moderar: excluir o comentário de um aluno.

## 5. Detalhes técnicos (8:30 – 13:30)

1. **Arquitetura** (diagrama do README): screens → hooks → services → api.ts; AuthContext com Context API.
2. **Navegação e proteção de rotas** (`src/navigation/AppNavigator.tsx`): telas registradas condicionalmente por papel; o modal de login fecha sozinho ao autenticar.
3. **Autenticação** (`src/contexts/AuthContext.tsx` + `src/services/api.ts`): JWT no header, SecureStore, restauração com `/auth/me` e logout automático em 401.
4. **Hooks de listagem** (`usePostsFeed`, `usePeoplePage`): debounce, descarte de respostas antigas, rolagem infinita × paginação numerada.
5. **Reaproveitamento** (`screens/people`): componentes genéricos + `peopleConfig.ts` atendendo os requisitos 5 a 8.
6. **Estilização** (`src/theme`): design tokens e componentes reutilizáveis.
7. **API** (`backend/src/routes.js`): rotas com `authenticate` e `requireRole('teacher')`; respostas 401/403.
8. **Testes**: rodar `npm test` no backend (24 testes) e mostrar o CI verde no GitHub Actions.

## 6. Desafios e encerramento (13:30 – 14:30)

- Dois ou três desafios do relato (conexão celular × API local, rotas protegidas, versões do Expo).
- Melhorias futuras e agradecimento.
