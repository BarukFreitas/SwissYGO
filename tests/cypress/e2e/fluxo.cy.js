describe('Fluxo do Torneio Yu-Gi-Oh!', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/');
    });

    it('deve criar um torneio, inserir 6 jogadores e fazer o fluxo completo até o final', () => {
        cy.get('[data-testid="new-tournament-input"]').type('Torneio 2');
        cy.get('[data-testid="create-tournament-button"]').click();

        const players = ['Yugi', 'Kaiba', 'Joey', 'Mai', 'Tea', 'Bakura'];
        players.forEach(player => {
            cy.get('[data-testid="player-name-input"]').type(player);
            cy.get('[data-testid="add-player-button"]').click();
        });

        cy.get('[data-testid="start-tournament-button"]').click();

        cy.get('[data-testid="p1-win-button"]').each(($btn) => {
            cy.wrap($btn).click();
        });
        cy.get('[data-testid="next-round-button"]').click();

        cy.get('[data-testid="p1-win-button"]').each(($btn) => {
            cy.wrap($btn).click();
        });
        cy.get('[data-testid="next-round-button"]').click();

        cy.get('[data-testid="p1-win-button"]').each(($btn) => {
            cy.wrap($btn).click();
        });
        cy.get('[data-testid="next-round-button"]').click();

        cy.contains('Torneio Finalizado!');
        cy.get('[data-testid="standings-row"]').should('have.length', 6);
    });

});
