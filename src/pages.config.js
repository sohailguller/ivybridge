import Home from './pages/Home';
import BrowseMentors from './pages/BrowseMentors';
import MentorProfile from './pages/MentorProfile';
import ApplyAsMentor from './pages/ApplyAsMentor';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "BrowseMentors": BrowseMentors,
    "MentorProfile": MentorProfile,
    "ApplyAsMentor": ApplyAsMentor,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};