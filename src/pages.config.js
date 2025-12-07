import Home from './pages/Home';
import BrowseMentors from './pages/BrowseMentors';
import MentorProfile from './pages/MentorProfile';
import ApplyAsMentor from './pages/ApplyAsMentor';
import StudentDashboard from './pages/StudentDashboard';
import MentorDashboard from './pages/MentorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
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
    "TermsOfService": TermsOfService,
    "PrivacyPolicy": PrivacyPolicy,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};