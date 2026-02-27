import { createBrowserRouter } from "react-router";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { Dashboard } from "./pages/Dashboard";
import { Contacts } from "./pages/Contacts";
import { ContactProfile } from "./pages/ContactProfile";
import { Jobs } from "./pages/Jobs";
import { Outreach } from "./pages/Outreach";
import { Resumes } from "./pages/Resumes";
import { Reminders } from "./pages/Reminders";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

export const router = createBrowserRouter([
  // Public routes — no layout, no auth check
  { path: "/login",  Component: Login },
  { path: "/signup", Component: Signup },

  // Protected routes — redirects to /login if no session
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true,              Component: Dashboard },
      { path: "contacts",         Component: Contacts },
      { path: "contacts/:id",     Component: ContactProfile },
      { path: "jobs",             Component: Jobs },
      { path: "outreach",         Component: Outreach },
      { path: "resumes",          Component: Resumes },
      { path: "reminders",        Component: Reminders },
    ],
  },
]);
