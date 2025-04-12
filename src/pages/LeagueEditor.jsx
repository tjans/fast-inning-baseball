import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

// foundation
import usePageTitle from 'src/hooks/usePageTitle'
import ContentWrapper from "src/components/ContentWrapper";
import { useNavigate } from "react-router-dom";

// forms
import { useForm } from "react-hook-form";
import { TextInput } from "src/components/TextInput";
import ToggleButton from "src/components/ToggleButton";
import FormSubmit from "src/components/FormSubmit";

// services
import leagueService from "src/services/LeagueService";
import leagueFacade from "src/facades/LeagueFacade";

// components
import { toast } from "react-toastify";

export default function LeagueEditor() {

  usePageTitle("Edit League");
  const [isDraftLeague, setIsDraftLeague] = useState(true);

  const [league, setLeague] = useState(null);
  const { leagueId } = useParams();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    let league = null;

    if (leagueId != 0) {
      league = await leagueService.getLeague(leagueId);
    } else {
      league = {};
    }

    setLeague(league);
  }

  const handleDraftLeagueChange = (e) => {
    setIsDraftLeague(e.target.checked);
  }

  const onSubmit = async (data) => {
    if (leagueId != 0) {

      // Edit league
      league.name = data.leagueName;
      league.numberOfTeams = data.numberOfTeams;
      league.numberOfGames = data.numberOfGames;
      await leagueService.saveLeague(league);
      toast.success("League updated");

    } else {

      await leagueFacade.setupNewLeague(data, isDraftLeague);
      toast.success("League created successfully");
    }

    // navigate to the league page
    navigate(`/leagues`);
  }

  return (
    <>
      <ContentWrapper align="start">

        {league &&
          <form onSubmit={handleSubmit(onSubmit)}>

            <TextInput
              label="What is the league name?"
              name="leagueName"
              register={register}
              error={errors.leagueName}
              defaultValue={league?.name ?? ""}
              rules={{
                required: "League name is required"
              }}
            />

            {leagueId == 0 &&
              <TextInput
                label="How many teams are in your league?"
                name="numberOfTeams"
                register={register}
                error={errors.numberOfTeams}
                defaultValue={league?.numberOfTeams ?? ""}
                rules={{
                  required: "Number of teams is required"
                }}
              />
            }

            <TextInput
              label="How many games will each team play?"
              name="numberOfGames"
              register={register}
              error={errors.numberOfGames}
              defaultValue={league?.numberOfGames ?? ""}
              rules={{
                required: "Number of games is required"
              }}
            />

            {!leagueId &&
              <>
                <ToggleButton
                  label="Draft league?"
                  checked={isDraftLeague}
                  onChange={handleDraftLeagueChange}
                />
                {isDraftLeague && <small>Players will be left in an undrafted state, allowing you to run your own draft</small>}
                {!isDraftLeague && <small>Players will be automatically added to your teams as they are created</small>}
              </>
            }

            <FormSubmit
              onCancel={(_) => navigate("/leagues")}
            />

          </form>
        }

      </ContentWrapper>
    </>
  );
}