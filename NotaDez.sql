CREATE DATABASE notadez;
USE notadez;

-- 1. USUARIO
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    senha VARCHAR(255)
);

-- 2. INSTITUICAO
CREATE TABLE instituicao (
    id_instituicao INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    abreviacao VARCHAR(20) NOT NULL,
    fk_usuario INT NOT NULL,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario)
);

-- 3. CURSOS
CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    periodo VARCHAR(50),
    fk_instituicao INT NOT NULL,
    FOREIGN KEY (fk_instituicao) REFERENCES instituicao(id_instituicao)
);

-- 4. FORMULA
CREATE TABLE formula (
    id_formula INT AUTO_INCREMENT PRIMARY KEY,
    expressao TEXT NOT NULL,
    descricao VARCHAR(255),
    tipo VARCHAR(20) NOT NULL DEFAULT 'aritmetica'
);

-- 5. DISCIPLINAS
CREATE TABLE disciplinas (
    id_disciplina INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    sigla VARCHAR(20),
    codigo VARCHAR(20),
    periodo VARCHAR(20) NOT NULL DEFAULT '1º semestre',
    fk_curso INT NOT NULL,
    fk_formula INT,
    FOREIGN KEY (fk_curso) REFERENCES cursos(id_curso),
    FOREIGN KEY (fk_formula) REFERENCES formula(id_formula)
);
select * from disciplinas;

-- 6. TURMAS
CREATE TABLE turmas (
    id_turma INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    fk_disciplina INT NOT NULL,
    FOREIGN KEY (fk_disciplina) REFERENCES disciplinas(id_disciplina)
);
select * from turmas;
-- 7. ALUNOS
CREATE TABLE alunos (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  matricula VARCHAR(50) NOT NULL,
  nome      VARCHAR(255) NOT NULL,
  fk_turma  INT NOT NULL,
  CONSTRAINT fk_alunos_turmas
    FOREIGN KEY (fk_turma) REFERENCES turmas(id_turma)
    ON DELETE CASCADE
);
select * from alunos;

-- 8. NOTA_FINAL
CREATE TABLE nota_final (
    id_notaFinal INT AUTO_INCREMENT PRIMARY KEY,
    valor DECIMAL(5,2),
    fk_id_aluno INT NOT NULL,
    fk_turma INT NOT NULL,
    CONSTRAINT fk_nf_aluno FOREIGN KEY (fk_id_aluno) REFERENCES alunos(id),
    CONSTRAINT fk_nf_turma FOREIGN KEY (fk_turma) REFERENCES turmas(id_turma),
    UNIQUE KEY unico_nota_final (fk_id_aluno, fk_turma)
);

-- 9. COMPONENTES_NOTAS
CREATE TABLE componentes_notas (
    id_compNota INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    sigla VARCHAR(20),
    descricao VARCHAR(255),
    fk_disciplina INT NOT NULL,
    FOREIGN KEY (fk_disciplina) REFERENCES disciplinas(id_disciplina)
);
select * from componentes_notas;

-- 10. NOTAS
CREATE TABLE notas (
    id_nota INT AUTO_INCREMENT PRIMARY KEY,
    valor DECIMAL(5,2) NOT NULL,
    fk_id_aluno INT NOT NULL,
    fk_compNota INT NOT NULL,
    FOREIGN KEY (fk_id_aluno) REFERENCES alunos(id),
    FOREIGN KEY (fk_compNota) REFERENCES componentes_notas(id_compNota),
    UNIQUE KEY unique_nota_aluno_componente (fk_id_aluno, fk_compNota)
);
select * from notas;
-- 11. AUDITORIA
CREATE TABLE auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    data_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acao TEXT NOT NULL,
    fk_usuario INT NOT NULL,
    fk_id_aluno INT NULL,
    fk_compNota INT NULL,
    valor_anterior DECIMAL(5,2) NULL,
    valor_novo DECIMAL(5,2) NULL,
    FOREIGN KEY (fk_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (fk_id_aluno) REFERENCES alunos(id),
    FOREIGN KEY (fk_compNota) REFERENCES componentes_notas(id_compNota)
);

-- 12. REGISTRA
CREATE TABLE registra (
    fk_compNota INT NOT NULL,
    fk_auditoria INT NOT NULL,
    PRIMARY KEY (fk_compNota, fk_auditoria),
    FOREIGN KEY (fk_compNota) REFERENCES componentes_notas(id_compNota),
    FOREIGN KEY (fk_auditoria) REFERENCES auditoria(id_auditoria)
);

