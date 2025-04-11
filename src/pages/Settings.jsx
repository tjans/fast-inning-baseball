import { useEffect, useState } from "react";

// Components
import FormSubmit from "src/components/FormSubmit";

// Hooks
// import { set, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

// Services
import settingsService from "src/services/SettingsService";

// unsorted
import usePageTitle from 'src/hooks/usePageTitle'
import ContentWrapper from "src/components/ContentWrapper";
import { toast } from "react-toastify";
import ToggleButton from "src/components/ToggleButton";

function Settings() {
    usePageTitle("Settings")

    // state
    const [settings, setSettings] = useState({

    });

    // hooks
    const navigate = useNavigate();

    const crumbs = [
        { to: "/", text: "Home" }
    ]

    const onSave = () => {
        // settingsService.saveSettings(settings);
        // toast.success("Settings saved");
        // navigate("/");
    };

    // side effects
    useEffect(() => {
        const settings = settingsService.getSettings();
        //setSettings(settings);
    }, []);

    return (
        <>

            <SubNav
                crumbs={crumbs}
            />

            <ContentWrapper>
                <div className="text-2xl font-bold text-black">Settings</div>

                <div className="mt-4">
                    <ToggleButton
                        label="Some Checkbox"
                        checked={true}
                        onChange={_ => { alert('test!') }}
                    />
                </div>


                <FormSubmit
                    onCancel={(_) => navigate("/")}
                    onSubmit={onSave}
                />

            </ContentWrapper>
        </>
    );
}

export default Settings;
