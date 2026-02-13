
import React from 'react';

import { LanguageCode } from './types';

export const STORY_CATEGORIES: Record<LanguageCode, { label: string; key: string; stories: string[] }[]> = {
  pt: [
    {
      label: "Histórias Bíblicas",
      key: "catBible",
      stories: [
        "Zaqueu, o cobrador de impostos",
        "Noé e a Arca",
        "Davi e o Gigante Golias",
        "Jonas e o Grande Peixe",
        "O Bom Samaritano",
        "O Nascimento de Jesus",
        "A Criação do Mundo",
        "Daniel na Cova dos Leões",
        "Moisés e a Travessia do Mar Vermelho"
      ]
    },
    {
      label: "Cultura Nacional (Visão Bíblica)",
      key: "catCulture",
      stories: [
        "O Carnaval à luz da Bíblia",
        "Festas Juninas e a Palavra de Deus",
        "A importância de brilhar a luz de Jesus"
      ]
    },
    {
      label: "Heróis da Fé e Biografias",
      key: "catBio",
      stories: [
        "João Ferreira de Almeida (Tradução da Bíblia)",
        "John Wesley (O Avivamento)",
        "A Reforma Protestante explicada",
        "Charles Spurgeon (O Príncipe dos Pregadores)",
        "Missionários pioneiros no Brasil"
      ]
    },
    {
      label: "Tema Bíblico",
      key: "catTheme",
      stories: []
    }
  ],
  en: [
    {
      label: "Bible Stories",
      key: "catBible",
      stories: [
        "Zacchaeus the Tax Collector",
        "Noah's Ark",
        "David and Goliath",
        "Jonah and the Big Fish",
        "The Good Samaritan",
        "The Birth of Jesus",
        "The Creation of the World",
        "Daniel in the Lion's Den",
        "Moses and the Red Sea"
      ]
    },
    {
      label: "History & Biographies",
      key: "catBio",
      stories: [
        "John Wesley (The Revival)",
        "The Protestant Reformation",
        "Charles Spurgeon",
        "William Carey (Missions)"
      ]
    },
    {
      label: "Biblical Theme",
      key: "catTheme",
      stories: []
    }
  ],
  es: [
    {
      label: "Historias Bíblicas",
      key: "catBible",
      stories: [
        "Zaqueo, el recaudador de impuestos",
        "El Arca de Noé",
        "David y Goliat",
        "Jonás y el Gran Pez",
        "El Buen Samaritano",
        "El Nacimiento de Jesús",
        "La Creación del Mundo",
        "Daniel en el Foso de los Leones",
        "Moisés y el Mar Rojo"
      ]
    },
    {
      label: "Héroes de la Fe y Biografías",
      key: "catBio",
      stories: [
        "Juan Wesley (El Avivamiento)",
        "La Reforma Protestante",
        "Charles Spurgeon (El Príncipe de los Predicadores)",
        "William Carey (Misiones)"
      ]
    },
    {
      label: "Tema Bíblico",
      key: "catTheme",
      stories: []
    }
  ],
  fr: [
    {
      label: "Histoires Bibliques",
      key: "catBible",
      stories: [
        "Zachée le collecteur d'impôts",
        "L'Arche de Noé",
        "David et Goliath",
        "Jonas et le Grand Poisson",
        "Le Bon Samaritain",
        "La Naissance de Jésus",
        "La Création du Monde",
        "Daniel dans la Fosse aux Lions",
        "Moïse et la Mer Rouge"
      ]
    },
    {
      label: "Héros de la Foi et Biographies",
      key: "catBio",
      stories: [
        "John Wesley (Le Réveil)",
        "La Réforme Protestante",
        "Charles Spurgeon (Le Prince des Prédicateurs)",
        "William Carey (Missions)"
      ]
    },
    {
      label: "Thème Biblique",
      key: "catTheme",
      stories: []
    }
  ],
  it: [
    {
      label: "Storie Bibliche",
      key: "catBible",
      stories: [
        "Zaccheo il pubblicano",
        "L'Arca di Noè",
        "Davide e Golia",
        "Giona e il Grande Pesce",
        "Il Buon Samaritano",
        "La Nascita di Gesù",
        "La Creazione del Mondo",
        "Daniele nella Fossa dei Leoni",
        "Mosè e il Mar Rosso"
      ]
    },
    {
      label: "Eroi della Fede e Biografie",
      key: "catBio",
      stories: [
        "John Wesley (Il Risveglio)",
        "La Riforma Protestante",
        "Charles Spurgeon (Il Principe dei Predicatori)",
        "William Carey (Missioni)"
      ]
    },
    {
      label: "Tema Biblico",
      key: "catTheme",
      stories: []
    }
  ]
};

export const COLORS = {
  purple: '#7c3aed',
  yellow: '#FFD700',
  blue: '#3498db',
  green: '#2ecc71',
  orange: '#e67e22',
  red: '#e74c3c',
  pink: '#fd79a8',
  background: '#fdfaf6',
  card: '#ffffff'
};

export const ICONS = {
  Bible: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.582.477 5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Download: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Star: ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
  Heart: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007-.004-.003-.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  ),
  Close: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};
