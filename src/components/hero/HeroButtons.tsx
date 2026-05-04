// src/components/hero/HeroButtons.tsx - Updated navigation

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const HeroButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-center gap-6 flex-wrap">
      <Button
        variant="outline"
        className="group relative w-[300px] bg-black/50 backdrop-blur-md border-2 border-white/20 text-white
                 hover:bg-black/60 hover:border-white/30 transition-all duration-300 py-7 text-lg font-medium
                 rounded-lg overflow-hidden"
        onClick={() => navigate("/composition/manuscript")}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transform
                      group-hover:scale-105 transition-transform duration-500"/>
        <span className="relative">Research</span>
      </Button>

      <Button
        variant="outline"
        className="group relative w-[300px] bg-black/50 backdrop-blur-md border-2 border-white/20 text-white
                 hover:bg-black/60 hover:border-white/30 transition-all duration-300 py-7 text-lg font-medium
                 rounded-lg overflow-hidden"
        onClick={() => navigate("/composition/data")}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transform
                      group-hover:scale-105 transition-transform duration-500"/>
        <span className="relative">Evidence</span>
      </Button>

      <Button
        variant="outline"
        className="group relative w-[300px] bg-black/50 backdrop-blur-md border-2 border-white/20 text-white
                 hover:bg-black/60 hover:border-white/30 transition-all duration-300 py-7 text-lg font-medium
                 rounded-lg overflow-hidden"
        onClick={() => navigate("/composition/copyright")}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transform
                      group-hover:scale-105 transition-transform duration-500"/>
        <span className="relative">Copyright Notifications</span>
      </Button>

      <Button
        variant="outline"
        className="group relative w-[300px] bg-black/50 backdrop-blur-md border-2 border-white/20 text-white
                 hover:bg-black/60 hover:border-white/30 transition-all duration-300 py-7 text-lg font-medium
                 rounded-lg overflow-hidden"
        onClick={() => navigate("/videos")}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transform
                      group-hover:scale-105 transition-transform duration-500"/>
        <span className="relative">Video Evidence</span>
      </Button>

      <Button
        variant="outline"
        className="group relative w-[300px] bg-black/50 backdrop-blur-md border-2 border-white/20 text-white
                 hover:bg-black/60 hover:border-white/30 transition-all duration-300 py-7 text-lg font-medium
                 rounded-lg overflow-hidden"
        onClick={() => navigate("/kirchner-v-ellison")}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transform
                      group-hover:scale-105 transition-transform duration-500"/>
        <span className="relative">Kirchner v. Ellison</span>
      </Button>

      <Button
        variant="outline"
        className="group relative w-[300px] bg-black/50 backdrop-blur-md border-2 border-white/20 text-white
                 hover:bg-black/60 hover:border-white/30 transition-all duration-300 py-7 text-lg font-medium
                 rounded-lg overflow-hidden"
        onClick={() => navigate("/kirchner-v-johnson")}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transform
                      group-hover:scale-105 transition-transform duration-500"/>
        <span className="relative">Kirchner v. Johnson et al.</span>
      </Button>

      <Button
        variant="outline"
        className="group relative w-[300px] bg-black/50 backdrop-blur-md border-2 border-white/20 text-white
                 hover:bg-black/60 hover:border-white/30 transition-all duration-300 py-7 text-lg font-medium
                 rounded-lg overflow-hidden"
        onClick={() => navigate("/kirchner-v-acosta")}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent transform
                      group-hover:scale-105 transition-transform duration-500"/>
        <span className="relative">Kirchner v. Acosta</span>
      </Button>

      <Button
        variant="outline"
        className="group relative w-[300px] bg-black/50 backdrop-blur-md border-2 border-amber-500/40 text-white
                 hover:bg-amber-950/30 hover:border-amber-400/50 transition-all duration-300 py-7 text-lg font-medium
                 rounded-lg overflow-hidden"
        onClick={() => navigate("/scotus-shadow-docket")}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent transform
                      group-hover:scale-105 transition-transform duration-500"/>
        <span className="relative">SCOTUS Shadow Docket Analysis</span>
      </Button>
    </div>
  );
};
