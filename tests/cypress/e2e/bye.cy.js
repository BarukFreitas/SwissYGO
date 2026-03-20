describe('Fluxo do Torneio Yu-Gi-Oh!', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/');
    });

    it('deve garantir que em uma partida ímpar, um jogador receba Bye', () => {
        cy.get('[data-testid="new-tournament-input"]').type('Torneio 1');
        cy.get('[data-testid="create-tournament-button"]').click();
        cy.get('[data-testid="player-name-input"]').type('Yugi');
        cy.get('[data-testid="add-player-button"]').click();
        cy.get('[data-testid="player-name-input"]').type('Kaiba');
        cy.get('[data-testid="add-player-button"]').click();
        cy.get('[data-testid="player-name-input"]').type('Joey');
        cy.get('[data-testid="add-player-button"]').click();
        cy.get('[data-testid="start-tournament-button"]').click();

        cy.get('[class*="border-green-500/30"]').should('contain.text', 'BYE');
    });

});
