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

export function generatePairings(tournament: Tournament): Round {
    // 1. Sort players: Score (Desc) -> OMW (Desc)
    // We create a shallow copy to avoid mutating the original array during sorting if it's used elsewhere,
    // though here it's just local.
    const players = [...tournament.players].sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return b.omw - a.omw;
    });

    const matches: Match[] = [];
    const nextRoundNum = tournament.currentRound + 1;
    let tableCounter = 1;

    // Helper to check if two players have already played
    const hasPlayed = (id1: string, id2: string) => {
        return tournament.rounds.some(r =>
            r.matches.some(m =>
                (m.player1Id === id1 && m.player2Id === id2) ||
                (m.player1Id === id2 && m.player2Id === id1)
            )
        );
    };

    // 2. Handle Bye if odd number of players
    // Strict rule: Bye goes to the lowest ranked player who hasn't had one.
    if (players.length % 2 !== 0) {
        let byeIndex = players.length - 1;
        // Find lowest ranked player who hasn't had a bye
        while (byeIndex >= 0 && players[byeIndex].hasBye) {
            byeIndex--;
        }
        // If everyone has had a bye (rare), fallback to lowest ranked
        if (byeIndex < 0) {
            byeIndex = players.length - 1;
        }

        const byePlayer = players[byeIndex];
        matches.push({
            id: crypto.randomUUID(),
            table: 0, // 0 usually denotes special/no table
            player1Id: byePlayer.id,
            player2Id: 'BYE',
            result: 'P1_WIN', // Auto-win for bye
            round: nextRoundNum
        });
        // Remove bye player from pooling
        players.splice(byeIndex, 1);
    }

    // 3. Backtracking Algorithm for Pairings
    // We need to pair the remaining 'players' list.
    // 'players' is already sorted by Score -> OMW.

    function solvePairings(currentPool: Player[]): Match[] | null {
        if (currentPool.length === 0) {
            return [];
        }

        // Try to pair the top player (P1)
        const p1 = currentPool[0];

        // Try to find a valid P2 from the rest of the pool
        for (let i = 1; i < currentPool.length; i++) {
            const p2 = currentPool[i];

            // Constraint: No repeat matchups
            if (!hasPlayed(p1.id, p2.id)) {
                // Tentative pair found.
                // Create the remainder pool
                const nextPool = [...currentPool];
                // Remove p1 (index 0) and p2 (index i)
                // Note: removing index i first if i > 0 is safe, but we must be careful with indices.
                // Easier: filter out by ID, but that's O(N).
                // Since N is small (usually < 100), splicing is fine.
                nextPool.splice(i, 1); // Remove p2
                nextPool.splice(0, 1); // Remove p1

                // Recurse
                const remainingMatches = solvePairings(nextPool);
                if (remainingMatches !== null) {
                    // Valid solution found down this path
                    const currentMatch: Match = {
                        id: crypto.randomUUID(),
                        table: 0, // Will assign table numbers later
                        player1Id: p1.id,
                        player2Id: p2.id,
                        round: nextRoundNum
                    };
                    return [currentMatch, ...remainingMatches];
                }
                // Backtrack: this p2 didn't lead to a full solution
            }
        }

        // If we reach here, we couldn't find a valid p2 for p1 that leads to a full solution.
        return null;
    }

    let pairedMatches = solvePairings([...players]);

    // Fallback: If strict pairing fails (impossible constraints), relax "hasPlayed" check?
    // Or just fallback to a simple greedy pair by score (ignoring repeats) if absolutely necessary?
    // User requirement: "não podem jogar contra quem já jogaram anteriormente".
    // If it returns null, it means strictly impossible. 
    // Usually in Swiss we then try to swap pairs in previous groups, but that's complex.
    // For now, if null, we might try a relaxed version or just greedy with repeats allowed (worst case).
    if (!pairedMatches) {
        console.warn("Could not find strict non-repeat pairings. Falling back to greedy with repeats.");
        // Fallback: Just pair top-down, allowing repeats if necessary
        pairedMatches = [];
        const fallbackPool = [...players];
        while (fallbackPool.length > 0) {
            const p1 = fallbackPool.shift()!;
            const p2 = fallbackPool.shift()!;
            pairedMatches.push({
                id: crypto.randomUUID(),
                table: 0,
                player1Id: p1.id,
                player2Id: p2.id,
                round: nextRoundNum
            });
        }
    }

    // Assign table numbers
    pairedMatches.forEach((m, index) => {
        m.table = tableCounter + index;
    });

    matches.push(...pairedMatches);

    return {
        number: nextRoundNum,
        matches
    };
}
