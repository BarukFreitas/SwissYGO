export type MatchResult = 'P1_WIN' | 'P2_WIN' | 'DRAW' | 'DOUBLE_LOSS';

export interface Player {
    id: string;
    name: string;
    matches: string[];
    score: number;
    omw: number;
    oomw: number;
    hasBye: boolean;
}

export interface Match {
    id: string;
    table: number;
    player1Id: string;
    player2Id: string | 'BYE';
    result?: MatchResult;
    round: number;
}

export interface Round {
    number: number;
    matches: Match[];
}

export interface Tournament {
    id: string;
    name: string;
    date: string;
    status: 'SETUP' | 'IN_PROGRESS' | 'FINISHED';
    currentRound: number;
    totalRounds: number;
    players: Player[];
    rounds: Round[];
}
