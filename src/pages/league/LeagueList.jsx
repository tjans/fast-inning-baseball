import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";

// icons
import { PiBaseballCapDuotone } from "react-icons/pi";

// components
import Card from "src/components/Card";

// foundation
import usePageTitle from 'src/hooks/usePageTitle'
import ContentWrapper from "src/components/ContentWrapper";

// services
import leagueService from "src/services/LeagueService";

export default function LeagueList() {

    usePageTitle("League List");
    const [leagues, setLeagues] = useState([]);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const leagues = await leagueService.getLeagues();
        setLeagues(leagues);
    }

    return (
        <>
            <ContentWrapper>
                <Link to="/export-data" className="underline">
                    Export
                </Link>

                <div className="my-3">
                    <Link to="/leagues/0/edit" className="px-3 py-1 text-xs font-bold text-white uppercase bg-green-500 rounded-full hover:bg-green-700">
                        NEW
                    </Link>
                </div>

                {leagues && leagues.length > 0 && leagues.map((league) => {

                    return (
                        <section className="text-left" key={league.leagueId}>
                            <div className="font-bold">
                                {league.name}
                            </div>
                            <div className="text-sm">
                                {league.numberOfTeams} Teams, {league.numberOfGames} Games, {league.isDraftLeague ? "Draft" : "Auto"}
                            </div>
                            <div><Link to={`/leagues/${league.leagueId}/draft`} className="underline">Draft</Link></div>
                            <div><Link to={`/leagues/${league.leagueId}/teams`} className="underline">Teams</Link></div>
                            <div><Link to={`/leagues/${league.leagueId}/general-managers`} className="underline">GMs</Link></div>
                        </section >

                    );
                })}

            </ContentWrapper>
        </>
    );
}