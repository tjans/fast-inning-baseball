import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

// icons
import { PiBaseballCapDuotone } from "react-icons/pi";

// components
import Card from "src/components/Card";

// foundation
import usePageTitle from 'src/hooks/usePageTitle'
import ContentWrapper from "src/components/ContentWrapper";

// services
import leagueService from "src/services/LeagueService";
import teamService from "src/services/TeamService";

export default function TeamList() {

    usePageTitle("Team List");
    const [isNotAvailableModalOpen, setIsNotAvailableModalOpen] = useState(false);
    const [league, setLeague] = useState(null);
    const [teams, setTeams] = useState([]);
    const { leagueId } = useParams();

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const league = await leagueService.getLeague(leagueId);

        if (league) {
            setLeague(league);

            const teams = await teamService.getSeasonTeams(league.currentSeason.seasonId);
            setTeams(teams)
        }
    }

    return (
        <>
            <ContentWrapper>
                <h2>{league?.name}</h2>
                {teams && teams.length > 0 && teams.map((team) => {

                    return (
                        <Card key={team.teamId} to={`/leagues/${leagueId}/teams/${team.teamId}/edit`} className="" >
                            <div className="flex items-center gap-3">
                                <PiBaseballCapDuotone className="mr-5 text-3xl text-defaultBlue" />
                                <section className="text-left">
                                    <div className="font-bold">
                                        {team.city} {team.name}
                                    </div>
                                    <div className="text-sm">
                                        GM: {team.gm?.firstName} {team.gm?.lastName}
                                    </div>
                                </section >
                            </div>
                        </Card>
                    );
                })}

            </ContentWrapper>
        </>
    );
}