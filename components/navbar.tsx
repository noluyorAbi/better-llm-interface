"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Settings, LogOut } from "lucide-react";

interface NavbarProps {
  title?: string;
  titleIcon?: ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  backLabel?: string;
  showMobileMenu?: boolean;
  mobileMenuContent?: ReactNode;
  mobileMenuOpen?: boolean;
  onMobileMenuOpenChange?: (open: boolean) => void;
  rightContent?: ReactNode;
  variant?: "default" | "home";
}

export const Navbar = ({
  title,
  titleIcon,
  showBackButton = false,
  backHref = "/",
  backLabel = "Back",
  showMobileMenu = false,
  mobileMenuContent,
  mobileMenuOpen,
  onMobileMenuOpenChange,
  rightContent,
  variant = "default",
}: NavbarProps) => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const defaultRightContent = (
    <div className="flex items-center gap-3">
      {!loading && (
        <>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-medium hover:opacity-80 transition-opacity">
                  {user.email}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Account</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} variant="destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : variant === "home" ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          ) : null}
        </>
      )}
      <ThemeToggle />
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {showMobileMenu && mobileMenuContent && (
            <Sheet open={mobileMenuOpen} onOpenChange={onMobileMenuOpenChange}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                {mobileMenuContent}
              </SheetContent>
            </Sheet>
          )}
          {showBackButton && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={backHref} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{backLabel}</span>
              </Link>
            </Button>
          )}
          {title && (
            <div className="flex items-center gap-2">
              {titleIcon}
              <span className="text-lg font-semibold">{title}</span>
            </div>
          )}
        </div>
        {rightContent || defaultRightContent}
      </div>
    </header>
  );
};
