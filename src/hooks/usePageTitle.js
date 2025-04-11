import { useRef, useEffect } from 'react'
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';

function usePageTitle(title) {
  const [setPageTitle] = useOutletContext();

  useEffect(() => {
    setPageTitle(title);

    return _=>setPageTitle("");
  }, [title]);

  // useEffect(() => () => {
  //   if (!prevailOnUnmount) {
  //     document.title = defaultTitle.current;
  //   }
  // }, [])
}

export default usePageTitle