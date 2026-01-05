"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    en: {
        translation: {
            navbar: { about: "About Us", homework: "Homework", workstation: "Research Lab", study_rooms: "Study Rooms" },
            homework: {
                study_title: "Study Files",
                add_files: "Add or Drag PDF",
                citations_title: "AI Citations",
                reload: "Reload",
                save_all: "Save All",
                citations_empty: "Waiting for citation synthesis...",
                videos_title: "Videos",
                paste_link: "Paste YouTube Link",
                suggest: "IA Suggest",
                chat_header: "Research Insights",
                chat_placeholder: "Interact with the desk...",
                status_typing: "Agent generating notes...",
                status_digesting: "Digesting Document"
            },
        }
    },
    pt: {
        translation: {
            navbar: { about: "Sobre Nós", homework: "Estudo Dirigido", workstation: "Laboratório de Pesquisa", study_rooms: "Salas de Estudo" },
            homework: {
                study_title: "Arquivos de Estudo",
                add_files: "Adicionar ou Arrastar PDF",
                citations_title: "Citações de IA",
                reload: "Recarregar",
                save_all: "Salvar Tudo",
                citations_empty: "Aguardando síntese de citações...",
                videos_title: "Vídeos",
                paste_link: "Colar Link do YouTube",
                suggest: "Sugerir via IA",
                chat_header: "Insights de Pesquisa",
                chat_placeholder: "Interagir com a mesa...",
                status_typing: "Agente gerando anotações...",
                status_digesting: "Digerindo Documento"
            },
        }
    }
    // ... adicione os outros idiomas conforme o código anterior
};

if (!i18n.isInitialized) {
    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources,
            fallbackLng: "en",
            interpolation: { escapeValue: false },
            react: { useSuspense: false } // Crucial para não quebrar o Next.js
        });
}

export default i18n;