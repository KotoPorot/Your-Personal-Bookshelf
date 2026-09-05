import { useAuth } from "../../context/AuthContext";
import logoIcon from "../../assets/icons/books-book-svgrepo-com (2).svg";

const Header = ({ username, onLogout }) => {
	const { setCurrentScreen } = useAuth();
	return (
		<header className="header">
			<div className="container header__content">
				<div
					className="header__logo-box"
					onClick={() => setCurrentScreen("bookshelf")}
					style={{ cursor: "pointer" }}
				>
					<img src={logoIcon} alt="Logo" className="header__logo-icon" />
					<h1 className="header__logo-title">Your Bookshelf</h1>
				</div>
				<div className="header-user">
					<span className="user-welcome">Hi there, {username || "Guest"}!</span>
					<button className="logout-btn app-btn" onClick={onLogout}>
						Sign Out
					</button>
				</div>
			</div>
		</header>
	);
};

export default Header;
