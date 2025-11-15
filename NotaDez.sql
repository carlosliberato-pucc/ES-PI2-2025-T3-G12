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

CREATE TABLE instituicao (
    id_instituicao INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    abreviacao VARCHAR(20) NOT NULL,
    fk_usuario INT NOT NULL,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario)
);

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
    codigo VARCHAR(20),
    periodo VARCHAR(20) NOT NULL DEFAULT '1º semestre',
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
    acao VARCHAR(255) NOT NULL,
    fk_usuario INT NOT NULL,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE registra (
    fk_compNota INT NOT NULL,
    fk_auditoria INT NOT NULL,
    PRIMARY KEY (fk_compNota, fk_auditoria),
    FOREIGN KEY (fk_compNota) REFERENCES componentes_notas(id_compNota),
    FOREIGN KEY (fk_auditoria) REFERENCES auditoria(id_auditoria)
);

DELIMITER $$
CREATE TRIGGER trg_auditoria_instituicoes
AFTER INSERT ON INSTITUICAO
FOR EACH ROW
BEGIN
    INSERT INTO auditoria(acao, fk_usuario)
    VALUES (
        CONCAT('O usuário de ID = ', NEW.fk_usuario, ' criou a INSTITUICAO', NEW.nome),
        NEW.fk_usuario
    );
END $$

DELIMITER $$
CREATE TRIGGER trg_auditoria_cursos
AFTER INSERT ON CURSOS
FOR EACH ROW
BEGIN
    DECLARE v_usuario_instituicao INT;
    DECLARE v_nome_instituicao VARCHAR(100);

    SELECT fk_usuario, nome
    INTO v_usuario_instituicao, v_nome_instituicao
    FROM INSTITUICAO
    WHERE ID_INSTITUICAO = NEW.fk_instituicao;

    INSERT INTO auditoria(acao, fk_usuario)
    VALUES (
        CONCAT(
            'O usuário de ID = ', v_usuario_instituicao,
            ' criou o CURSO ', NEW.nome,
            ' na INSTITUIÇÃO ', v_nome_instituicao
        ),
        v_usuario_instituicao
    );
END $$

DELIMITER $$
CREATE TRIGGER trg_auditoria_disciplinas
AFTER INSERT ON DISCIPLINAS
FOR EACH ROW
BEGIN
    DECLARE v_usuario_instituicao INT;
    DECLARE v_nome_instituicao VARCHAR(100);

    SELECT i.fk_usuario, i.nome
    INTO v_usuario_instituicao, v_nome_instituicao
    FROM INSTITUICAO i
    INNER JOIN CURSOS c ON c.fk_instituicao = i.ID_INSTITUICAO
    WHERE c.ID_CURSO = NEW.fk_curso;

    INSERT INTO auditoria(acao, fk_usuario)
    VALUES (
        CONCAT(
            'O usuário de ID = ', v_usuario_instituicao,
            ' criou a DISCIPLINA ', NEW.nome,
            ' na INSTITUIÇÃO ', v_nome_instituicao
        ),
        v_usuario_instituicao
    );
END $$

DELIMITER $$
CREATE TRIGGER trg_auditoria_turmas
AFTER INSERT ON TURMAS
FOR EACH ROW
BEGIN
    DECLARE v_usuario_instituicao INT;
    DECLARE v_nome_instituicao VARCHAR(100);

    SELECT i.fk_usuario, i.nome
    INTO v_usuario_instituicao, v_nome_instituicao
    FROM INSTITUICAO i
    INNER JOIN CURSOS c ON c.fk_instituicao = i.ID_INSTITUICAO
    INNER JOIN DISCIPLINAS d ON d.fk_curso = c.ID_CURSO
    WHERE d.ID_DISCIPLINA = NEW.fk_disciplina;

    INSERT INTO auditoria(acao, fk_usuario)
    VALUES (
        CONCAT(
            'O usuário de ID = ', v_usuario_instituicao,
            ' criou a TURMA ', NEW.nome,
            ' na INSTITUIÇÃO ', v_nome_instituicao
        ),
        v_usuario_instituicao
    );
END $$

DELIMITER $$
CREATE TRIGGER trg_auditoria_delete_instituicoes
AFTER DELETE ON INSTITUICAO
FOR EACH ROW
BEGIN
    INSERT INTO auditoria(acao, fk_usuario)
    VALUES (
        CONCAT('O usuário de ID = ', OLD.fk_usuario, ' deletou a INSTITUIÇÃO ', OLD.nome),
        OLD.fk_usuario
    );
END $$

DELIMITER $$
CREATE TRIGGER trg_auditoria_delete_cursos
AFTER DELETE ON CURSOS
FOR EACH ROW
BEGIN
    DECLARE v_usuario_instituicao INT;
    DECLARE v_nome_instituicao VARCHAR(100);
    
    SELECT fk_usuario, nome
    INTO v_usuario_instituicao, v_nome_instituicao
    FROM INSTITUICAO
    WHERE ID_INSTITUICAO = OLD.fk_instituicao;
    
    INSERT INTO auditoria(acao, fk_usuario)
    VALUES (
        CONCAT(
            'O usuário de ID = ', v_usuario_instituicao,
            ' deletou o CURSO ', OLD.nome,
            ' da INSTITUIÇÃO ', v_nome_instituicao
        ),
        v_usuario_instituicao
    );
END $$

DELIMITER $$
CREATE TRIGGER trg_auditoria_delete_disciplinas
AFTER DELETE ON DISCIPLINAS
FOR EACH ROW
BEGIN
    DECLARE v_usuario_instituicao INT;
    DECLARE v_nome_instituicao VARCHAR(100);
    DECLARE v_nome_curso VARCHAR(100);
    
    SELECT i.fk_usuario, i.nome, c.nome
    INTO v_usuario_instituicao, v_nome_instituicao, v_nome_curso
    FROM INSTITUICAO i
    INNER JOIN CURSOS c ON c.fk_instituicao = i.ID_INSTITUICAO
    WHERE c.ID_CURSO = OLD.fk_curso;
    
    INSERT INTO auditoria(acao, fk_usuario)
    VALUES (
        CONCAT(
            'O usuário de ID = ', v_usuario_instituicao,
            ' deletou a DISCIPLINA ', OLD.nome,
            ' do CURSO ', v_nome_curso,
            ' da INSTITUIÇÃO ', v_nome_instituicao
        ),
        v_usuario_instituicao
    );
END $$

DELIMITER $$
CREATE TRIGGER trg_auditoria_delete_turmas
AFTER DELETE ON TURMAS
FOR EACH ROW
BEGIN
    DECLARE v_usuario_instituicao INT;
    DECLARE v_nome_instituicao VARCHAR(100);
    DECLARE v_nome_disciplina VARCHAR(100);
    
    SELECT i.fk_usuario, i.nome, d.nome
    INTO v_usuario_instituicao, v_nome_instituicao, v_nome_disciplina
    FROM INSTITUICAO i
    INNER JOIN CURSOS c ON c.fk_instituicao = i.ID_INSTITUICAO
    INNER JOIN DISCIPLINAS d ON d.fk_curso = c.ID_CURSO
    WHERE d.ID_DISCIPLINA = OLD.fk_disciplina;
    
    INSERT INTO auditoria(acao, fk_usuario)
    VALUES (
        CONCAT(
            'O usuário de ID = ', v_usuario_instituicao,
            ' deletou a TURMA ', OLD.nome,
            ' da DISCIPLINA ', v_nome_disciplina,
            ' da INSTITUIÇÃO ', v_nome_instituicao
        ),
        v_usuario_instituicao
    );
END $$

DELIMITER ;

CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);