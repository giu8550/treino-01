import React from "react";
// Importação Default (Sem chaves) - Essencial para evitar o erro de 'Attempted import error'
import HeroContent from "../sub/hero-content";

export const Hero = () => {
    return (
        <div className="relative flex flex-col h-full w-full">
            <HeroContent />
        </div>
    );
};

export default Hero;