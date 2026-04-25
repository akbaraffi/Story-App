import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/login/login-page";
import RegisterPage from "../pages/register/register-page";
import AddPage from "../pages/add/add-page";
import DetailPage from "../pages/detail/detail-page";
import BookmarkPage from "../pages/bookmark/bookmark-page";
import { parseActivePathname } from "./url-parser";

const routes = {
  "/": () => new HomePage(),
  "/about": () => new AboutPage(),
  "/login": () => new LoginPage(),
  "/register": () => new RegisterPage(),
  "/add": () => new AddPage(),
  "/detail/:id": () => new DetailPage(parseActivePathname().id),
  "/bookmark": () => new BookmarkPage(),
};

export default routes;
