# 📘 Projeto Integrador II – Engenharia de Software  

## 📌 Informações Gerais
- **Disciplina:** Projeto Integrador II  
- **Curso:** Engenharia de Software  
- **Semestre:** 2025/2  
- **Turma:** T3  
- **Grupo:** G12  
- **Professor:** Luã Marcelo Muriana  

## 👨‍💻 Integrantes do Grupo
- Carlos Liberato  
- Felipe Miranda  
- Gabriel Coutinho  
- Leonardo Amad  
- Nicolas Reis  

---

## 🌟 Projeto ClassBoard

<p align="center">
  <img src="public/img/NotaDez_Logo.png" alt="Logo ClassBoard" width="350"/>
</p>

O **ClassBoard** é uma aplicação web inovadora voltada para **docentes do ensino superior**, com o objetivo de gerenciar notas e desempenho acadêmico de seus estudantes de forma **intuitiva, segura e automatizada**.  

Atualmente, muitos professores dependem de planilhas como Excel para registrar notas, o que limita a integração com sistemas institucionais e dificulta o gerenciamento eficiente ao longo do tempo. O ClassBoard resolve esse problema, permitindo que o docente:

- Cadastre instituições, disciplinas, cursos e turmas com facilidade;  
- Importe e gerencie listas de estudantes via CSV;  
- Lance notas em diferentes atividades e provas;  
- Calcule automaticamente a nota final de cada aluno;  
- Acesse e exporte dados de qualquer lugar.  

O projeto é **100% web**, focado na praticidade do docente.

---

## 🛠 Funcionalidades Principais

### 1. Autenticação
- Cadastro de conta com **nome, e-mail, telefone e senha**;  
- Recuperação de senha via e-mail (“Esqueci minha senha”);  
- Não há acesso anônimo ou modo visitante;  
- A primeira tela após abrir o sistema é a de **login/autenticação**.  

### 2. Gerenciamento de Instituições, Disciplinas, Cursos e Turmas
- Cadastro de pelo menos uma instituição ao acessar o sistema;  
- Criação de turmas vinculadas a disciplinas, com possibilidade de múltiplas turmas por disciplina;  
- Exclusão de instituições depende da remoção prévia de turmas, disciplinas e cursos associadas.  

### 3. Cadastro e Importação de Estudantes
- Cadastro manual ou em lote (via **CSV**);  
- **CSV:** apenas as duas primeiras colunas são utilizadas (matrícula + nome do estudante);  
- Gerenciamento completo: incluir, editar ou remover estudantes de forma individual.

---

## 🚀 Tecnologias Previstas
- HTML5;  
- CSS3;
- TypeScript / JavaScript;
- MySql;

- Node.Js

---


# NotaDez - Sistema de Gerenciamento de Notas

## 🚀 Como Rodar Localmente (Guia Rápido)

### 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

