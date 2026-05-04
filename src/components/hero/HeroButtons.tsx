// src/components/hero/HeroButtons.tsx — themed nav cards for the home page hero
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeroNavItem {
  path: string;
  label: string;
  variant?: "default" | "accent";
}

const navItems: HeroNavItem[] = [
  { path: "/composition/manuscript", label: "Research" },
  { path: "/composition/data", label: "Evidence" },
  { path: "/composition/copyright", label: "Copyright Notifications" },
  { path: "/videos", label: "Video Evidence" },
  { path: "/kirchner-v-ellison", label: "Kirchner v. Ellison" },
  { path: "/kirchner-v-johnson", label: "Kirchner v. Johnson et al." },
  { path: "/kirchner-v-acosta", label: "Kirchner v. Acosta" },
  { path: "/scotus-shadow-docket", label: "SCOTUS Shadow Docket Analysis", variant: "accent" },
];

export const HeroButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 flex-wrap">
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant="outline"
          onClick={() => navigate(item.path)}
          className={cn(
            "group relative w-[300px] py-7 text-lg font-medium rounded-xl",
            "transition-all duration-300",
            "shadow-sm hover:shadow-md",
            item.variant === "accent"
              ? "border-2 border-primary/40 text-foreground hover:bg-primary/5 hover:border-primary/60"
              : "border border-border bg-card text-foreground hover:bg-secondary"
          )}
        >
          <span className="relative">{item.label}</span>
        </Button>
      ))}
    </div>
  );
};
