import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import useAuth from "@/Hooks/useAuth";

/** Returns up to two uppercase initials from a display name. */
const getInitials = (name: string) =>
	name
		.split(" ")
		.slice(0, 2)
		.map((n) => n[0]?.toUpperCase() ?? "")
		.join("");

const UserMenu = () => {
	const auth = useAuth();
	const user = auth.user;

	if (!user) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className="size-9 cursor-pointer">
					<AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="flex flex-col gap-0.5">
					<span className="font-medium">{user.displayName}</span>
					<span className="text-muted-foreground text-xs font-normal">
						{user.email}
					</span>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="cursor-pointer gap-2 text-destructive focus:text-destructive"
					onSelect={() => auth.logout()}
				>
					<LogOut className="size-4" />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default UserMenu;
