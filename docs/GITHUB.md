# Como publicar o projeto no GitHub (passo a passo)

Este guia leva o projeto do seu computador para um repositório no GitHub, pronto para entregar o link do Tech Challenge.

---

## Antes de começar

- Tenha uma conta no [GitHub](https://github.com).
- Instale o **Git**: [git-scm.com/downloads](https://git-scm.com/downloads). Confira com `git --version`.
- Descompacte o `.zip` do projeto em uma pasta, por exemplo `Documentos/tech-challenge-fase-4`.

> Não envie a pasta `node_modules`. O arquivo `.gitignore` do projeto já impede isso quando você usa o Git.

---

## Opção 1: pelo terminal (recomendado)

### Passo 1: criar o repositório vazio no GitHub

1. Acesse [github.com/new](https://github.com/new).
2. **Repository name**: `tech-challenge-fase-4`
3. **Description**: `Blog Escolar mobile em React Native + API Node.js (FIAP Pós Tech - Fase 4)`
4. Marque **Public**, para que a banca consiga acessar.
5. **Não** marque "Add a README", ".gitignore" nem "license", porque o projeto já tem esses arquivos.
6. Clique em **Create repository** e deixe a página aberta.

### Passo 2: configurar seu nome no Git (só na primeira vez)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email-do-github@exemplo.com"
```

### Passo 3: enviar o projeto

Abra o terminal **dentro da pasta do projeto** (onde fica o `README.md`). No Windows, clique com o botão direito na pasta → "Abrir no Terminal" ou "Git Bash Here". Depois rode:

```bash
git init
git add .
git commit -m "Tech Challenge Fase 4: app mobile React Native + API"
git branch -M main
git remote add origin https://github.com/anacarolinyb/tech-challenge-fase-4.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuário do GitHub.

### Passo 4: autenticar

O GitHub não aceita a senha da conta no terminal. Use uma destas formas:

- **Windows/macOS**: no primeiro `git push`, deve abrir uma janela do navegador pedindo para autorizar. Basta confirmar.
- **GitHub CLI**: instale o [GitHub CLI](https://cli.github.com), rode `gh auth login`, escolha *GitHub.com → HTTPS → Login with a web browser* e repita o `git push`.
- **Token**: em GitHub → *Settings → Developer settings → Personal access tokens*, gere um token com permissão de repositório e cole-o quando o terminal pedir a senha.

### Passo 5: conferir

Atualize a página do repositório. Você deve ver:

- As pastas `backend/`, `mobile/`, `docs/` e `.github/`.
- O `README.md` renderizado, com tabelas e diagramas.
- Na aba **Actions**, o workflow **CI** rodando os testes da API. Ele deve ficar verde ✅ em cerca de 1 minuto.

---

## Opção 2: GitHub Desktop (sem terminal)

1. Instale o [GitHub Desktop](https://desktop.github.com) e entre com sua conta.
2. **File → Add local repository** → selecione a pasta do projeto. Ele vai perguntar se quer criar um repositório: clique em **create a repository**.
3. Escreva a mensagem do commit (ex.: `Tech Challenge Fase 4`) e clique em **Commit to main**.
4. Clique em **Publish repository**, **desmarque** "Keep this code private" e confirme.

---

## Opção 3: upload pelo navegador

Use só se não conseguir instalar o Git.

1. Crie o repositório como no Passo 1, mas marque **Add a README file**, para liberar o upload.
2. Na página do repositório, clique em **Add file → Upload files**.
3. Arraste **o conteúdo** da pasta do projeto (as pastas `backend`, `mobile`, `docs`, `.github` e os arquivos da raiz). No Chrome/Edge, arrastar pastas mantém a estrutura.
4. Clique em **Commit changes**. O README do projeto substitui o criado pelo GitHub.

> Pastas que começam com ponto (`.github`) podem ficar ocultas no explorador de arquivos. Ative "Mostrar itens ocultos" no Windows ou `Cmd + Shift + .` no macOS antes de arrastar.

---

## Depois de publicar

### Adicionar os colegas do grupo

**Settings → Collaborators → Add people** → digite o usuário de cada integrante. Cada pessoa precisa aceitar o convite recebido por e-mail.

### Clonar em outro computador (colegas ou banca)

```bash
git clone https://github.com/anacarolinyb/tech-challenge-fase-4.git
cd tech-challenge-fase-4
```

E seguir o **Setup inicial** do README.

### Enviar novas alterações

```bash
git add .
git commit -m "Descreva o que mudou"
git push
```

### Antes de entregar

- [ ] Repositório **público**, ou a banca adicionada como colaboradora.
- [ ] Nomes e RMs preenchidos na seção **Integrantes** do README.
- [ ] Link do vídeo adicionado no README (seção *Documentação complementar*).
- [ ] Workflow **CI** verde na aba Actions.
- [ ] (Opcional) Release: aba **Releases → Create a new release** → tag `v1.0.0` → **Publish release**.

Link para entregar: `https://github.com/anacarolinyb/tech-challenge-fase-4`
