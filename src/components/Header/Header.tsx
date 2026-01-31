import "./Header.scss";
import codedamLogo from "../../assets/theme/CodeDam/images/codedam.webp";
import beavyLogo from "../../assets/theme/CodeDam/images/Beavy_logo.webp";
import Beavy from "../../assets/theme/CodeDam/images/Beavy.webp";

export type MenuItemId = "home" | "playground";

interface MenuItem {
  id: MenuItemId;
  label: string;
  href: string;
}

const menuItems: MenuItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "playground", label: "Start Building", href: "/playground" },
];

interface HeaderProps {
  activeMenuItem: MenuItemId;
  showBeavy?: boolean;
}

export default function Header({ activeMenuItem, showBeavy = true }: HeaderProps) {
  return (
    <div className="header">
      <div className="logo">
        <img id="logo" src={codedamLogo} alt="CodeDam" />
      </div>

      <div className="main-menu">
        <ul>
          {menuItems.map((item) => (
            <li
              key={item.id}
              className={`main-menu-item ${activeMenuItem === item.id ? "active" : ""}`}
            >
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </div>

      {showBeavy && (
        <div className="beavy-container">
          <img id="beavy-logo" src={beavyLogo} alt="Beavy logo" />
          <img id="beavy" src={Beavy} alt="Beavy" />
        </div>
      )}
    </div>
  );
}

