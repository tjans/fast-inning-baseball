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
    const [draftedPlayers, setDraftedPlayers] = useState([]);

    const { leagueId } = useParams();

    const fixDraftOrder = async () => {
        const league = await leagueService.getLeague(leagueId);
        const recentDraftees = await playerService.getRecentlyDraftedPlayers(league.currentSeason.seasonId);
        let draftIndex = recentDraftees.length;

        for (const item of recentDraftees) {
            if (item.player.isFixed) continue;

            item.player.draftIndex = draftIndex;
            item.player.isFixed = true;
            draftIndex--;
            await playerService.savePlayer(item.player);
        }

        setDraftedPlayers(recentDraftees);

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

        const pitchers = await leagueService.getAllPitchers(league.currentSeason.seasonId);
        for (const player of pitchers) {
            //await playerService.savePlayer(player)
        };
    }

    useEffect(_ => {
        load();
    }, []);

    return (
        <ContentWrapper>
            <div className="flex flex-wrap gap-4">
                <Button text="Set Unfixed" onClick={setUnfixed} />
                <Button text="Fix Draft Order" onClick={fixDraftOrder} />
            </div>

            <table>
                <thead>
                    <tr>
                        <th className="text-left">Player</th>
                        <th className="text-left">Draft Date</th>
                        <th className="text-left">Draft Index</th>
                        <th className="text-left">Team</th>
                    </tr>
                </thead>
                <tbody>
                    {draftedPlayers?.map((item) => {
                        return (
                            <tr key={item.player.playerId}>
                                <td>{item.player.firstName} {item.player.lastName}</td>
                                <td>{new Date(item.player.draftDate).toLocaleDateString()} {new Date(item.player.draftDate).toLocaleTimeString()}</td>
                                <td>{item.player.draftIndex ?? "??"}</td>
                                <td>{item.team.abbreviation}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

        </ContentWrapper>
    )
}

export default Fixer