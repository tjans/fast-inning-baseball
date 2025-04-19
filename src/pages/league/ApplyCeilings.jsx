import { useEffect, useState } from 'react'
import leagueService from 'src/services/LeagueService';
import teamService from 'src/services/TeamService';
import playerService from 'src/services/PlayerService';
import ContentWrapper from 'src/components/ContentWrapper';
import { useParams } from 'react-router-dom';


const ApplyCeilings = () => {
    const [pitchers, setPitchers] = useState([]);
    const [nonPitchers, setNonPitchers] = useState([]);

    const { leagueId } = useParams();

    const load = async () => {
        const league = await leagueService.getLeague(leagueId);

        const pitchers = await leagueService.getAllPitchers(league.currentSeason.seasonId);
        for (const player of pitchers) {
            // Skip ones we've already processed
            if (player.isFixed) continue;

            player.powerTendency = playerService.powerTendencyToValue(player.powerTendency);
            player.isFixed = true;

            //await playerService.savePlayer(player)
        };
    }

    useEffect(_ => {
        load();
    }, []);

    return (
        <ContentWrapper>
            Completed
        </ContentWrapper>
    )
}

export default ApplyCeilings