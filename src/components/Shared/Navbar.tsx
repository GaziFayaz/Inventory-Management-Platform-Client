import { Link } from "react-router-dom";
import { Search, Loader2, Languages } from "lucide-react";
import useAuth from "@/Hooks/useAuth";
import LoginDropdown from "./LoginDropdown";
import UserMenu from "./UserMenu";
import { useTranslation } from "react-i18next";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/LanguageProvider";

const Navbar = () => {
	const auth = useAuth();
	const { t } = useTranslation();
	const { language, setLanguage } = useLanguage();

	return (
		<header className="border-border/60 bg-background/95 supports-backdrop-filter:bg-background/80 border-b backdrop-blur-sm">
			<div className="mx-12 flex h-14 items-center gap-4 md:mx-24 lg:mx-32">
				{/* Brand */}
				<Link
					to="/"
					className="text-foreground shrink-0 text-lg font-semibold tracking-tight"
				>
					{t("nav.home")}
				</Link>

				{/* Global search */}
				<div className="relative flex flex-1 items-center">
					<Search className="text-muted-foreground pointer-events-none absolute left-3 size-4" />
					<input
						type="search"
						placeholder={t("nav.searchPlaceholder")}
						className="border-input bg-background placeholder:text-muted-foreground focus:ring-ring w-full rounded-md border py-1.5 pl-9 pr-3 text-sm focus:ring-1 focus:outline-none"
					/>
				</div>

				{/* Auth controls */}
				<div className="flex shrink-0 items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm" className="gap-1.5">
								<Languages className="size-4" />
								{language.toUpperCase()}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-44">
							<DropdownMenuLabel>{t("nav.language")}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="cursor-pointer"
								onSelect={() => setLanguage("en")}
							>
								{t("language.en")}
								{language === "en" ? " ✓" : ""}
							</DropdownMenuItem>
							<DropdownMenuItem
								className="cursor-pointer"
								onSelect={() => setLanguage("es")}
							>
								{t("language.es")}
								{language === "es" ? " ✓" : ""}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
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