import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Scout Search", end: true },
  { to: "/compare", label: "Compare Players" },
  { to: "/pricing", label: "Player Pricing" },
  { to: "/similar", label: "Similar Players" },
];

function NavBar() {
  return (
    <nav className="nav-bar">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `nav-link ${isActive ? "nav-link-active" : ""}`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default NavBar;
