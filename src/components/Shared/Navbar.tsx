import { Link } from "react-router-dom"
import { Search, Loader2, Languages, Users } from "lucide-react"
import useAuth from "@/Hooks/useAuth"
import LoginDropdown from "./LoginDropdown"
import UserMenu from "./UserMenu"
import { useTranslation } from "react-i18next"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/providers/LanguageProvider"

const Navbar = () => {
  const auth = useAuth()
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()

  return (
    <header className="border-b border-border/60 bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
      <div className="mx-12 flex h-14 items-center gap-4 md:mx-24 lg:mx-32">
        {/* Brand */}
        <Link
          to="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-foreground"
        >
          {t("nav.home")}
        </Link>

        {/* Global search */}
        <div className="relative flex flex-1 items-center">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder={t("nav.searchPlaceholder")}
            className="w-full rounded-md border border-input bg-background py-1.5 pr-3 pl-9 text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none"
          />
        </div>

        {/* Admin Link */}
        {auth.user?.isAdmin && (
          <Link
            to="/admin/users"
            className="text-sm font-medium transition-colors hover:text-foreground flex items-center gap-1 text-black border border-gray-200 p-1 rounded"
          >
            <Users className="size-5" />
						<p>User Management</p>
          </Link>
        )}

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
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : auth.user ? (
            <UserMenu />
          ) : (
            <LoginDropdown />
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
