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
    const players = [...tournament.players].sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        return b.omw - a.omw;
    });

    const usedPlayers = new Set<string>();
    const matches: Match[] = [];
    const nextRoundNum = tournament.currentRound + 1;
    let tableCounter = 1;

    if (players.length % 2 !== 0) {
        let byeCandidateIndex = players.length - 1;
        while (byeCandidateIndex >= 0 && players[byeCandidateIndex].hasBye) {
            byeCandidateIndex--;
        }

        if (byeCandidateIndex < 0) byeCandidateIndex = players.length - 1;

        const byePlayer = players[byeCandidateIndex];
        matches.push({
            id: crypto.randomUUID(),
            table: 0,
            player1Id: byePlayer.id,
            player2Id: 'BYE',
            result: 'P1_WIN',
            round: nextRoundNum
        });
        usedPlayers.add(byePlayer.id);
    }

    const pairablePlayers = players.filter(p => !usedPlayers.has(p.id));



    while (pairablePlayers.length > 0) {
        const p1 = pairablePlayers.shift();
        if (!p1) break;

        let p2Index = 0;
        let p2 = pairablePlayers[p2Index];





        const hasPlayed = (id1: string, id2: string) => {
            return tournament.rounds.some(r =>
                r.matches.some(m =>
                    (m.player1Id === id1 && m.player2Id === id2) ||
                    (m.player1Id === id2 && m.player2Id === id1)
                )
            );
        };

        while (p2 && hasPlayed(p1.id, p2.id)) {
            p2Index++;
            p2 = pairablePlayers[p2Index];
        }


        if (!p2) {
            p2 = pairablePlayers[0];
            p2Index = 0;
        }

        // Remove p2 from array
        pairablePlayers.splice(p2Index, 1);

        matches.push({
            id: crypto.randomUUID(),
            table: tableCounter++,
            player1Id: p1.id,
            player2Id: p2.id,
            round: nextRoundNum
        });
    }

    return {
        number: nextRoundNum,
        matches
    };
}
