//Desenvolvido por Carlos Liberato

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('table tbody') as HTMLTableSectionElement | null;

    if (!tbody) return;

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

            // Limpa a tabela
            tbody!.innerHTML = '';

            result.data.forEach((row: any) => {
                const tr = document.createElement('tr');

                const siglaTd = document.createElement('td');
                siglaTd.textContent = row.abreviacao || '';

                const cursosTd = document.createElement('td');
                // mostramos o nome do curso por linha (uma linha por curso)
                cursosTd.textContent = row.curso || '';

                const disciplinasTd = document.createElement('td');
                disciplinasTd.textContent = (row.total_disciplinas != null) ? String(row.total_disciplinas) : '0';

                const turmasTd = document.createElement('td');
                turmasTd.textContent = (row.total_turmas != null) ? String(row.total_turmas) : '0';

                tr.appendChild(siglaTd);
                tr.appendChild(cursosTd);
                tr.appendChild(disciplinasTd);
                tr.appendChild(turmasTd);

                tbody!.appendChild(tr);
            });

        } catch (error) {
            console.error('Erro ao carregar resumo do dashboard:', error);
        }
    }

    carregarResumo();
});
