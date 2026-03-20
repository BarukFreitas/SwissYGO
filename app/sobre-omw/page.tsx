import Link from 'next/link';

export default function SobreOMW() {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-8 overflow-x-hidden max-w-full">
            <div className="max-w-3xl mx-auto w-full animate-in fade-in duration-700">
                <header className="mb-8">
                    <Link
                        href="/"
                        className="text-white/40 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors"
                    >
                        ← Voltar para o início
                    </Link>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">
                        Regras de Desempate
                    </h1>
                    <p className="text-xl text-white/60">
                        Entenda como o SwissYGO determina a hierarquia das posições quando os pontos empatam.
                    </p>
                </header>

                <div className="space-y-8 bg-white/5 p-8 rounded-2xl border border-white/10 text-gray-300">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">A Hierarquia de Classificação</h2>
                        <p>
                            Sempre que dois ou mais jogadores terminam um torneio suíço empatados, o sistema utiliza critérios matemáticos rigorosos para definir quem fica na frente. Seguimos os padrões oficiais de TCGs em uma cascata de 4 fatores:
                        </p>
                        <ol className="list-decimal list-inside space-y-4 bg-black/20 p-6 rounded-xl text-sm marker:text-indigo-400 marker:font-bold">
                            <li>
                                <strong className="text-white text-base">Pontos (Pts):</strong> Cada Vitória vale 3 pontos, Empate vale 1 ponto e Derrota vale 0 pontos. É o fator principal.
                            </li>
                            <li className="pt-2 border-t border-white/5">
                                <strong className="text-white text-base">OMW% (Opponent Match Win %):</strong> O primeiro critério de desempate. Calcula-se a média de vitórias de <em>todos os oponentes</em> que você enfrentou. Quem enfrentou oponentes que venceram mais partidas nas outras mesas tem o <strong>caminho mais difícil</strong> (força do calendário maior) e, portanto, fica na frente no desempate.
                            </li>
                            <li className="pt-2 border-t border-white/5">
                                <strong className="text-white text-base">Confronto Direto (Head-to-Head):</strong> Se ambos os jogadores tiverem exatamente o mesmo OMW% e tiverem jogado um contra o outro no torneio, o vencedor daquela partida fica na frente.
                            </li>
                            <li className="pt-2 border-t border-white/5">
                                <strong className="text-white text-base">OOMW% (Opponent's Opponent Match Win %):</strong> Se os jogadores não se enfrentaram (ou se empataram a partida), usamos a média do OMW% dos oponentes. Aqui a matemática vai um nível mais fundo, verificando quão fortes eram os <em>oponentes dos oponentes</em>.
                            </li>
                        </ol>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">Como identificar na Tabela?</h2>
                        <p>
                            Na tela de Classificação Final, nós colorimos magicamente os números responsáveis pelo desempate para você não ter que cruzar dados mentalmente:
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <span className="text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded">OMW%</span>
                                <span>Quando iluminado em amarelo, significa que a posição foi ganha por este jogador ter enfrentado oponentes mais fortes.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-purple-400 font-bold bg-purple-400/10 px-3 py-1 rounded">OOMW%</span>
                                <span>Quando iluminado em roxo, significa que o OMW% coincidiu perfeitamente e o desempate caiu para o Confronto Direto ou OOMW%.</span>
                            </li>
                        </ul>
                    </section>
                </div>
                
                <div className="mt-8 text-center text-sm text-white/40">
                    O SwissYGO utiliza os padrões convencionais de pareamento suíço para garantir um ecossistema competitivo justo.
                </div>
            </div>
        </div>
    );
}
