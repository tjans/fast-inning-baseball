import React from "react";
import "src/index.css";
import reportWebVitals from "src/reportWebVitals";
import * as ReactDOM from "react-dom/client";
import Layout from "src/pages/Layout";

// Pages
import Home from "src/pages/Home";
import Settings from "src/pages/Settings";

// Custom Pages
import LeagueEditor from "src/pages/LeagueEditor";
import LeagueViewer from "src/pages/LeagueViewer";
import Draft from "src/pages/Draft";
import TeamList from "src/pages/league/TeamList"
import TeamEditor from "src/pages/league/TeamEditor";
import LeagueList from "src/pages/league/LeagueList";

// Plumbing
import ErrorPage from "src/error-page";
import "react-toastify/dist/ReactToastify.css";

import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />} errorElement={<ErrorPage />}>
        <Route index element={<Home />} />
        <Route path="/leagues/:leagueId/edit" element={<LeagueEditor />} />
        <Route path="/leagues/:leagueId" element={<LeagueViewer />} />
        <Route path="/leagues/:leagueId/draft" element={<Draft />} />

        <Route path="/leagues" element={<LeagueList />} />
        <Route path="/leagues/:leagueId/teams" element={<TeamList />} />
        <Route path="/leagues/:leagueId/teams/:seasonTeamId/edit" element={<TeamEditor />} />

        <Route path="/settings" element={<Settings />} />
      </Route>
    </>,
  ),
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
