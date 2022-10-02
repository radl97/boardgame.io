import { InitializeGame } from '../core/initialize';
import type { Server, State, Game } from '../types';

/**
 * Creates a new match metadata object.
 */
export const createMetadata = ({
  game,
  unlisted,
  setupData,
  numPlayers,
  botCredentials,
}: {
  game: Game;
  numPlayers: number;
  setupData?: any;
  unlisted?: boolean;
  botCredentials?: string;
}): Server.MatchData => {
  const metadata: Server.MatchData = {
    gameName: game.name,
    unlisted: !!unlisted,
    players: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  if (setupData !== undefined) metadata.setupData = setupData;

  for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
    metadata.players[playerIndex] = { id: playerIndex };
  }

  if (botCredentials === undefined) {
    // TODO make "which players are bots" more versatile
    for (var i = 1; i < numPlayers; i++) {
      const id = i+"";
      metadata.players[id].name = 'Bot';
      metadata.players[id].credentials = botCredentials;
      metadata.players[id].isConnected = true;
    }
  }

  return metadata;
};

/**
 * Creates initial state and metadata for a new match.
 * If the provided `setupData` doesn’t pass the game’s validation,
 * an error object is returned instead.
 */
export const createMatch = ({
  game,
  numPlayers,
  setupData,
  unlisted,
  botCredentials
}: {
  game: Game;
  numPlayers: number;
  setupData: any;
  unlisted: boolean;
  botCredentials?: string;
}):
  | { metadata: Server.MatchData; initialState: State }
  | { setupDataError: string } => {
  if (!numPlayers || typeof numPlayers !== 'number') numPlayers = 2;

  const setupDataError =
    game.validateSetupData && game.validateSetupData(setupData, numPlayers);
  if (setupDataError !== undefined) return { setupDataError };

  const metadata = createMetadata({ game, numPlayers, setupData, unlisted, botCredentials });
  const initialState = InitializeGame({ game, numPlayers, setupData });

  return { metadata, initialState };
};

/**
 * Given players, returns the count of players.
 */
export const getNumPlayers = (players: Server.MatchData['players']): number =>
  Object.keys(players).length;

/**
 * Given players, tries to find the ID of the first player that can be joined.
 * Returns `undefined` if there’s no available ID.
 */
export const getFirstAvailablePlayerID = (
  players: Server.MatchData['players']
): string | undefined => {
  const numPlayers = getNumPlayers(players);
  // Try to get the first index available
  for (let i = 0; i < numPlayers; i++) {
    if (typeof players[i].name === 'undefined' || players[i].name === null) {
      return String(i);
    }
  }
};
