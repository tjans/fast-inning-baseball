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
import { toast } from "react-toastify";

export default function TeamEditor() {

    usePageTitle("Team Editor");
    const { leagueId, seasonTeamId } = useParams();
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
        let team = await teamService.getSeasonTeam(seasonTeamId);
        team.parent.city = data.teamCity;
        team.parent.name = data.teamName;
        await teamService.saveTeam(team.parent);
        toast.success("Team saved successfully!");
        navigate(`/leagues/${leagueId}/teams`);
    }

    const load = async () => {
        let seasonTeam = await teamService.getSeasonTeam(seasonTeamId);
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
                                defaultValue={teamData?.parent?.city ?? ""}
                                rules={{
                                    required: "City is required"
                                }}
                            />

                            <TextInput
                                label="Team Name"
                                name="teamName"
                                register={register}
                                error={errors.teamName}
                                value={teamData?.parent.name ?? ""}
                                rules={{
                                    required: "Team name is required"
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