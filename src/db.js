import Dexie from "dexie";
import { v4 as uuidv4 } from "uuid";

export const db = new Dexie("fast-inning-baseball");
db.version(5).stores({
  leagues: 'leagueId, name',
  seasons: 'seasonId, leagueId, year',
  teams: 'teamId, seasonId, [seasonId+teamId]',
  players: 'playerId, draftDate, seasonId, [playerId+seasonId], [seasonId+draftDate]',
  prospects: 'prospectId',
  generalManagers: 'generalManagerId',
});
db.on("populate", (transaction) => {

  // Use provided transaction to populate database with initial data
  // tx.table('users').add({id: "me", name: "Me"});
  // transaction.teams.add({
  //   teamId: 'e1457930-9ec3-4007-8581-bc02e4b0a5a2',
  //   year: 2024,
  //   abbreviation: 'MEN',
  //   city: 'Anywhere',
  //   mascot: 'Men',
  //   color: '#0000ff',
  //   textColor: '#ffffff'
  // });

  //transaction.players.add({ firstName: '', lastName: 'Kate', position: 'F', teamId: '2aa7beeb-32c3-477f-b85f-5e5394a46830', playerId: uuidv4() });
});
db.open
