import { Player, Match, MatchResult, Tournament, Round } from '../types/tournament';


const POINTS_WIN = 3;
const POINTS_DRAW = 1;
const POINTS_LOSS = 0;


export function calculatePlayerScore(player: Player, rounds: Round[]): number {
    let score = 0;
    for (const round of rounds) {
        const match = round.matches.find(m => m.player1Id === player.id || m.player2Id === player.id);
        if (!match || !match.result) continue;

        if (match.result === 'DOUBLE_LOSS') {
            score += POINTS_LOSS;
        } else if (match.player2Id === 'BYE') {
            score += POINTS_WIN;
        } else if (match.result === 'DRAW') {
            score += POINTS_DRAW;
        } else if ((match.player1Id === player.id && match.result === 'P1_WIN') ||
            (match.player2Id === player.id && match.result === 'P2_WIN')) {
            score += POINTS_WIN;
        } else {
            score += POINTS_LOSS;
        }
    }
    return score;
}

export function calculateOMW(player: Player, allPlayers: Player[], rounds: Round[]): number {
    const opponentIds = new Set<string>();

    for (const round of rounds) {
        const match = round.matches.find(m => m.player1Id === player.id || m.player2Id === player.id);
        if (!match || match.player2Id === 'BYE') continue;

        const opponentId = match.player1Id === player.id ? match.player2Id : match.player1Id;
        if (opponentId !== 'BYE') opponentIds.add(opponentId);
    }

    if (opponentIds.size === 0) return 0;

    let totalOpponentWinPerc = 0;
    opponentIds.forEach(oppId => {
        const opponent = allPlayers.find(p => p.id === oppId);
        if (opponent) {
            // Calculate opponent's win percentage
            const maxPoints = rounds.length * 3;
            const winDeps = maxPoints > 0 ? opponent.score / maxPoints : 0;

            totalOpponentWinPerc += winDeps;
        }
    });

    return totalOpponentWinPerc / opponentIds.size;
}

export function calculateOOMW(player: Player, allPlayers: Player[], rounds: Round[]): number {
    const opponentIds = new Set<string>();

    for (const round of rounds) {
        const match = round.matches.find(m => m.player1Id === player.id || m.player2Id === player.id);
        if (!match || match.player2Id === 'BYE') continue;

        const opponentId = match.player1Id === player.id ? match.player2Id : match.player1Id;
        if (opponentId !== 'BYE') opponentIds.add(opponentId);
    }

    if (opponentIds.size === 0) return 0;

    let totalOOMW = 0;
    opponentIds.forEach(oppId => {
        const opponent = allPlayers.find(p => p.id === oppId);
        if (opponent) {
            totalOOMW += opponent.omw;
        }
    });

    return totalOOMW / opponentIds.size;
}

export function headToHeadWinner(playerA: Player, playerB: Player, rounds: Round[]): number {
    for (const round of rounds) {
        const match = round.matches.find(
            m => (m.player1Id === playerA.id && m.player2Id === playerB.id) || 
                 (m.player1Id === playerB.id && m.player2Id === playerA.id)
        );
        
        if (match && match.result) {
            if (match.result === 'DRAW' || match.result === 'DOUBLE_LOSS') continue;
            
            const aIsP1 = match.player1Id === playerA.id;
            const winnerIsP1 = match.result === 'P1_WIN';
            
            if (aIsP1 === winnerIsP1) return -1; 
            else return 1; 
        }
    }
    return 0;
}

export function sortPlayers(players: Player[], rounds: Round[]): Player[] {
    return [...players].sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        if (a.omw !== b.omw) return b.omw - a.omw;
        
        const h2h = headToHeadWinner(a, b, rounds);
        if (h2h !== 0) return h2h;

        if (a.oomw !== b.oomw) return b.oomw - a.oomw;

        return 0;
    });
}

export function generatePairings(tournament: Tournament): Round {
    const players = sortPlayers(tournament.players, tournament.rounds);

    const matches: Match[] = [];
    const nextRoundNum = tournament.currentRound + 1;
    let tableCounter = 1;

    const hasPlayed = (id1: string, id2: string) => {
        return tournament.rounds.some(r =>
            r.matches.some(m =>
                (m.player1Id === id1 && m.player2Id === id2) ||
                (m.player1Id === id2 && m.player2Id === id1)
            )
        );
    };

    function solvePairings(currentPool: Player[]): Match[] | null {
        if (currentPool.length === 0) return [];

        const p1 = currentPool[0];

        for (let i = 1; i < currentPool.length; i++) {
            const p2 = currentPool[i];

            if (!hasPlayed(p1.id, p2.id)) {
                const nextPool = [...currentPool];
                nextPool.splice(i, 1);
                nextPool.splice(0, 1);

                const remainingMatches = solvePairings(nextPool);
                if (remainingMatches !== null) {
                    return [{
                        id: crypto.randomUUID(),
                        table: 0,
                        player1Id: p1.id,
                        player2Id: p2.id,
                        round: nextRoundNum
                    }, ...remainingMatches];
                }
            }
        }
        return null;
    }

    let pairedMatches: Match[] | null = null;
    let finalByePlayerId: string | null = null;

    if (players.length % 2 !== 0) {
        for (let byeIndex = players.length - 1; byeIndex >= 0; byeIndex--) {
            if (players[byeIndex].hasBye) continue;

            const testPool = [...players];
            testPool.splice(byeIndex, 1);

            pairedMatches = solvePairings(testPool);
            if (pairedMatches !== null) {
                finalByePlayerId = players[byeIndex].id;
                break;
            }
        }

        if (pairedMatches === null) {
            for (let byeIndex = players.length - 1; byeIndex >= 0; byeIndex--) {
                const testPool = [...players];
                testPool.splice(byeIndex, 1);

                pairedMatches = solvePairings(testPool);
                if (pairedMatches !== null) {
                    finalByePlayerId = players[byeIndex].id;
                    break;
                }
            }
        }
    } else {
        pairedMatches = solvePairings([...players]);
    }

    if (pairedMatches === null) {
        console.warn("Could not find strict non-repeat pairings. Falling back to greedy with repeat minimization.");
        pairedMatches = [];
        const fallbackPool = [...players];

        if (fallbackPool.length % 2 !== 0) {
            let byeIndex = fallbackPool.length - 1;
            while (byeIndex >= 0 && fallbackPool[byeIndex].hasBye) byeIndex--;
            if (byeIndex < 0) byeIndex = fallbackPool.length - 1;
            
            finalByePlayerId = fallbackPool[byeIndex].id;
            fallbackPool.splice(byeIndex, 1);
        }

        while (fallbackPool.length > 0) {
            const p1 = fallbackPool.shift()!;
            let p2Index = fallbackPool.findIndex(p => !hasPlayed(p1.id, p.id));
            if (p2Index === -1) p2Index = 0; 

            const p2 = fallbackPool.splice(p2Index, 1)[0];
            pairedMatches.push({
                id: crypto.randomUUID(),
                table: 0,
                player1Id: p1.id,
                player2Id: p2.id,
                round: nextRoundNum
            });
        }
    }

    if (finalByePlayerId) {
        matches.push({
            id: crypto.randomUUID(),
            table: 0,
            player1Id: finalByePlayerId,
            player2Id: 'BYE',
            result: 'P1_WIN',
            round: nextRoundNum
        });
    }

    pairedMatches.forEach((m, index) => {
        m.table = tableCounter + index;
    });

    matches.push(...pairedMatches);

    return {
        number: nextRoundNum,
        matches
    };
}
