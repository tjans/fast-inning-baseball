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
                <div className="my-3">
                    <Link to="/leagues/0/edit" className="px-3 py-1 text-xs font-bold text-white uppercase bg-green-500 rounded-full hover:bg-green-700">
                        NEW
                    </Link>
                </div>



                {leagues && leagues.length > 0 && leagues.map((league) => {

                    return (
                        <Card to={`/leagues/${league.leagueId}/teams`} className="" key={league.leagueId} >
                            <div className="flex items-center gap-3">
                                <PiBaseballCapDuotone className="mr-5 text-3xl text-defaultBlue" />
                                <section className="text-left">
                                    <div className="font-bold">
                                        {league.name}
                                    </div>
                                    <div className="text-sm">
                                        {league.numberOfTeams} Teams, {league.numberOfGames} Games, {league.isDraftLeague ? "Draft" : "Auto"}
                                    </div>
                                </section >
                            </div>
                        </Card>

                        // <tr key={league.leagueId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        //     <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        //         {league.name}
                        //     </td>
                        //     <td className="px-4 py-2">
                        //         {league.numberOfTeams}
                        //     </td>
                        //     <td className="px-4 py-2">
                        //         {league.numberOfGames}
                        //     </td>
                        //     <td className="px-4 py-2">
                        //         {league.isDraftLeague ? "Draft" : "Auto"}
                        //     </td>
                        //     <td className="px-4 py-2">
                        //         <Link to={`/leagues/${league.leagueId}/edit`} className="px-3 py-1 text-xs font-bold text-white uppercase bg-blue-500 rounded-full hover:bg-blue-700">
                        //             EDIT
                        //         </Link>

                        //         <Link to={`/leagues/${league.leagueId}`} className="px-3 py-1 ml-2 text-xs font-bold text-white uppercase bg-yellow-500 rounded-full hover:bg-yellow-700">
                        //             VIEW
                        //         </Link>
                        //     </td>
                        // </tr>
                    );
                })}

            </ContentWrapper>
        </>
    );
}