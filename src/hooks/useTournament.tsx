import { useState, useEffect } from 'react';
import { Tournament, Player, MatchResult } from '../types/tournament';
import { TournamentService } from '../services/storage';
import { generatePairings, calculatePlayerScore, calculateOMW, calculateOOMW } from '../lib/swiss';

export function useTournament(tournamentId: string) {
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tournamentId) {
            const data = TournamentService.getById(tournamentId);
            setTournament(data || null);
            setLoading(false);
        }
    }, [tournamentId]);

    const saveTournament = (updated: Tournament) => {
        TournamentService.save(updated);
        setTournament(updated);
    };

    const addPlayer = (name: string): boolean => {
        if (!tournament) return false;

        const nameExists = tournament.players.some(
            p => p.name.trim().toLowerCase() === name.trim().toLowerCase()
        );

        if (nameExists) {
            alert('Jogador já cadastrado!');
            return false;
        }

        const newPlayer: Player = {
            id: crypto.randomUUID(),
            name: name.trim(),
            matches: [],
            score: 0,
            omw: 0,
            oomw: 0,
            hasBye: false
        };

        const updated = {
            ...tournament,
            players: [...tournament.players, newPlayer]
        };
        saveTournament(updated);
        return true;
    };

    const removePlayer = (playerId: string) => {
        if (!tournament) return;
        const updated = {
            ...tournament,
            players: tournament.players.filter(p => p.id !== playerId)
        };
        saveTournament(updated);
    };

    const startTournament = (totalRounds: number) => {
        if (!tournament) return;
        const shuffledPlayers = [...tournament.players].sort(() => Math.random() - 0.5);
        const randomizedTournament = { ...tournament, players: shuffledPlayers };

        const firstRound = generatePairings(randomizedTournament);

        const updated: Tournament = {
            ...randomizedTournament,
            status: 'IN_PROGRESS',
            currentRound: 1,
            totalRounds,
            rounds: [firstRound]
        };
        saveTournament(updated);
    };

    const submitMatchResult = (matchId: string, result: MatchResult) => {
        if (!tournament) return;

        const rounds = [...tournament.rounds];
        const currentRound = rounds[rounds.length - 1];
        const matchIndex = currentRound.matches.findIndex(m => m.id === matchId);

        if (matchIndex === -1) return;

        currentRound.matches[matchIndex].result = result;

        saveTournament({ ...tournament, rounds });
    };

    const nextRound = () => {
        if (!tournament) return;

        const currentRoundData = tournament.rounds.find(r => r.number === tournament.currentRound);
        if (currentRoundData) {
            const hasUnfinishedMatches = currentRoundData.matches.some(m => !m.result);
            if (hasUnfinishedMatches) {
                alert('Todos os jogos precisam ter um resultado antes de prosseguir.');
                return;
            }
        }

        const updatedPlayers = tournament.players.map(p => {
            const score = calculatePlayerScore(p, tournament.rounds);
            const hasBye = tournament.rounds.some(r =>
                r.matches.some(m =>
                    (m.player1Id === p.id && m.player2Id === 'BYE') ||
                    (m.player2Id === p.id && m.player1Id === 'BYE')
                )
            );
            return { ...p, score, hasBye };
        });

        const finalPlayers = updatedPlayers.map(p => {
            const omw = calculateOMW(p, updatedPlayers, tournament.rounds);
            return { ...p, omw };
        });

        // Calculamos OOMW após obtermos todos os OMW
        const withOomwPlayers = finalPlayers.map(p => {
            const oomw = calculateOOMW(p, finalPlayers, tournament.rounds);
            return { ...p, oomw };
        });

        const updatedTourney = { ...tournament, players: withOomwPlayers };

        if (tournament.currentRound >= tournament.totalRounds) {
            const finishedTourney = { ...updatedTourney, status: 'FINISHED' as const };
            saveTournament(finishedTourney);
            return;
        }

        const nextRound = generatePairings(updatedTourney);

        saveTournament({
            ...updatedTourney,
            currentRound: updatedTourney.currentRound + 1,
            rounds: [...updatedTourney.rounds, nextRound]
        });
    };

    const createTournament = (name: string) => {
        const newTournament: Tournament = {
            id: crypto.randomUUID(),
            name,
            date: new Date().toISOString(),
            status: 'SETUP',
            currentRound: 0,
            totalRounds: 0,
            players: [],
            rounds: []
        };
        TournamentService.save(newTournament);
        setTournament(newTournament);
        return newTournament.id;
    };

    return {
        tournament,
        loading,
        createTournament,
        addPlayer,
        removePlayer,
        startTournament,
        submitMatchResult,
        nextRound
    };
}

