import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Contacts } from "./pages/Contacts";
import { ContactProfile } from "./pages/ContactProfile";
import { Jobs } from "./pages/Jobs";
import { Outreach } from "./pages/Outreach";
import { Resumes } from "./pages/Resumes";
import { Reminders } from "./pages/Reminders";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "contacts", Component: Contacts },
      { path: "contacts/:id", Component: ContactProfile },
      { path: "jobs", Component: Jobs },
      { path: "outreach", Component: Outreach },
      { path: "resumes", Component: Resumes },
      { path: "reminders", Component: Reminders },
    ],
  },
]);
