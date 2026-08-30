import { useAuth } from "../../context/AuthContext"; // Укажи правильный путь к контексту
import "./AuthLayout.css";

const WelcomePage = () => {
	const { setCurrentScreen } = useAuth();

	return (
		<div className="container centering-wrapper">
			<div className="auth-surface">
				<div className="welcome-card auth-content">
					<svg
						className="welcome__books-icon"
						width="80"
						height="71"
						viewBox="0 0 80 71"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<rect
							y="9.60001"
							width="24"
							height="49.6"
							rx="3.2"
							fill="#701470"
						/>
						<rect
							x="27.2"
							y="3.2"
							width="24"
							height="56"
							rx="3.2"
							fill="#147014 "
						/>
						<rect
							x="54.4"
							y="12.8"
							width="24"
							height="46.4"
							rx="3.2"
							fill="#144270"
						/>
					</svg>
					<h1 className="welcome__title">
						Welcome to <br />
						<span className="welcome__title--accent">
							Your Personal Bookshelf!
						</span>
					</h1>
					<p className="welcome__subtitle">
						A handy tracker to organize your books and bookshelves.
					</p>

					<div className="welcome-actions">
						<button
							className="auth-btn login-btn"
							onClick={() => setCurrentScreen("login")}
						>
							Log In
						</button>

						<button
							className="auth-btn register-btn"
							onClick={() => setCurrentScreen("register")}
						>
							Sign Up
						</button>
					</div>
					<p className="welcome__subtitle">Store. Organize. Enjoy reading.</p>
					<p className="welcome-heart">♥</p>
				</div>
			</div>
		</div>
	);
};

export default WelcomePage;
