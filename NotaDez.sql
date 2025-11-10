create database notadez;
use notadez;

CREATE TABLE usuario
(
	id_usuario int auto_increment primary key,
	nome varchar(255),
	email varchar(255) not null unique,
	telefone varchar(20),
	senha varchar(255)
);
select * from usuario;

CREATE TABLE instituicao (
    id_instituicao INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    abreviacao VARCHAR(20) NOT NULL,
    fk_usuario INT NOT NULL,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario)
);

select * from instituicao;

CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    periodo VARCHAR(50),
    fk_instituicao INT NOT NULL,
    FOREIGN KEY (fk_instituicao) REFERENCES instituicao(id_instituicao)
);

CREATE TABLE formula (
    id_formula INT AUTO_INCREMENT PRIMARY KEY,
    expressao TEXT NOT NULL,
    descricao VARCHAR(255),
    tipo VARCHAR(20) NOT NULL DEFAULT 'aritmetica' -- 'aritmetica' or 'ponderada'
);

CREATE TABLE nota_final (
    id_notaFinal INT AUTO_INCREMENT PRIMARY KEY,
    valor DECIMAL(5,2)
);

CREATE TABLE disciplinas (
    id_disciplina INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    sigla VARCHAR(20),
    fk_curso INT NOT NULL,
    fk_formula INT,
    fk_notaFinal INT,
    FOREIGN KEY (fk_curso) REFERENCES cursos(id_curso),
    FOREIGN KEY (fk_formula) REFERENCES formula(id_formula),
    FOREIGN KEY (fk_notaFinal) REFERENCES nota_final(id_notaFinal)
);

CREATE TABLE turmas (
    id_turma INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    fk_disciplina INT NOT NULL,
    FOREIGN KEY (fk_disciplina) REFERENCES disciplinas(id_disciplina)
);

CREATE TABLE alunos (
    ra INT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    fk_turma INT NOT NULL,
    FOREIGN KEY (fk_turma) REFERENCES turmas(id_turma)
);

CREATE TABLE componentes_notas (
    id_compNota INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    sigla VARCHAR(20),
    descricao VARCHAR(255),
    fk_disciplina INT NOT NULL,
    FOREIGN KEY (fk_disciplina) REFERENCES disciplinas(id_disciplina)
);

CREATE TABLE auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    data_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acao VARCHAR(255) NOT NULL
);

CREATE TABLE registra (
    fk_compNota INT NOT NULL,
    fk_auditoria INT NOT NULL,
    PRIMARY KEY (fk_compNota, fk_auditoria),
    FOREIGN KEY (fk_compNota) REFERENCES componentes_notas(id_compNota),
    FOREIGN KEY (fk_auditoria) REFERENCES auditoria(id_auditoria)
);

CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

