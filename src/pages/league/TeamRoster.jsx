import ContentWrapper from 'src/components/ContentWrapper';
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import leagueService from 'src/services/LeagueService';
import teamService from 'src/services/TeamService';
import playerService from 'src/services/PlayerService';

const TeamRoster = () => {
    const { leagueId, teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [pitchers, setPitchers] = useState([]);
    const [teams, setTeams] = useState([]);

    const load = async () => {
        const league = await leagueService.getLeague(leagueId);

        const team = await teamService.getSeasonTeam(league.currentSeason.seasonId, teamId)
        const players = await teamService.getSeasonPositionPlayers(league.currentSeason.seasonId, teamId);
        const pitchers = await teamService.getSeasonPitchers(league.currentSeason.seasonId, teamId);
        const teams = await teamService.getSeasonTeams(league.currentSeason.seasonId);

        setTeams(teams);
        setTeam(team);
        setPitchers(pitchers);
        setPlayers(players);
    }

    useEffect(_ => {
        load();
    }, []);

    useEffect(_ => {
        load();
    }, [teamId]);

    return (
        <ContentWrapper>

            <div className="flex flex-wrap gap-4">
                {teams?.length > 0 && teams.map((team) => {
                    return (
                        <div key={team.teamId} className="flex items-center gap-3">
                            <Link to={`/leagues/${leagueId}/teams/${team.teamId}/roster`} className="flex items-center gap-3">
                                {team.city} {team.name}
                            </Link>
                        </div>
                    )
                })}
            </div>


            {team &&
                <>
                    <div className="font-bold text-xl mt-3">{team.city} {team.name}</div>

                    <div className="font-bold text-lg mt-4">Position Players</div>
                    <table className="text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400 w-full">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-300">

                            <tr>
                                <th className="px-4 py-2 text-start">Player</th>
                                <th className="px-4 py-2">Position</th>
                                <th className="px-4 py-2">Age</th>
                                <th className="px-4 py-2">Type</th>
                                <th className="px-4 py-2">Grade</th>
                                <th className="px-4 py-2">Clutch</th>
                                <th className="px-4 py-2">Defense</th>
                                <th className="px-4 py-2">Power</th>
                            </tr>
                        </thead>

                        <tbody>
                            {players.map(player => (
                                <tr key={player.playerId} className="border-b border-gray-200 odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-4 py-2 text-start">{player.firstName} {player.lastName}</td>
                                    <td className="px-4 py-2">{player.position}</td>
                                    <td className="px-4 py-2">{player.age}</td>

                                    <td className="px-4 py-2">{player.archetype}</td>
                                    <td className="px-4 py-2">{teamService.valueToGrade(player.grade)}/{teamService.valueToGrade(player.gradeCeiling)}</td>
                                    <td className="px-4 py-2">{teamService.valueToGrade(player.clutchGrade)}/{teamService.valueToGrade(player.clutchCeiling)}</td>
                                    <td className="px-4 py-2">{teamService.valueToGrade(player.defenseGrade)}/{teamService.valueToGrade(player.defenseCeiling)}</td>
                                    <td className="px-4 py-2">{teamService.valueToGrade(player.powerGrade)}/{teamService.valueToGrade(player.powerCeiling)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="font-bold text-lg mt-4">Pitchers</div>
                    <table className="text-sm text-left text-gray-500 rtl:text-right dark:text-gray-400 w-full">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-300">

                            <tr>
                                <th className="px-4 py-2 text-start">Player</th>
                                <th className="px-4 py-2">Position</th>
                                <th className="px-4 py-2">Age</th>
                                <th className="px-4 py-2">Grade</th>
                                <th className="px-4 py-2">Stamina</th>
                                <th className="px-4 py-2">HR Tendency</th>
                            </tr>
                        </thead>

                        <tbody>
                            {pitchers.map(player => (
                                <tr key={player.playerId} className="border-b border-gray-200 odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-4 py-2 text-start">{player.firstName} {player.lastName}</td>
                                    <td className="px-4 py-2">{player.position}</td>
                                    <td className="px-4 py-2">{player.age}</td>

                                    <td className="px-4 py-2">{teamService.valueToGrade(player.grade)}/{teamService.valueToGrade(player.gradeCeiling)}</td>
                                    <td className="px-4 py-2">{player.stamina}</td>
                                    <td className={"px-4 py-2 "}>{playerService.powerTendencyToGrade(player.powerTendency)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </>
            }

        </ContentWrapper>
    )
}

export default TeamRoster