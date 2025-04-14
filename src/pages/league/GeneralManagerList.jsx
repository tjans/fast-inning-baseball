import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// store
import useAppStore from "src/stores/useAppStore";

// foundation
import usePageTitle from 'src/hooks/usePageTitle'
import ContentWrapper from "src/components/ContentWrapper";

// services
import gmService from "src/services/GeneralManagerService";
import leagueService from "src/services/LeagueService";

export default function GeneralManagerList() {
  usePageTitle("General Manager List");
  const [generalManagers, setGeneralManagers] = useState(null);

  const { leagueId } = useParams();

  const load = async () => {
    let gms = await gmService.getGeneralManagers(leagueId);
    setGeneralManagers(gms);
  }

  useEffect(_ => {
    load();
  }, []);

  return (
    <>
      <ContentWrapper>
        <div className="font-bold text-lg my-4">General Managers</div>
        {generalManagers?.map(gm => {
          return (
            <div key={gm.generalManagerId} className="flex flex-col gap-2 py-4 border-b border-gray-200">
              <h3>
                {gm.firstName} {gm.lastName} - {gm.team ? gm.team.city : "No Team"}
              </h3>
            </div>
          )
        })}
      </ContentWrapper>
    </>
  );
}