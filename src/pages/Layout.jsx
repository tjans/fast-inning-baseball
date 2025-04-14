import { useState, useEffect } from 'react'
import { Outlet, Link, useParams } from "react-router-dom";
import useAppStore from "src/stores/useAppStore";
import { APP_NAME, HEADER_BG_CLASS, HEADER_TEXT_CLASS } from "src/AppConfig";

// Icons
import { PiBaseballCapDuotone } from "react-icons/pi";
import { CiBaseball } from "react-icons/ci";
import { FaHome } from "react-icons/fa";

// Other
import ConfirmationModal from "src/components/ConfirmationModal";
import { toast } from "react-toastify";
import { ToastContainer, Slide } from "react-toastify";

// services
import LeagueService from 'src/services/LeagueService';

import ScrollToTop from "src/components/ScrollToTop";
import { set } from 'react-hook-form';


export default function Root() {
  const [pageTitle, setPageTitle] = useState(null);
  const [league, setLeague] = useState(null);
  const appStore = useAppStore()

  const { leagueId } = useParams();

  const load = async () => {
    const league = leagueId ? await LeagueService.getLeague(leagueId) : null;

    if (league) {
      setLeague(league);
    } else {
      setLeague(null);
    }
  }

  useEffect(() => {
    load();
  }, [leagueId]);

  useEffect(() => {
    document.title = `${pageTitle ? `${pageTitle} | ` : ""}${APP_NAME}`;
  }, [pageTitle]);

  return (
    <>
      <ScrollToTop />

      <div className={`flex items-center justify-center gap-3 p-4 font-bold text-center shadow shadow-slate-400 ${HEADER_BG_CLASS} ${HEADER_TEXT_CLASS}`}>
        {APP_NAME}
      </div>

      <div className="h-screen mx-auto text-center">
        <Outlet context={[setPageTitle]} />
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-gray-100 border-t border-gray-300 dark:bg-slate-700 dark:text-white">
        <div className="flex justify-around p-4">

          <Link className="flex flex-col items-center text-sm" to="/">
            <FaHome className="text-2xl font-bold" />
            <span>Home</span>
          </Link>

          {league &&
            <>
              <Link className="flex flex-col items-center text-sm" to={`/leagues/${league.leagueId}/teams`}>
                <CiBaseball className="text-2xl font-bold" />
                <span>{league.name}</span>
              </Link>
            </>


          }

        </div>
      </div>

      <ToastContainer
        closeButton={true}
        position="top-center"
        theme="colored"
        autoClose={1500}
        transition={Slide}
        closeOnClick={true}
      />
    </>
  );
}