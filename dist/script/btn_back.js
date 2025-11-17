"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const btnVoltar = document.getElementById('btn_voltar');
    btnVoltar?.addEventListener('click', () => {
        const paginaAtual = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        // Pega os IDs da URL atual
        const idInstituicao = params.get('id_instituicao');
        const idCurso = params.get('id_curso');
        const idDisciplina = params.get('id_disciplina');
        // Define o destino e quais parâmetros manter
        switch (paginaAtual) {
            case '/turma_dashboard':
                // Volta para turmas, mantendo instituição, curso e disciplina
                window.location.href = `/turmas?id_instituicao=${idInstituicao}&id_curso=${idCurso}&id_disciplina=${idDisciplina}`;
                break;
            case '/turmas':
                // Volta para disciplinas, mantendo instituição e curso
                window.location.href = `/disciplinas?id_instituicao=${idInstituicao}&id_curso=${idCurso}`;
                break;
            case '/disciplinas':
                // Volta para cursos, mantendo apenas instituição
                window.location.href = `/cursos?id_instituicao=${idInstituicao}`;
                break;
            case '/cursos':
                // Volta para instituições (sem parâmetros)
                window.location.href = '/instituicoes';
                break;
            case '/instituicoes':
                // Volta para dashboard
                window.location.href = '/dashboard';
                break;
            default:
                // Fallback
                window.location.href = '/dashboard';
        }
    });
});
