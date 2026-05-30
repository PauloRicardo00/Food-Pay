-- ============================================================
-- FoodPay — Script de Criação do Banco de Dados
-- SQL Server 2019+
--
-- Instruções:
--   Execute este script no SQL Server Management Studio (SSMS)
--   ou via sqlcmd:
--     sqlcmd -S localhost -i database/schema.sql
-- ============================================================

-- Cria o banco de dados (ignora se já existir)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'FoodPay')
BEGIN
    CREATE DATABASE FoodPay;
END
GO

USE FoodPay;
GO

-- ────────────────────────────────────────────────────────────
-- TABELAS PRINCIPAIS
-- ────────────────────────────────────────────────────────────

-- Responsáveis financeiros pelos alunos
CREATE TABLE Responsaveis (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Nome          NVARCHAR(150)  NOT NULL,
    Email         NVARCHAR(150)  NOT NULL UNIQUE,
    SenhaHash     NVARCHAR(500)  NOT NULL,
    DataCriacao   DATETIME       NOT NULL DEFAULT GETDATE(),
    Ativo         BIT            NOT NULL DEFAULT 1
);
GO

-- Alunos com saldo e limite diário
CREATE TABLE Alunos (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Nome          NVARCHAR(150)  NOT NULL,
    Email         NVARCHAR(150)  NOT NULL UNIQUE,
    SenhaHash     NVARCHAR(500)  NOT NULL,
    Saldo         DECIMAL(18,2)  NOT NULL DEFAULT 0,
    LimiteDiario  DECIMAL(18,2)  NOT NULL DEFAULT 0,
    DataCriacao   DATETIME       NOT NULL DEFAULT GETDATE(),
    Ativo         BIT            NOT NULL DEFAULT 1
);
GO

-- Funcionários da cantina
CREATE TABLE Funcionarios (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    Nome          NVARCHAR(150)  NOT NULL,
    Email         NVARCHAR(150)  NOT NULL UNIQUE,
    SenhaHash     NVARCHAR(500)  NOT NULL,
    Cargo         NVARCHAR(100),
    DataCriacao   DATETIME       NOT NULL DEFAULT GETDATE(),
    Ativo         BIT            NOT NULL DEFAULT 1
);
GO

-- ────────────────────────────────────────────────────────────
-- RELACIONAMENTOS
-- ────────────────────────────────────────────────────────────

-- Vínculo entre responsáveis e alunos (N:N)
CREATE TABLE ResponsavelAluno (
    Id             INT IDENTITY(1,1) PRIMARY KEY,
    ResponsavelId  INT NOT NULL,
    AlunoId        INT NOT NULL,

    CONSTRAINT FK_ResponsavelAluno_Responsavel
        FOREIGN KEY (ResponsavelId) REFERENCES Responsaveis(Id),
    CONSTRAINT FK_ResponsavelAluno_Aluno
        FOREIGN KEY (AlunoId) REFERENCES Alunos(Id)
);
GO

-- ────────────────────────────────────────────────────────────
-- CARDÁPIO
-- ────────────────────────────────────────────────────────────

-- Categorias dos produtos
CREATE TABLE Categorias (
    Id    INT IDENTITY(1,1) PRIMARY KEY,
    Nome  NVARCHAR(100) NOT NULL
);
GO

-- Produtos disponíveis na cantina
CREATE TABLE Produtos (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    Nome        NVARCHAR(150)  NOT NULL,
    Descricao   NVARCHAR(500),
    Preco       DECIMAL(18,2)  NOT NULL,
    ImagemUrl   NVARCHAR(500),
    Disponivel  BIT            NOT NULL DEFAULT 1,
    CategoriaId INT            NULL,

    CONSTRAINT FK_Produtos_Categorias
        FOREIGN KEY (CategoriaId) REFERENCES Categorias(Id)
);
GO

-- ────────────────────────────────────────────────────────────
-- PEDIDOS
-- ────────────────────────────────────────────────────────────

-- Pedidos realizados pelos alunos
-- Status: "Pendente" | "EmPreparo" | "Pronto" | "Entregue" | "Cancelado"
CREATE TABLE Pedidos (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    AlunoId     INT            NOT NULL,
    ValorTotal  DECIMAL(18,2)  NOT NULL DEFAULT 0,
    Status      NVARCHAR(50)   NOT NULL,
    DataPedido  DATETIME       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Pedidos_Alunos
        FOREIGN KEY (AlunoId) REFERENCES Alunos(Id)
);
GO

-- Itens de cada pedido
CREATE TABLE ItensPedido (
    Id             INT IDENTITY(1,1) PRIMARY KEY,
    PedidoId       INT            NOT NULL,
    ProdutoId      INT            NOT NULL,
    Quantidade     INT            NOT NULL,
    PrecoUnitario  DECIMAL(18,2)  NOT NULL,

    CONSTRAINT FK_ItensPedido_Pedido
        FOREIGN KEY (PedidoId) REFERENCES Pedidos(Id),
    CONSTRAINT FK_ItensPedido_Produto
        FOREIGN KEY (ProdutoId) REFERENCES Produtos(Id)
);
GO

-- ────────────────────────────────────────────────────────────
-- FINANCEIRO
-- ────────────────────────────────────────────────────────────

-- Registros de pagamento integrados com Stripe
-- Status: "Pendente" | "Aprovado" | "Falhou" | "Estornado"
CREATE TABLE Pagamentos (
    Id                      INT IDENTITY(1,1) PRIMARY KEY,
    AlunoId                 INT            NOT NULL,
    Valor                   DECIMAL(18,2)  NOT NULL,
    StripeSessionId         NVARCHAR(300),
    StripePaymentIntentId   NVARCHAR(300),
    Status                  NVARCHAR(50)   NOT NULL,
    DataPagamento           DATETIME       NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Pagamentos_Aluno
        FOREIGN KEY (AlunoId) REFERENCES Alunos(Id)
);
GO

-- ────────────────────────────────────────────────────────────
-- NOTIFICAÇÕES
-- ────────────────────────────────────────────────────────────

-- Notificações internas do sistema
-- Perfil: "aluno" | "funcionario" | "responsavel"
CREATE TABLE Notificacoes (
    Id         INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId  INT            NOT NULL,
    Perfil     NVARCHAR(50)   NOT NULL,
    Mensagem   NVARCHAR(500)  NOT NULL,
    Lida       BIT            NOT NULL DEFAULT 0,
    DataEnvio  DATETIME       NOT NULL DEFAULT GETDATE()
);
GO

-- ────────────────────────────────────────────────────────────
-- DADOS INICIAIS (SEED)
-- ────────────────────────────────────────────────────────────

-- Categorias padrão
INSERT INTO Categorias (Nome) VALUES
    ('Lanches'),
    ('Bebidas'),
    ('Refeições'),
    ('Sobremesas'),
    ('Saudável');
GO

PRINT 'Banco de dados FoodPay criado com sucesso.';
GO
