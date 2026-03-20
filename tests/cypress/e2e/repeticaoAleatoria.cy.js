describe('Fluxo do Torneio Yu-Gi-Oh!', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/');
    });

    it('não deve repetir jogadores mesmo com resultados de partida variados', () => {
        cy.get('[data-testid="new-tournament-input"]').type('Torneio Validacao Aleatoria');
        cy.get('[data-testid="create-tournament-button"]').click();

        const players = [
            'Yugi', 'Kaiba', 'Joey', 'Mai', 'Tea', 'Bakura',
            'Pegasus', 'Marik', 'Ishizu', 'Odion', 'Mokuba', 'Duke'
        ];
        players.forEach(player => {
            cy.get('[data-testid="player-name-input"]').type(player);
            cy.get('[data-testid="add-player-button"]').click();
        });

        cy.get('[data-testid="rounds-input"]').clear().type('6');
        cy.get('[data-testid="start-tournament-button"]').click();

        const playedMatches = [];

        for (let round = 1; round <= 6; round++) {
            cy.get('[data-testid="match-item"]').each(($match) => {
                cy.wrap($match).within(() => {
                    cy.get('[data-testid="player1-container"] span').invoke('text').then((p1) => {
                        cy.get('[data-testid="player2-container"] span').invoke('text').then((p2) => {
                            const pair = [p1, p2].sort().join('-vs-');
                            expect(playedMatches).to.not.include(pair);
                            playedMatches.push(pair);
                        });
                    });

                    cy.then(() => {
                        const rand = Math.random();
                        if (rand < 0.4) {
                            cy.get('[data-testid="p1-win-button"]').click();
                        } else if (rand < 0.8) {
                            cy.get('[data-testid="p2-win-button"]').click();
                        } else {
                            cy.get('[data-testid="double-loss-button"]').click();
                        }
                    });
                });
            });

            cy.get('[data-testid="next-round-button"]').click();
        }

        cy.contains('Torneio Finalizado!');
    });

});
