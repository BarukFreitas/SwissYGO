'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TournamentService } from '@/services/storage';
import { Tournament } from '@/types/tournament';
import { useTournament } from '@/hooks/useTournament';

export default function Home() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const { createTournament } = useTournament('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setTournaments(TournamentService.getAll());
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const id = createTournament(newName);
    router.push(`/tournament/${id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este torneio?')) {
      TournamentService.delete(id);
      setTournaments(TournamentService.getAll());
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-4">
            SwissYGO
          </h1>
          <p className="text-gray-400 text-lg">Gerenciador de Torneios Yu-Gi-Oh!</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">

          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all">
            <h2 className="text-2xl font-bold mb-6">Novo Torneio</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Evento</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="Ex: Semanal de Domingo"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
              >
                Criar Torneio
              </button>
            </form>
          </div>


          <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6">Meus Torneios</h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {tournaments.length === 0 && (
                <p className="text-white/30 italic">Nenhum torneio encontrado.</p>
              )}
              {tournaments.map((t) => (
                <div
                  key={t.id}
                  onClick={() => router.push(`/tournament/${t.id}`)}
                  className="group flex justify-between items-center bg-black/20 p-4 rounded-lg cursor-pointer hover:bg-white/10 transition-colors border border-transparent hover:border-white/20"
                >
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">{t.name}</h3>
                    <div className="flex gap-3 text-xs text-white/40 mt-1">
                      <span>{new Date(t.date).toLocaleDateString()}</span>
                      <span className="uppercase tracking-wider">{t.status === 'IN_PROGRESS' ? 'Em andamento' : t.status === 'SETUP' ? 'Setup' : 'Finalizado'}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, t.id)}
                    className="p-2 text-white/20 hover:text-red-400 transition-all"
                    title="Excluir Torneio"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
