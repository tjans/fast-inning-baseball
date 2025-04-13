import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

// forms
import { useForm } from "react-hook-form";
import { TextInput } from "src/components/TextInput";
import ToggleButton from "src/components/ToggleButton";
import FormSubmit from "src/components/FormSubmit";

// foundation
import usePageTitle from 'src/hooks/usePageTitle'
import ContentWrapper from "src/components/ContentWrapper";

// services
import teamService from "src/services/TeamService";
import leagueService from "src/services/LeagueService";
import { toast } from "react-toastify";

export default function TeamEditor() {

    usePageTitle("Team Editor");
    const { leagueId, teamId } = useParams();
    const navigate = useNavigate();

    const [teamData, setTeamData] = useState(null);

    useEffect(() => {
        load();
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm();

    const onSubmit = async (data) => {
        let league = await leagueService.getLeague(leagueId);
        let team = await teamService.getSeasonTeam(league.currentSeason.seasonId, teamId);
        console.log(team, data)

        team.city = data.teamCity;
        team.name = data.teamName;
        team.abbreviation = data.teamAbbreviation;
        team.draftPosition = data.teamDraftPosition;
        await teamService.saveSeasonTeam(team);
        toast.success("Team saved successfully!");
        navigate(`/leagues/${leagueId}/teams`);
    }

    const load = async () => {
        let league = await leagueService.getLeague(leagueId);
        let seasonTeam = await teamService.getSeasonTeam(league.currentSeason.seasonId, teamId);
        console.log(seasonTeam);
        setTeamData(seasonTeam);
    }

    return (
        <>
            <ContentWrapper>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {teamData &&
                        <>
                            <TextInput
                                label="Team City"
                                name="teamCity"
                                register={register}
                                error={errors.teamCity}
                                defaultValue={teamData?.city ?? ""}
                                rules={{
                                    required: "City is required"
                                }}
                            />

                            <TextInput
                                label="Team Name"
                                name="teamName"
                                register={register}
                                error={errors.teamName}
                                defaultValue={teamData?.name ?? ""}
                                rules={{
                                    required: "Name is required"
                                }}
                            />


                            <TextInput
                                label="Team Abbreviation"
                                name="teamAbbreviation"
                                register={register}
                                error={errors.teamAbbreviation}
                                defaultValue={teamData?.abbreviation ?? ""}
                                rules={{
                                    required: "Name is required"
                                }}
                            />

                            <TextInput
                                label="Team Draft Position"
                                name="teamDraftPosition"
                                register={register}
                                type="number"
                                error={errors.teamDraftPosition}
                                defaultValue={teamData?.draftPosition ?? ""}
                                rules={{

                                }}
                            />

                            <FormSubmit
                                onCancel={(_) => navigate(`/leagues/${leagueId}/teams`)}
                            />
                        </>
                    }

                </form>
            </ContentWrapper>
        </>
    );
}