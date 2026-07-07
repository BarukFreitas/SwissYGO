describe('Fluxo de Histórico de Partidas', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/');
    });

    it('deve exibir o histórico de partidas atualizado a cada rodada e após finalizar o torneio', () => {
        // 1. Criar Torneio
        cy.get('[data-testid="new-tournament-input"]').type('Torneio Historico');
        cy.get('[data-testid="create-tournament-button"]').click();

        // 2. Adicionar 4 jogadores
        const players = ['Yugi', 'Kaiba', 'Joey', 'Mai'];
        players.forEach(player => {
            cy.get('[data-testid="player-name-input"]').type(player);
            cy.get('[data-testid="add-player-button"]').click();
        });

        // 3. Começar o Torneio
        cy.get('[data-testid="start-tournament-button"]').click();

        // 4. Ir para a aba de histórico e validar estado pendente
        cy.get('[data-testid="history-tab"]').click();
        cy.get('[data-testid="match-history-container"]').should('exist');
        cy.get('[data-testid="history-round-card"]').should('have.length', 1);
        cy.get('[data-testid="history-round-card"]').eq(0).should('contain', 'Rodada 1');
        
        // Deve listar 2 partidas pendentes
        cy.get('[data-testid="history-match-item"]').should('have.length', 2);
        cy.get('[data-testid="history-match-status"]').eq(0).should('contain', 'PENDENTE');
        cy.get('[data-testid="history-match-status"]').eq(1).should('contain', 'PENDENTE');

        // 5. Voltar para Pareamentos e submeter resultados
        cy.get('[data-testid="pairings-tab"]').click();
        cy.get('[data-testid="p1-win-button"]').each(($btn) => {
            cy.wrap($btn).click();
        });

        // 6. Voltar ao histórico e validar que os resultados mudaram para vitória
        cy.get('[data-testid="history-tab"]').click();
        cy.get('[data-testid="history-match-status"]').eq(0).should('not.contain', 'PENDENTE');
        cy.get('[data-testid="history-match-status"]').eq(1).should('not.contain', 'PENDENTE');

        // 7. Avançar para a rodada 2
        // O botão de próxima rodada fica habilitado
        cy.get('[data-testid="next-round-button"]').click();

        // 8. Verificar que agora temos duas rodadas no histórico
        cy.get('[data-testid="history-tab"]').click();
        cy.get('[data-testid="history-round-card"]').should('have.length', 2);
        // O primeiro card (index 0) deve ser a Rodada 2, já que listamos em ordem reversa
        cy.get('[data-testid="history-round-card"]').eq(0).should('contain', 'Rodada 2');
        cy.get('[data-testid="history-round-card"]').eq(1).should('contain', 'Rodada 1');

        // 9. Completar as rodadas até o final para verificar o comportamento finalizado
        // Rodada 2
        cy.get('[data-testid="pairings-tab"]').click();
        cy.get('[data-testid="p1-win-button"]').each(($btn) => {
            cy.wrap($btn).click();
        });
        cy.get('[data-testid="next-round-button"]').click();

        // Rodada 3
        cy.get('[data-testid="pairings-tab"]').click();
        cy.get('[data-testid="p1-win-button"]').each(($btn) => {
            cy.wrap($btn).click();
        });
        cy.get('[data-testid="next-round-button"]').click(); // Finaliza o Torneio

        // 10. Validar aba de histórico no torneio finalizado
        cy.contains('Torneio Finalizado!');
        cy.get('[data-testid="history-tab"]').click();
        cy.get('[data-testid="match-history-container"]').should('exist');
        cy.get('[data-testid="history-round-card"]').should('have.length', 3);
        cy.get('[data-testid="history-round-card"]').eq(0).should('contain', 'Rodada 3');
        cy.get('[data-testid="history-round-card"]').eq(2).should('contain', 'Rodada 1');

        // Voltar ao menu
        cy.get('[data-testid="return-home-button"]').click();
        cy.url().should('eq', 'http://localhost:3000/');
    });
});
