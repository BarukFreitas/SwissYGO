describe('Teste de Desempate OOMW (Mock Determinístico)', () => {
    it('deve exibir o badge roxo de OOMW% quando há empate de OMW% num cenário realista e ordenar corretamente', () => {
        const mockTournament = {
            id: 'mock-abc-123',
            name: 'Torneio Força OOMW Realista',
            date: new Date().toISOString(),
            status: 'FINISHED',
            currentRound: 3,
            totalRounds: 3,
            players: [
                { id: '1', name: 'Yugi', score: 6, omw: 0.70, oomw: 0.80, hasBye: false, matches: [] },
                { id: '2', name: 'Kaiba', score: 6, omw: 0.70, oomw: 0.50, hasBye: false, matches: [] },
                { id: '3', name: 'Joey', score: 3, omw: 0.40, oomw: 0.30, hasBye: false, matches: [] }
            ],
            rounds: [
                {
                    number: 1,
                    matches: [
                        { id: 'm1', player1Id: '1', player2Id: '2', result: 'DOUBLE_LOSS', round: 1 }
                    ]
                }
            ]
        };

        cy.visit('http://localhost:3000/', {
            onBeforeLoad(win) {
                win.localStorage.setItem('swissygo_tournaments', JSON.stringify([mockTournament]));
            }
        });

        cy.contains('Torneio Força OOMW Realista').click();

        cy.contains('Torneio Finalizado!');

        cy.get('[data-testid="standings-row"]').eq(0).should('contain', 'Yugi');
        cy.get('[data-testid="standings-row"]').eq(1).should('contain', 'Kaiba');

        cy.get('[data-testid="standings-row"]').eq(0).find('.bg-purple-400\\/10').should('exist');
        cy.get('[data-testid="standings-row"]').eq(1).find('.bg-purple-400\\/10').should('exist');
    });
});
