"use strict";
// Script para popular a tabela do dashboard com resumo por instituição
document.addEventListener('DOMContentLoaded', () => {
    // Seleciona corpo da tabela onde os dados serão inseridos
    const tbody = document.querySelector('table tbody');
    if (!tbody)
        return;
    // Função principal: busca o resumo no backend e popula a tabela
    async function carregarResumo() {
        try {
            const response = await fetch('http://localhost:3000/api/instituicoes/resumo', {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Erro ao carregar resumo:', response.status);
                return;
            }
            const result = await response.json();
            if (!result.success || !Array.isArray(result.data)) {
                console.error('Resposta inválida ao buscar resumo:', result);
                return;
            }
            // Limpa linhas anteriores do tbody
            tbody.innerHTML = '';
            // Para cada linha do resultado, cria uma linha na tabela
            result.data.forEach((row) => {
                const tr = document.createElement('tr');
                const siglaTd = document.createElement('td');
                siglaTd.textContent = row.abreviacao || '';
                const cursosTd = document.createElement('td');
                // Nome do curso por linha
                cursosTd.textContent = row.curso || '';
                const disciplinasTd = document.createElement('td');
                disciplinasTd.textContent = (row.total_disciplinas != null) ? String(row.total_disciplinas) : '0';
                const turmasTd = document.createElement('td');
                turmasTd.textContent = (row.total_turmas != null) ? String(row.total_turmas) : '0';
                tr.appendChild(siglaTd);
                tr.appendChild(cursosTd);
                tr.appendChild(disciplinasTd);
                tr.appendChild(turmasTd);
                tbody.appendChild(tr);
            });
        }
        catch (error) {
            console.error('Erro ao carregar resumo do dashboard:', error);
        }
    }
    // Executa a função ao carregar a página
    carregarResumo();
});
