import { useEffect, useState } from 'react'
import leagueService from 'src/services/LeagueService';
import teamService from 'src/services/TeamService';
import playerService from 'src/services/PlayerService';
import ContentWrapper from 'src/components/ContentWrapper';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from 'src/components/Button';


const Fixer = () => {
    const [pitchers, setPitchers] = useState([]);
    const [nonPitchers, setNonPitchers] = useState([]);
    const [players, setPlayers] = useState([]);

    const { leagueId } = useParams();

    const addPlayer = async () => {
        let playerId = "875fc9ab-7e83-4d5a-9e08-daaa6b23cb8f";
        let league = await leagueService.getLeague(leagueId);
        let player = await playerService.getSeasonPlayer(league.currentSeason.seasonId, playerId);
        player.teamId = "42c711a0-b6da-40bd-b9d0-74dae253030a";
        player.draftIndex = 66;
        player.draftDate = new Date();
        await playerService.savePlayer(player);
        toast.success("Player added");
    }

    const dropPlayer = async () => {

        // let playerId = "ffc1db2a-1b88-4823-b6b9-f8ee754a33aa";
        // let league = await leagueService.getLeague(leagueId);
        // let player = await playerService.getSeasonPlayer(league.currentSeason.seasonId, playerId);
        // player.teamId = null;
        // player.draftIndex = null;
        // console.log(player)
        // await playerService.savePlayer(player);
        // toast.success("Player dropped");
    }

    const fixDraftOrder = async () => {
        const league = await leagueService.getLeague(leagueId);
        const recentDraftees = await playerService.getRecentlyPlayers(league.currentSeason.seasonId);
        let draftIndex = recentDraftees.length;

        for (const item of recentDraftees) {
            if (item.player.isFixed) continue;

            item.player.draftIndex = draftIndex;
            item.player.isFixed = true;
            draftIndex--;
            await playerService.savePlayer(item.player);
        }

        setPlayers(recentDraftees);

        toast.success("All drafted players now have a draft index");
    }

    const setUnfixed = async () => {
        if (confirm("Are you sure you want to set all players to unfixed?")) {
            const league = await leagueService.getLeague(leagueId);
            const players = await leagueService.getAllPositionPlayers(league.currentSeason.seasonId);
            const pitchers = await leagueService.getAllPitchers(league.currentSeason.seasonId);

            // merge players and pitchers arrays
            const allPlayers = [...players, ...pitchers];

            for (const player of allPlayers) {
                player.isFixed = false;
                await playerService.savePlayer(player);
            }

            toast.success("All players set to unfixed");
        }

    }

    const load = async () => {
        const league = await leagueService.getLeague(leagueId);
        const players = await leagueService.getAllPositionPlayers(league.currentSeason.seasonId);
        const pitchers = await leagueService.getAllPitchers(league.currentSeason.seasonId);
        setPlayers(pitchers);
    }

    useEffect(_ => {
        load();
    }, []);

    return (
        <ContentWrapper>
            <div className="flex flex-wrap gap-4">
                <Button text="Set Unfixed" onClick={setUnfixed} />
                <Button text="Fix Draft Order" onClick={fixDraftOrder} />
                <Button text="Add Player" onClick={addPlayer} />
                <Button text="Drop Player" onClick={dropPlayer} />
            </div>

            <table>
                <thead>
                    <tr>
                        <th className="text-left">Player</th>
                        <th className="text-left">Player ID</th>
                        <th className="text-left">Draft Date</th>
                        <th className="text-left">Draft Index</th>

                    </tr>
                </thead>
                <tbody>
                    {players?.map((player) => {
                        return (
                            <tr key={player.playerId}>
                                <td>{player.firstName} {player.lastName}</td>
                                <td>{player.playerId}</td>
                                <td>{new Date(player.draftDate).toLocaleDateString()} {new Date(player.draftDate).toLocaleTimeString()}</td>
                                <td>{player.draftIndex ?? "??"}</td>

                            </tr>
                        )
                    })}
                </tbody>
            </table>

        </ContentWrapper>

    )
}

export default Fixer