1. **Node.js** (versão 18 ou superior) - [Download aqui](https://nodejs.org/)
2. **MySQL Server** (versão 8.0 ou superior) - [Download aqui](https://dev.mysql.com/downloads/mysql/)
3. **Git** - [Download aqui](https://git-scm.com/)

---

## 🗄️ PASSO 1: Instalar e Configurar o MySQL

### 1.1. Instalar o MySQL Server

1. Baixe o **MySQL Installer** no site oficial: https://dev.mysql.com/downloads/installer/
2. Execute o instalador e escolha a opção **"Developer Default"** ou **"Server only"**
3. Durante a instalação:
   - Defina uma **senha root** (anote essa senha!)
   - Mantenha a porta padrão **3306**
   - Configure para iniciar o MySQL automaticamente
4. Finalize a instalação

### 1.2. Verificar se o MySQL está Rodando

Abra o **Prompt de Comando (CMD)** ou **PowerShell** e execute:

```bash
mysql --version
```

Se aparecer a versão do MySQL, está instalado corretamente! 

Caso contrário, adicione o MySQL ao PATH do Windows:
- Procure por "Variáveis de Ambiente" no menu Iniciar
- Em "Path" do sistema, adicione: `C:\Program Files\MySQL\MySQL Server 8.0\bin`

### 1.3. Criar o Banco de Dados NotaDez

Existem **duas formas** de criar o banco de dados:

---

#### **OPÇÃO A: Via MySQL Workbench (Mais Fácil - RECOMENDADO)**

1. Abra o **MySQL Workbench** (instalado junto com o MySQL)
2. Clique em **"Local instance MySQL80"** e digite a senha root
3. No painel central, cole o seguinte comando:

```sql
CREATE DATABASE notadez;
```

4. Clique no ícone de **raio ⚡** para executar (ou pressione `Ctrl + Enter`)
5. No menu lateral esquerdo, clique com botão direito em **Schemas** → **Refresh All**
6. Você verá o banco `notadez` aparecer na lista
7. Execute o comando abaixo para selecionar o banco:

```sql
USE notadez;
```

8. Agora, abra o arquivo `NotaDez.sql` que está na pasta do projeto:
   - Clique em **File → Open SQL Script**
   - Navegue até a pasta do projeto e selecione `NotaDez.sql`
   - Clique no ícone de **raio ⚡** para executar TODO o script de uma vez
   - Aguarde até aparecer "X statements executed successfully"

9. Pronto! Todas as tabelas e triggers foram criadas automaticamente.

---

#### **OPÇÃO B: Via Linha de Comando (CMD/PowerShell)**

1. Abra o **CMD** ou **PowerShell**
2. Faça login no MySQL:

```bash
mysql -u root -p
```

3. Digite a senha root quando solicitado
4. Execute os comandos:

```sql
CREATE DATABASE notadez;
USE notadez;
```

5. Saia do MySQL digitando `exit`
6. Execute o script `NotaDez.sql` diretamente:

```bash
mysql -u root -p notadez < caminho/para/NotaDez.sql
```

**Exemplo:**
```bash
mysql -u root -p notadez < C:\Users\SeuUsuario\Documents\PI_II_ES_TIMEX\NotaDez.sql
```

7. Digite a senha root novamente
8. Pronto! O banco de dados e todas as tabelas foram criadas.

---

### 1.4. Verificar se as Tabelas Foram Criadas

No **MySQL Workbench** ou via **linha de comando**, execute:

```sql
USE notadez;
SHOW TABLES;
```

Você deve ver uma lista de tabelas como:
- `usuarios`
- `instituicoes`
- `disciplinas`
- `turmas`
- `alunos`
- `componentes_notas`
- `notas`
- `notas_finais`
- `auditoria_notas`
- `formulas_notas`

Se todas aparecerem, o banco está configurado corretamente! ✅

---

## 💻 PASSO 2: Clonar e Configurar o Projeto

### 2.1. Clonar o Repositório

Abra o **CMD** ou **PowerShell** e execute:

```bash
git clone https://github.com/carlosliberato-pucc/PI_II_ES_TIME12.git
cd PI_II_ES_TIMEX
```

### 2.2. Configurar as Variáveis de Ambiente (.env)

1. Na pasta do projeto, abra o arquivo `.env` em um editor de texto (Bloco de Notas, VSCode, etc)
2. Preencha as informações do MySQL que você configurou:

```env
# Configurações do Banco de Dados MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_root_aqui
DB_NAME=notadez

# Porta do Servidor
PORT=3000

# Chave Secreta para Sessões (crie uma senha forte qualquer)
SESSION_SECRET=minha_chave_secreta_super_segura_123

# Configurações de Email (para recuperação de senha)
# Se não tiver configurado email ainda, pode deixar em branco por enquanto
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
```

**IMPORTANTE:** Substitua `sua_senha_root_aqui` pela senha que você definiu quando instalou o MySQL!

4. Salve o arquivo `.env`

---

## 📦 PASSO 3: Instalar Dependências do Projeto

No mesmo CMD/PowerShell (dentro da pasta do projeto), execute:

### Se estiver no **PowerShell** e der erro de política:

```powershell
npm.cmd install
```

OU execute via CMD:

```powershell
cmd /c "npm install"
```

### Se estiver no **CMD normal**:

```bash
npm install
```

Aguarde a instalação de todas as dependências (pode demorar alguns minutos).

---

## ▶️ PASSO 4: Rodar o Projeto

Após a instalação das dependências, execute:

### No **PowerShell**:

```powershell
npm.cmd run dev
```

OU:

```powershell
cmd /c "npm run dev"
```

### No **CMD**:

```bash
npm run dev
```

Você verá uma mensagem como:

```
MySQL pool criado
Servidor rodando na porta 3000
```

---

## 🌐 PASSO 5: Acessar no Navegador

1. Abra seu navegador (Chrome, Firefox, Edge, etc)
2. Digite na barra de endereços:

```
http://localhost:3000
```

3. Você verá a página de login do **NotaDez**!
4. Crie uma conta ou faça login
5. Acesse o dashboard em: `http://localhost:3000/dashboard`

---

## 🛠️ Resolução de Problemas Comuns

### ❌ Erro: "Cannot connect to MySQL"

**Solução:**
1. Verifique se o MySQL está rodando:
   - Windows: Abra "Serviços" e procure por "MySQL80" - deve estar "Em execução"
   - Ou execute no CMD: `net start MySQL80`
2. Confirme que a senha no arquivo `.env` está correta
3. Verifique se o banco `notadez` foi criado:
   ```bash
   mysql -u root -p
   SHOW DATABASES;
   ```

### ❌ Erro: "Port 3000 already in use"

**Solução:**

No **CMD** (como Administrador):

```bash
netstat -ano | findstr :3000
taskkill /PID <número_do_PID> /F
```

OU mude a porta no arquivo `.env`:

```env
PORT=3001
```

E acesse `http://localhost:3001` no navegador.

### ❌ Erro: "npm : O arquivo ... não pode ser carregado" (PowerShell)

**Solução 1** (Recomendada):

```powershell
npm.cmd install
npm.cmd run dev
```

**Solução 2:**

Execute via CMD:

```powershell
cmd /c "npm install"
cmd /c "npm run dev"
```

**Solução 3** (Apenas se necessário):

Habilite execução de scripts no PowerShell:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

### ❌ Erro: "Table doesn't exist"

**Solução:**

O script SQL não foi executado corretamente. Execute novamente:

```bash
mysql -u root -p notadez < NotaDez.sql
```

---

## 📌 Resumo dos Comandos

```bash
# 1. Criar banco de dados (MySQL)
mysql -u root -p
CREATE DATABASE notadez;
USE notadez;
exit

# 2. Executar script SQL
mysql -u root -p notadez < NotaDez.sql

# 3. Clonar projeto
git clone <link-do-repositorio>
cd <nome-da-pasta>

# 4. Configurar .env
# (edite o arquivo manualmente com os dados do MySQL)

# 5. Instalar dependências
npm install
# OU no PowerShell:
npm.cmd install

# 6. Rodar o projeto
npm run dev
# OU no PowerShell:
npm.cmd run dev

# 7. Abrir no navegador
http://localhost:3000
```

---

## 🎯 Checklist Antes de Rodar

- [ ] MySQL instalado e rodando
- [ ] Banco `notadez` criado
- [ ] Script `NotaDez.sql` executado (tabelas e triggers criados)
- [ ] Arquivo `.env` configurado com senha do MySQL correta
- [ ] Dependências instaladas com `npm install`
- [ ] Servidor iniciado com `npm run dev`
- [ ] Navegador acessando `http://localhost:3000`

---


---

**Atualizado em:** 17 de Novembro de 2025  
**Versão:** 1.0.0
 
