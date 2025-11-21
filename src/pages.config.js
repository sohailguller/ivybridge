import Home from './pages/Home';
import BrowseMentors from './pages/BrowseMentors';
import MentorProfile from './pages/MentorProfile';
import ApplyAsMentor from './pages/ApplyAsMentor';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "BrowseMentors": BrowseMentors,
    "MentorProfile": MentorProfile,
    "ApplyAsMentor": ApplyAsMentor,
    "StudentDashboard": StudentDashboard,
    "MentorDashboard": MentorDashboard,
    "AdminDashboard": AdminDashboard,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};