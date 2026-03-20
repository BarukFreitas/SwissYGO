'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTournament } from '@/hooks/useTournament';
import { PlayerList } from '@/components/PlayerList';
import { Pairings } from '@/components/Pairings';
import { Standings } from '@/components/Standings';


function TournamentContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const router = useRouter();
    const {
        tournament,
        loading,
        addPlayer,
        removePlayer,
        startTournament,
        submitMatchResult,
        nextRound
    } = useTournament(id || '');

    const [activeTab, setActiveTab] = useState<'pairings' | 'standings'>('pairings');
    const [rounds, setRounds] = useState(3);

    const getRecommendedRounds = (count: number) => {
        if (count >= 4 && count <= 8) return 3;
        if (count >= 9 && count <= 16) return 4;
        if (count >= 17 && count <= 32) return 5;
        if (count >= 33 && count <= 64) return 6;
        if (count >= 65 && count <= 128) return 7;
        if (count > 128) return 8;
        return 3;
    }

    const recommendedRounds = tournament ? getRecommendedRounds(tournament.players.length) : 3;

    useEffect(() => {
        if (!tournament) return;
        setRounds(recommendedRounds);
    }, [tournament?.players.length]);

    if (!id) return <div className="text-white p-8">ID do torneio não fornecido.</div>;
    if (loading) return <div className="text-white p-8">Carregando...</div>;
    if (!tournament) return <div className="text-white p-8">Torneio não encontrado.</div>;



    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 overflow-x-hidden max-w-full">
            <div className="max-w-6xl mx-auto w-full">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <button
                            data-testid="back-button"
                            onClick={() => router.push('/')}
                            className="text-white/40 hover:text-white text-sm mb-2 flex items-center gap-1 transition-colors"
                        >
                            ← Voltar
                        </button>
                        <h1 className="text-3xl font-bold">{tournament.name}</h1>
                        <div className="flex gap-4 mt-2 text-sm text-gray-400">
                            <span>Rodada {tournament.currentRound} de {tournament.totalRounds}</span>
                            <span>{tournament.players.length} Jogadores</span>
                            <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-xs uppercase self-center bg-opacity-20 border border-indigo-500/30">
                                {tournament.status === 'SETUP' ? 'Preparação' : tournament.status === 'FINISHED' ? 'Finalizado' : 'Em Andamento'}
                            </span>
                        </div>
                    </div>

                    {tournament.status === 'IN_PROGRESS' && (
                        <button
                            data-testid="next-round-button"
                            onClick={nextRound}
                            disabled={!tournament.rounds.find(r => r.number === tournament.currentRound)?.matches.every(m => m.result)}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-900/20 transition-all hover:scale-105"
                            title={!tournament.rounds.find(r => r.number === tournament.currentRound)?.matches.every(m => m.result) ? "Preencha todos os resultados" : ""}
                        >
                            {tournament.currentRound >= tournament.totalRounds ? 'Finalizar Torneio' : 'Próxima Rodada →'}
                        </button>
                    )}
                </header>

                {tournament.status === 'SETUP' ? (
                    <div className="grid md:grid-cols-2 gap-8 w-full max-w-[92vw] md:max-w-full mx-auto">
                        <div>
                            <PlayerList
                                players={tournament.players}
                                onAdd={addPlayer}
                                onRemove={removePlayer}
                            />
                        </div>
                        <div className="flex flex-col gap-6 ">
                            <div className="text-white/30 text-center p-8 border border-dashed border-white/10 rounded-xl bg-white/5">
                                <p>Adicione pelo menos 2 jogadores para iniciar.</p>
                                <p className="text-sm mt-2">O sistema fará o chaveamento automático.</p>
                            </div>

                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                <h3 className="text-lg font-bold mb-4">Configuração do Torneio</h3>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Número de Rodadas
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <input
                                            data-testid="rounds-input"
                                            type="number"
                                            min="2"
                                            max="10"
                                            value={rounds}
                                            onChange={(e) => setRounds(parseInt(e.target.value))}
                                            className="w-full sm:w-24 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                                        />
                                        <button
                                            data-testid="start-tournament-button"
                                            onClick={() => startTournament(rounds)}
                                            disabled={tournament.players.length < 2}
                                            className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all hover:scale-105"
                                        >
                                            Começar Torneio
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : tournament.status === 'FINISHED' ? (
                    <div className="animate-in fade-in duration-700">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
                                Torneio Finalizado!
                            </h2>
                            <p className="text-white/60">Confira a classificação final abaixo</p>
                        </div>

                        <div className="my-8">
                            <Standings players={tournament.players} />
                        </div>

                        <div className="flex justify-center">
                            <button
                                data-testid="return-home-button"
                                onClick={() => router.push('/')}
                                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-medium transition-all"
                            >
                                Voltar ao Menu
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit mb-6">
                            <button
                                data-testid="pairings-tab"
                                onClick={() => setActiveTab('pairings')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'pairings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                Pareamentos
                            </button>
                            <button
                                data-testid="standings-tab"
                                onClick={() => setActiveTab('standings')}
                                className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'standings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                            >
                                Classificação
                            </button>
                        </div>

                        {activeTab === 'pairings' && tournament.rounds.length > 0 && (
                            <div className="space-y-8">
                                <Pairings
                                    round={tournament.rounds[tournament.rounds.length - 1]}
                                    players={tournament.players}
                                    onSubmitResult={submitMatchResult}
                                    isCurrentRound={true}
                                />
                            </div>
                        )}

                        {activeTab === 'standings' && (
                            <Standings players={tournament.players} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TournamentPage() {
    return (
        <Suspense fallback={<div className="text-white p-8">Carregando...</div>}>
            <TournamentContent />
        </Suspense>
    );
}
