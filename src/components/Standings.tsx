import { Player, Round } from '@/types/tournament';
import Link from 'next/link';
import { sortPlayers, headToHeadWinner } from '@/lib/swiss';

interface StandingsProps {
    players: Player[];
    rounds: Round[];
}

export function Standings({ players, rounds }: StandingsProps) {
    const sortedPlayers = sortPlayers(players, rounds);

    return (
        <div className="overflow-hidden bg-white/5 rounded-xl border border-white/10">
            <table className="w-full text-left text-sm text-white">
                <thead className="bg-white/5 text-white/60 uppercase font-bold text-xs">
                    <tr>
                        <th className="px-6 py-3">#</th>
                        <th className="px-6 py-3">Duelista</th>
                        <th className="px-6 py-3 text-right">Pts</th>
                        <th className="px-6 py-3 text-right">
                            <Link href="/sobre-omw" className="hover:text-indigo-300 transition-colors">
                                <span className="border-b border-dashed border-white/40 cursor-help" title="Opponent Match Win % (Média de vitórias dos oponentes enfrentados). Principal desempate.">
                                    OMW%
                                </span>
                            </Link>
                        </th>
                        <th className="px-6 py-3 text-right">
                            <Link href="/sobre-omw" className="hover:text-purple-300 transition-colors">
                                <span className="border-b border-dashed border-white/40 cursor-help" title="Opponent's Opponent Match Win % (Média do OMW% dos oponentes). Último critério matemático de desempate.">
                                    OOMW%
                                </span>
                            </Link>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {sortedPlayers.map((player, index) => {
                        const isTiedScorePrev = index > 0 && sortedPlayers[index - 1].score === player.score;
                        const isTiedScoreNext = index < sortedPlayers.length - 1 && sortedPlayers[index + 1].score === player.score;
                        const isTiedScore = isTiedScorePrev || isTiedScoreNext;

                        const isTiedOmwPrev = isTiedScorePrev && sortedPlayers[index - 1].omw === player.omw;
                        const isTiedOmwNext = isTiedScoreNext && sortedPlayers[index + 1].omw === player.omw;
                        const isTiedOmw = isTiedOmwPrev || isTiedOmwNext;

                        const omwBrokeTie = isTiedScore && !isTiedOmw;
                        
                        // Verifica se este jogador ganhou do jogador logo abaixo dele no confronto direto
                        let wonH2H = false;
                        if (isTiedOmwNext) {
                            if (headToHeadWinner(player, sortedPlayers[index + 1], rounds) === -1) {
                                wonH2H = true;
                            }
                        }

                        return (
                            <tr key={player.id} data-testid="standings-row" className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-white/50">{index + 1}</td>
                                <td className="px-6 py-4 font-medium flex items-center gap-2">
                                    {player.name}
                                    {wonH2H && (
                                        <span className="text-[10px] uppercase font-bold text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded cursor-help" title="Venceu o confronto direto contra o oponente empatado.">H2H</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-indigo-400">{player.score}</td>
                                <td className="px-6 py-4 text-right">
                                    <span 
                                        className={`transition-colors ${omwBrokeTie ? 'text-yellow-400 font-bold bg-yellow-400/10 px-2 py-1 rounded cursor-help' : 'text-white/60'}`}
                                        title={omwBrokeTie ? "Posição garantida pelo OMW% superior." : ""}
                                    >
                                        {(player.omw * 100).toFixed(2)}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span 
                                        className={`transition-colors ${isTiedOmw ? 'text-purple-400 font-bold bg-purple-400/10 px-2 py-1 rounded cursor-help' : 'text-white/60'}`}
                                        title={isTiedOmw ? (wonH2H ? "Posição garantida primariamente por Confronto Direto." : "Posição alcançada por OOMW% ou Confronto Direto.") : ""}
                                    >
                                        {(player.oomw * 100).toFixed(2)}%
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {players.length === 0 && (
                <div className="p-8 text-center text-white/40">
                    Nenhum dado disponível
                </div>
            )}
        </div>
    );
}
