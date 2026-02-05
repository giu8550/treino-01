import Image from "next/image";
import MenuNavigation from "@/components/sub/MenuNavigation";
import StarBackground from "@/components/main/star-background"; 
import GameHint from "src/components/ui/game-hint";

export default function HeroPage() {
  return (
    <main className="w-full min-h-screen flex justify-start items-start relative px-4 md:pl-20 py-12 overflow-hidden bg-white dark:bg-[#05080a] transition-colors duration-700">
      
      {/* BACKGROUND DE ESTRELAS (ATRÁS DE TUDO) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <StarBackground />
      </div>

      {/* IMAGEM LATERAL (MODO SSR) */}
      <div className="absolute -right-80 top-20 bottom-0 w-[85vw] max-w-none pointer-events-none z-10 hidden lg:block overflow-hidden">
        <Image 
          src="/assets/computer.png" 
          alt="Workstation Image" 
          fill
          className="object-right object-top object-contain opacity-95"
          priority
        />
      </div>

      {/* CONTEÚDO PRINCIPAL (Z-20 PARA FICAR ACIMA DO BACKGROUND) */}
      <div className="flex flex-col items-start z-20">
        <MenuNavigation />

        <div className="mt-4 w-full max-w-[480px]">
          <GameHint 
            isVisible={true} 
            hints={[
              "DICA: Explore as opções para mudar o idioma do sistema.",
              "DICA: Cada classe de acesso possui ferramentas únicas.",
              "DICA: Conecte sua conta para habilitar o salvamento em nuvem."
            ]} 
          />
        </div>
      </div>
    </main>
  );
}