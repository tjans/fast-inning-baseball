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
import gmService from "src/services/GeneralManagerService";
import playerService from "src/services/PlayerService";
import teamService from "src/services/TeamService";
import leagueService from "src/services/LeagueService";
import seasonTeamService from "src/services/SeasonTeamService";
import SeasonService from "src/services/SeasonService";
import SeasonPlayerService from "src/services/SeasonPlayerService";
import nameService from "src/services/NameService";

// components
import DebugJson from "src/components/DebugJson";
import { toast } from "react-toastify";

export default function LeagueEditor() {

  usePageTitle("Edit League");
  const [numberOfTeams, setNumberOfTeams] = useState(null);
  const [isDraftLeague, setIsDraftLeague] = useState(true);

  const [league, setLeague] = useState(null);
  const { leagueId } = useParams();

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
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

      // New league
      setNumberOfTeams(data.numberOfTeams);

      // empty the draft board and teams for this league
      // create a new league
      let newLeague = {
        name: data.leagueName,
        numberOfTeams: data.numberOfTeams,
        numberOfGames: data.numberOfGames,
        isDraftLeague: isDraftLeague,
        year: 1
      };

      var newLeagueId = await leagueService.saveLeague(newLeague);

      // create a new season
      var seasonId = await SeasonService.saveSeason({
        leagueId: newLeagueId,
        year: 1
      });

      // create a team, and then decide whether to place players on the team or in undrafted state based on isDraftLeague
      for (let i = 0; i < data.numberOfTeams; i++) {
        // Create the team record
        let team = {
          city: `City ${i + 1}`,
          name: `Team`,
          leagueId: newLeagueId,
          abbreviation: `TM${i + 1}`,
        }

        let teamId = await teamService.saveTeam(team);

        // Create the general manager record
        let gm = await gmService.generate();
        let names = await nameService.generateName();

        gm.firstName = names.firstName;
        gm.lastName = names.lastName;
        let gmId = await gmService.saveGeneralManager(gm);

        // Add the team to the current season
        let seasonTeam = {
          seasonId: seasonId,
          teamId: teamId,
          generalManagerId: gmId
        };
        let seasonTeamId = await seasonTeamService.saveSeasonTeam(seasonTeam);


        // create the players and attach them to the team
        ["C", "1B", "2B", "SS", "3B", "OF", "OF", "OF", "DH"].map(async (position) => {

          let names = await nameService.generateName();
          let player = {
            position: position,
            firstName: names.firstName,
            lastName: names.lastName,
            position
          }

          // saves main player record
          let playerId = await playerService.savePlayer(player);

          // generates the position player
          let positionPlayer = await playerService.generatePositionPlayer(position);

          // saves the player to a team in the current season
          await SeasonPlayerService.saveSeasonPlayer({
            ...positionPlayer,
            seasonId: seasonId,
            seasonTeamId: isDraftLeague ? null : seasonTeamId,
            playerId: playerId
          });

        });

        for (let i = 0; i < 6; i++) {

          let names = await nameService.generateName();
          let player = {
            firstName: names.firstName,
            lastName: names.lastName,
            position: "SP"
          }
          let playerId = await playerService.savePlayer(player);

          let pitcher = await playerService.generatePitcher("SP");
          await SeasonPlayerService.saveSeasonPlayer({
            ...pitcher,
            seasonId: seasonId,
            seasonTeamId: isDraftLeague ? null : seasonTeamId,
            playerId: playerId
          });
        }

        for (let i = 0; i < 4; i++) {
          let names = await nameService.generateName();
          let player = {
            firstName: names.firstName,
            lastName: names.lastName,
            position: "RP"
          }
          let playerId = await playerService.savePlayer(player);
          let pitcher = await playerService.generatePitcher("RP");
          await SeasonPlayerService.saveSeasonPlayer({
            ...pitcher,
            seasonId: seasonId,
            seasonTeamId: isDraftLeague ? null : seasonTeamId,
            playerId: playerId
          });
        }

        let closerName = await nameService.generateName();
        let player = {
          firstName: closerName.firstName,
          lastName: closerName.lastName,
          position: "CL"
        }
        let playerId = await playerService.savePlayer(player);
        let pitcher = await playerService.generatePitcher("CL")
        await SeasonPlayerService.saveSeasonPlayer({
          ...pitcher,
          seasonId: seasonId,
          seasonTeamId: isDraftLeague ? null : seasonTeamId,
          playerId: playerId
        });
      }

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