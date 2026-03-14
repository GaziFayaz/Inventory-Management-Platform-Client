import { Link } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import useAuth from "@/Hooks/useAuth";
import LoginDropdown from "./LoginDropdown";
import UserMenu from "./UserMenu";

const Navbar = () => {
	const auth = useAuth();

	return (
		<header className="border-border/60 bg-background/95 supports-backdrop-filter:bg-background/80 border-b backdrop-blur-sm">
			<div className="mx-12 flex h-14 items-center gap-4 md:mx-24 lg:mx-32">
				{/* Brand */}
				<Link
					to="/"
					className="text-foreground shrink-0 text-lg font-semibold tracking-tight"
				>
					Home
				</Link>

				{/* Global search */}
				<div className="relative flex flex-1 items-center">
					<Search className="text-muted-foreground pointer-events-none absolute left-3 size-4" />
					<input
						type="search"
						placeholder="Search inventories, items…"
						className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border py-1.5 pl-9 pr-3 text-sm focus:ring-1 focus:outline-none"
					/>
				</div>

				{/* Auth controls */}
				<div className="shrink-0">
				{auth.loading ? (
					<Loader2 className="text-muted-foreground size-5 animate-spin" />
				) : auth.user ? (
						<UserMenu />
					) : (
						<LoginDropdown />
					)}
				</div>
			</div>
		</header>
	);
};

export default Navbar;