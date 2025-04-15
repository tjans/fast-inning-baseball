import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

// store
import useAppStore from "src/stores/useAppStore";

// foundation
import usePageTitle from 'src/hooks/usePageTitle'
import ContentWrapper from "src/components/ContentWrapper";

// services
import leagueService from "src/services/LeagueService";
import leagueFacade from "src/facades/LeagueFacade";
import playerService from "src/services/PlayerService";
import teamService from "src/services/TeamService";

// misc
import { toast } from "react-toastify";

export default function Draft() {
  usePageTitle("League Draft");

  const { leagueId } = useParams();
  const [league, setLeague] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState("Offense");
  const [recentDraftees, setRecentDraftees] = useState([]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    load();
  }, [selectedPosition])

  const handleSelectTeam = (team) => async (e) => {
    e.preventDefault();

    let players = await teamService.getPlayers(league.currentSeason.seasonId, team.teamId);

    let positions = {};
    players.map(player => {
      let position = player.position;
      if (['SP', 'RP', 'CL'].includes(player.position)) {
        position = 'P';
      }
      positions[position] = (positions[position] || 0) + 1;
    })

    setSelectedTeam({ ...team, positions });
  }

  const handleSelectPosition = (selected) => async (e) => {
    e.preventDefault();
    setSelectedPosition(selected);

  }

  const handleDraftPlayer = (playerId) => async (e) => {
    e.preventDefault();

    if (selectedTeam) {
      const seasonId = league.currentSeason.seasonId;

      let seasonPlayer = await playerService.getSeasonPlayer(seasonId, playerId);

      seasonPlayer.teamId = selectedTeam.teamId;
      seasonPlayer.draftDate = new Date();
      await playerService.saveSeasonPlayer(seasonPlayer);
      toast.success("Player successfully drafted!")
      setSelectedTeam(null);
      load();
    }
  }

  const isOffense = () => ['1B', '2B', '3B', 'SS', 'DH', 'OF', 'C', 'Offense'].includes(selectedPosition);
  const isPitcher = () => ['SP', 'RP', 'CL', 'Pitchers'].includes(selectedPosition);

  const load = async () => {
    const league = await leagueService.getLeague(leagueId);

    if (league) {
      setLeague(league);

      const teams = await teamService.getSeasonTeams(league.currentSeason.seasonId, (a, b) => a.draftPosition?.localeCompare(b?.draftPosition));
      setTeams(teams)

      const availablePlayers = await leagueFacade.getUndraftedPlayers(league.currentSeason.seasonId, selectedPosition);
      setAvailablePlayers(availablePlayers);

      const recentDraftees = await playerService.getRecentlyDraftedPlayers(league.currentSeason.seasonId, 3);
      setRecentDraftees(recentDraftees);
    }
  }

  const undo = async (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to undo the last pick?")) {
      if (recentDraftees.length > 0) {
        const draftee = recentDraftees[0];
        draftee.player.teamId = null;
        draftee.player.draftDate = null;
        await playerService.saveSeasonPlayer(draftee.player);
        setRecentDraftees(recentDraftees.slice(1));
        setSelectedTeam(null);
        toast.success("Player successfully undrafted!")
        load();
      }
    }
  }

  return (
    <>
      <ContentWrapper align="start">

        {league && (
          <div className="text-2xl font-bold text-black">{league.name} - Year {league.currentSeason.year}</div>
        )}

        <div className="flex flex-col w-full md:flex-row">
          <div className="w-full md:w-4/12">

            {teams && teams.length > 0 && (
              <div className="mt-4">
                <ol>
                  {teams.map((team, idx) => (
                    <li key={team.teamId} className="my-2"> {idx + 1}.{" "}
                      <a href="#" onClick={handleSelectTeam(team)} className={"underline" + (selectedTeam?.teamId === team.teamId ? " font-bold text-blue-500" : "")}>
                        {team.city}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {recentDraftees?.length > 0 &&
              <div className="mt-4">
                <hr />
                <div className="mt-3 font-bold">Last 3 Picks - <a href="#" onClick={undo}>Undo</a></div>
                {recentDraftees?.length > 0 &&
                  recentDraftees.map((item) => {
                    return <div key={item.player.playerId} className="my-2 text-sm">
                      <span className="">
                        {item.player.position} - {item.player.firstName} {item.player.lastName}, {item.team.abbreviation}
                      </span>
                    </div>
                  })
                }
                <hr />
              </div>
            }

            {selectedTeam &&
              <div className="mt-4">
                <table width="">
                  <tbody>
                    <tr><td colSpan="2"><strong>{selectedTeam.gm.firstName} {selectedTeam.gm.lastName}</strong></td></tr>
                    <tr><td><strong>Risk:</strong></td><td className="pl-2">{selectedTeam.gm.riskTolerance}</td></tr>
                    <tr><td><strong>Develop:</strong></td><td className="pl-2"> {selectedTeam.gm.developmentFocus}</td></tr>
                    <tr><td><strong>Strategy: </strong></td><td className="pl-2">{selectedTeam.gm.teamBuildingStrategy}</td></tr>
                  </tbody>
                </table>

                {selectedTeam.positions && Object.keys(selectedTeam.positions).length > 0 &&
                  <div className="mt-3">
                    <strong>Draft History:</strong>
                    {/* selectedTeam.positions is an object with key of position -> value, let's iterate over this printing out position/value */}
                    {Object.keys(selectedTeam.positions).map((position) => {
                      return (
                        <div key={position}>
                          {position}: {selectedTeam.positions[position]}
                        </div>
                      )
                    })}
                  </div>
                }


                <div className="my-5">
                  {leagueFacade.getDraftNotes(selectedTeam.gm).map((item, index) => {
                    return <div key={index} className="my-2 text-sm" dangerouslySetInnerHTML={{ __html: item }}></div>
                  })}
                </div>
              </div>
            }


          </div>

          <div className="w-full md:w-8/12">
            <div className="flex">
              {['Offense', 'Pitchers', 'C', '1B', '2B', '3B', 'SS', 'OF', 'DH', 'SP', 'RP', 'CL'].map((position) => {
                return <div className={`mx-3 ${selectedPosition == position ? "font-bold" : ""}`} key={position}>
                  <a className="underline" href="#" onClick={handleSelectPosition(position)}>
                    {position}
                  </a>
                </div>
              })
              }
            </div>

            <div>
              {availablePlayers && availablePlayers.length > 0 && (

                <table className="text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-300">

                    <tr>
                      <th className="px-4 py-2 text-start">Player</th>
                      <th className="px-4 py-2">Position</th>
                      <th className="px-4 py-2">Age</th>
                      <th className="px-4 py-2">Grade</th>

                      {isOffense() &&
                        <>
                          <th className="px-4 py-2">Type</th>
                          <th className="px-4 py-2">Clutch</th>
                          <th className="px-4 py-2">Defense</th>
                          <th className="px-4 py-2">Power</th>
                        </>
                      }

                      {isPitcher() &&
                        <th className="px-4 py-2">HR Tend</th>
                      }

                      {selectedTeam &&
                        <th className="px-4">Action</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {availablePlayers.map(player => (
                      <tr key={player.playerId} className="border-b border-gray-200 odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 dark:border-gray-700">
                        <td className="px-4 py-2 text-start">{player.firstName} {player.lastName}</td>
                        <td className="px-4 py-2">{player.position}</td>
                        <td className="px-4 py-2">{player.age}</td>
                        <td className="px-4 py-2">{player.grade}</td>

                        {isOffense() &&
                          <>
                            <td className="px-4 py-2">{player.archetype}</td>
                            <td className="px-4 py-2">{player.clutchGrade}</td>
                            <td className="px-4 py-2">{player.defenseGrade}</td>
                            <td className="px-4 py-2">{player.powerGrade}</td>
                          </>

                        }

                        {isPitcher() &&
                          <td className="px-4 py-2">{player.powerTendency == "NO DESIGNATION" ? "" : player.powerTendency}</td>
                        }

                        {selectedTeam &&
                          <td>
                            <button onClick={handleDraftPlayer(player.playerId)} className="px-3 py-1 text-xs font-bold text-white uppercase bg-blue-500 rounded-full hover:bg-blue-700">
                              DRAFT
                            </button>
                          </td>
                        }

                      </tr>
                    ))}
                  </tbody>
                </table>

              )}
            </div>

          </div>

        </div>



      </ContentWrapper>
    </>
  );
}