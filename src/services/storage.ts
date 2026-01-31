import { Tournament } from '../types/tournament';

const STORAGE_KEY = 'swissygo_tournaments';

export const TournamentService = {
    getAll: (): Tournament[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    getById: (id: string): Tournament | undefined => {
        const list = TournamentService.getAll();
        return list.find(t => t.id === id);
    },

    save: (tournament: Tournament) => {
        if (typeof window === 'undefined') return;
        const list = TournamentService.getAll();
        const index = list.findIndex(t => t.id === tournament.id);

        if (index >= 0) {
            list[index] = tournament;
        } else {
            list.push(tournament);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    },

    delete: (id: string) => {
        if (typeof window === 'undefined') return;
        const list = TournamentService.getAll();
        const newList = list.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    }
};
