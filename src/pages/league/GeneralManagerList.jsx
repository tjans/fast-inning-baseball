import { useEffect, useState } from "react";

// store
import useAppStore from "src/stores/useAppStore";

// foundation
import usePageTitle from 'src/hooks/usePageTitle'
import ContentWrapper from "src/components/ContentWrapper";

export default function Template() {
  usePageTitle("Template");
  const [isNotAvailableModalOpen, setIsNotAvailableModalOpen] = useState(false);
  const appStore = useAppStore()

  return (
    <>
      <ContentWrapper>
        GM List
      </ContentWrapper>
    </>
  );
}