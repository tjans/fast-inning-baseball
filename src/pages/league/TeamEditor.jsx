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
import seasonTeamService from "src/services/SeasonTeamService";

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

    }

    const load = async () => {
        let seasonTeam = await seasonTeamService.getSeasonTeam(seasonTeamId);
        setTeamData(seasonTeam);
    }

    return (
        <>
            <ContentWrapper>
                <form onSubmit={handleSubmit(onSubmit)}>

                    <TextInput
                        label="Team City"
                        name="teamCity"
                        register={register}
                        error={errors.teamCity}
                        defaultValue={teamData?.parent.city ?? ""}
                        rules={{
                            required: "Team city is required"
                        }}
                    />

                    <TextInput
                        label="Team Name"
                        name="teamName"
                        register={register}
                        error={errors.teamName}
                        defaultValue={teamData?.parent.name ?? ""}
                        rules={{
                            required: "Team name is required"
                        }}
                    />

                    <FormSubmit
                        onCancel={(_) => navigate(`/leagues/${leagueId}/teams`)}
                    />

                </form>
            </ContentWrapper>
        </>
    );
}