import { useEffect, useState, useRef } from "react";

// store
import useAppStore from "src/stores/useAppStore";

// foundation
import usePageTitle from 'src/hooks/usePageTitle'
import ContentWrapper from "src/components/ContentWrapper";

// forms
import { useForm } from "react-hook-form";
import { TextInput } from "src/components/TextInput";

export default function Template() {

  usePageTitle("Template");
  const [isNotAvailableModalOpen, setIsNotAvailableModalOpen] = useState(false);
  const appStore = useAppStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const onSubmit = (data) => {
  }

  return (
    <>
      <ContentWrapper>
        <ul>
          <li>Last picks</li>
          <li>Players available by position</li>
          <li>Players available by grade</li>
        </ul>

      </ContentWrapper>
    </>
  );
}