-- 13. PASSWORD_RESET_TOKENS
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRIGGERS - APENAS PARA NOTAS
-- ============================================

-- TRIGGER PARA INSERT DE NOTAS
DELIMITER $$

CREATE TRIGGER trg_auditoria_notas_insert
AFTER INSERT ON notas
FOR EACH ROW
BEGIN
    DECLARE v_id_aluno INT;
    DECLARE v_matricula VARCHAR(50);
    DECLARE v_nome_aluno VARCHAR(100);
    DECLARE v_nome_componente VARCHAR(100);
    DECLARE v_usuario_id INT;

    -- Buscar dados do aluno pelo ID (fk_id_aluno)
    SELECT id, matricula, nome
      INTO v_id_aluno, v_matricula, v_nome_aluno
      FROM alunos
     WHERE id = NEW.fk_id_aluno
     LIMIT 1;

    -- Nome do componente
    SELECT nome INTO v_nome_componente
      FROM componentes_notas
     WHERE id_compNota = NEW.fk_compNota;

    -- Dono (usuário) da instituição ligada a esse aluno
    SELECT i.fk_usuario INTO v_usuario_id
      FROM alunos a
      INNER JOIN turmas t       ON a.fk_turma      = t.id_turma
      INNER JOIN disciplinas d  ON t.fk_disciplina = d.id_disciplina
      INNER JOIN cursos c       ON d.fk_curso      = c.id_curso
      INNER JOIN instituicao i  ON c.fk_instituicao= i.id_instituicao
     WHERE a.id = NEW.fk_id_aluno
     LIMIT 1;

    INSERT INTO auditoria(acao, fk_usuario, fk_id_aluno, fk_compNota, valor_anterior, valor_novo)
    VALUES (
        CONCAT('(Aluno ID ', v_id_aluno, ' / Matrícula ', v_matricula,
               ') - Nota de ', v_nome_componente, ' = ', NEW.valor, ' lançada'),
        IFNULL(v_usuario_id, 1),
        NEW.fk_id_aluno,
        NEW.fk_compNota,
        NULL,
        NEW.valor
    );
END$$

CREATE TRIGGER trg_auditoria_notas_update
AFTER UPDATE ON notas
FOR EACH ROW
BEGIN
    DECLARE v_id_aluno INT;
    DECLARE v_matricula VARCHAR(50);
    DECLARE v_nome_aluno VARCHAR(100);
    DECLARE v_nome_componente VARCHAR(100);
    DECLARE v_usuario_id INT;

    IF OLD.valor <> NEW.valor THEN
        -- Buscar dados do aluno pelo ID
        SELECT id, matricula, nome
          INTO v_id_aluno, v_matricula, v_nome_aluno
          FROM alunos
         WHERE id = NEW.fk_id_aluno
         LIMIT 1;

        -- Nome do componente
        SELECT nome INTO v_nome_componente
          FROM componentes_notas
         WHERE id_compNota = NEW.fk_compNota;

        -- Dono (usuário) da instituição ligada a esse aluno
        SELECT i.fk_usuario INTO v_usuario_id
          FROM alunos a
          INNER JOIN turmas t       ON a.fk_turma      = t.id_turma
          INNER JOIN disciplinas d  ON t.fk_disciplina = d.id_disciplina
          INNER JOIN cursos c       ON d.fk_curso      = c.id_curso
          INNER JOIN instituicao i  ON c.fk_instituicao= i.id_instituicao
         WHERE a.id = NEW.fk_id_aluno
         LIMIT 1;

        INSERT INTO auditoria(acao, fk_usuario, fk_id_aluno, fk_compNota, valor_anterior, valor_novo)
        VALUES (
            CONCAT('(Aluno ID ', v_id_aluno, ' / Matrícula ', v_matricula,
                   ') - Nota de ', v_nome_componente,
                   ' de ', OLD.valor, ' para ', NEW.valor, ' modificada e salva'),
            IFNULL(v_usuario_id, 1),
            NEW.fk_id_aluno,
            NEW.fk_compNota,
            OLD.valor,
            NEW.valor
        );
    END IF;
END$$

DELIMITER ;
