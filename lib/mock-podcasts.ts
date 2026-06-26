export interface TranscriptSegment {
    start: number;
    end: number;
    speaker: string;
    textTarget: string;
    textEnglish: string;
    avatarUrl?: string;
}

export interface PodcastEpisode {
    id: string;
    episodeNumber: string;
    title: string;
    description: string;
    duration: string;
    durationSeconds: number;
    level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    audioUrlPath: string; // Storage path in audio-stories bucket
    transcript: TranscriptSegment[];
}

export interface PodcastShow {
    id: string;
    title: string;
    host: string;
    description: string;
    coverUrl: string;
    hostAvatarUrl: string;
    episodes: PodcastEpisode[];
}

// Host Avatars using curated public unsplash links for high-fidelity dark aesthetics
const HOST_CLARA_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop";
const HOST_DIEGO_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop";
const HOST_SOFIA_AVATAR = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop";

// Curated dark glassmorphic show covers using public unsplash design assets
const COVER_MIDNIGHT_LOUNGE = "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=400&auto=format&fit=crop";
const COVER_CHARLAS_URBANAS = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop";
const COVER_MISTERIOS = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop";

export const mockPodcasts: PodcastShow[] = [
    {
        id: "midnight-lounge",
        title: "The Midnight Lounge",
        host: "Clara Vernet",
        description: "An intimate, late-night discussion exploring modern culture, linguistic shifts, and everyday philosophy in natural, flowing Spanish.",
        coverUrl: COVER_MIDNIGHT_LOUNGE,
        hostAvatarUrl: HOST_CLARA_AVATAR,
        episodes: [
            {
                id: "midnight-lounge-ep1",
                episodeNumber: "EPISODE 01",
                title: "Ciudades Futuras y Evolución del Idioma",
                description: "Join Clara and special guest Dr. Aris Thorne as they discuss how density in modern megacities accelerates linguistic changes and slang.",
                duration: "0:45",
                durationSeconds: 45,
                level: "INTERMEDIATE",
                // Uses Chapter 1 Intro Audio from storage
                audioUrlPath: "80daa84b-ef60-4a2f-ad90-612d1ac77b39/3570deac-223e-4525-9b23-0fbf424115ad/audio/chapter_01_scene_01_intro.mp3",
                transcript: [
                    {
                        start: 0.0,
                        end: 8.0,
                        speaker: "Clara",
                        avatarUrl: HOST_CLARA_AVATAR,
                        textTarget: "¡Hola a todos! Bienvenidos a The Midnight Lounge. Hoy tenemos un tema apasionante sobre las ciudades del futuro y la evolución de nuestro idioma.",
                        textEnglish: "Hello everyone! Welcome to The Midnight Lounge. Today we have an exciting topic about the cities of the future and the evolution of our language."
                    },
                    {
                        start: 8.0,
                        end: 17.0,
                        speaker: "Dr. Aris",
                        avatarUrl: HOST_DIEGO_AVATAR,
                        textTarget: "Gracias Clara. Es fantástico estar aquí. Sí, estamos analizando cómo el crecimiento urbano masivo está acelerando cambios lingüísticos sin precedentes.",
                        textEnglish: "Thanks Clara. It's fantastic to be here. Yes, we are analyzing how massive urban growth is accelerating unprecedented linguistic changes."
                    },
                    {
                        start: 17.0,
                        end: 26.0,
                        speaker: "Clara",
                        avatarUrl: HOST_CLARA_AVATAR,
                        textTarget: "Es fascinante. He notado que en las grandes capitales como Madrid o Buenos Aires, surgen nuevas palabras y modismos casi cada mes.",
                        textEnglish: "It's fascinating. I've noticed that in big capitals like Madrid or Buenos Aires, new words and idioms emerge almost every month."
                    },
                    {
                        start: 26.0,
                        end: 35.0,
                        speaker: "Dr. Aris",
                        avatarUrl: HOST_DIEGO_AVATAR,
                        textTarget: "Exacto. La densidad poblacional y la interacción digital constante crean pequeños ecosistemas de jerga que luego se expanden rápidamente.",
                        textEnglish: "Exactly. Population density and constant digital interaction create small slang ecosystems that later expand rapidly."
                    },
                    {
                        start: 35.0,
                        end: 45.0,
                        speaker: "Clara",
                        avatarUrl: HOST_CLARA_AVATAR,
                        textTarget: "Increíble. Bueno, queridos oyentes, relájense, preparen su café y disfruten de esta inmersión lingüística en nuestro rincón nocturno.",
                        textEnglish: "Incredible. Well, dear listeners, relax, prepare your coffee, and enjoy this linguistic immersion in our night corner."
                    }
                ]
            },
            {
                id: "midnight-lounge-ep2",
                episodeNumber: "EPISODE 02",
                title: "Encuentros Inesperados",
                description: "Clara and Dr. Aris delve into the psychology of chance encounters and how high-stress scenarios trigger faster language learning.",
                duration: "0:30",
                durationSeconds: 30,
                level: "INTERMEDIATE",
                // Uses Chapter 2 Intro Audio from storage
                audioUrlPath: "80daa84b-ef60-4a2f-ad90-612d1ac77b39/3570deac-223e-4525-9b23-0fbf424115ad/audio/chapter_02_scene_01_intro.mp3",
                transcript: [
                    {
                        start: 0.0,
                        end: 7.0,
                        speaker: "Clara",
                        avatarUrl: HOST_CLARA_AVATAR,
                        textTarget: "Bienvenidos de nuevo. En el episodio de hoy de The Midnight Lounge, nos adentramos en el misterio de los encuentros inesperados.",
                        textEnglish: "Welcome back. In today's episode of The Midnight Lounge, we delve into the mystery of unexpected encounters."
                    },
                    {
                        start: 7.0,
                        end: 15.0,
                        speaker: "Dr. Aris",
                        avatarUrl: HOST_DIEGO_AVATAR,
                        textTarget: "Hola Clara. Sí, a veces una sola conversación fortuita en el metro o en una cafetería puede alterar completamente nuestro destino.",
                        textEnglish: "Hello Clara. Yes, sometimes a single chance conversation in the subway or in a coffee shop can completely alter our destiny."
                    },
                    {
                        start: 15.0,
                        end: 23.0,
                        speaker: "Clara",
                        avatarUrl: HOST_CLARA_AVATAR,
                        textTarget: "Cierto, y en términos de adquisición de idiomas, esos momentos de conexión real son donde ocurre la verdadera magia.",
                        textEnglish: "True, and in terms of language acquisition, those moments of real connection are where the true magic happens."
                    },
                    {
                        start: 23.0,
                        end: 30.0,
                        speaker: "Dr. Aris",
                        avatarUrl: HOST_DIEGO_AVATAR,
                        textTarget: "Totalmente de acuerdo. El cerebro se activa de forma diferente cuando hay una necesidad emocional real de comunicarse.",
                        textEnglish: "Totally agree. The brain activates differently when there is a real emotional need to communicate."
                    }
                ]
            }
        ]
    },
    {
        id: "charlas-urbanas",
        title: "Charlas Urbanas",
        host: "Diego Silva",
        description: "Exploring the streets, histories, and social structures of Spain and Latin America, designed to push your vocabulary and listening boundaries.",
        coverUrl: COVER_CHARLAS_URBANAS,
        hostAvatarUrl: HOST_DIEGO_AVATAR,
        episodes: [
            {
                id: "charlas-urbanas-ep1",
                episodeNumber: "EPISODE 01",
                title: "Reuniones Secretas en la Historia",
                description: "Diego explores how underground historical resistance groups met in secret, and how codes shaped the Spanish vocabulary.",
                duration: "0:30",
                durationSeconds: 30,
                level: "ADVANCED",
                // Uses Chapter 3 Intro Audio from storage
                audioUrlPath: "80daa84b-ef60-4a2f-ad90-612d1ac77b39/3570deac-223e-4525-9b23-0fbf424115ad/audio/chapter_03_scene_01_intro.mp3",
                transcript: [
                    {
                        start: 0.0,
                        end: 7.0,
                        speaker: "Diego",
                        avatarUrl: HOST_DIEGO_AVATAR,
                        textTarget: "Hola a todos y bienvenidos a Charlas Urbanas. Hoy examinamos los susurros de la historia: las reuniones secretas.",
                        textEnglish: "Hello everyone and welcome to Charlas Urbanas. Today we examine the whispers of history: secret meetings."
                    },
                    {
                        start: 7.0,
                        end: 15.0,
                        speaker: "Sofía",
                        avatarUrl: HOST_SOFIA_AVATAR,
                        textTarget: "Un tema intrigante, Diego. Los códigos verbales creados por estas organizaciones terminaron enriqueciendo el lenguaje popular.",
                        textEnglish: "An intriguing topic, Diego. The verbal codes created by these organizations ended up enriching popular language."
                    },
                    {
                        start: 15.0,
                        end: 22.0,
                        speaker: "Diego",
                        avatarUrl: HOST_DIEGO_AVATAR,
                        textTarget: "Exacto. El 'jerigonza' o ciertas jergas gremiales del siglo diecinueve comenzaron como métodos de camuflaje de conversaciones.",
                        textEnglish: "Exactly. The 'gibberish' or certain guild jargons of the nineteenth century started as conversation camouflage methods."
                    },
                    {
                        start: 22.0,
                        end: 30.0,
                        speaker: "Sofía",
                        avatarUrl: HOST_SOFIA_AVATAR,
                        textTarget: "Es maravilloso ver cómo la necesidad de ocultar información expande los horizontes creativos de la gramática.",
                        textEnglish: "It's wonderful to see how the need to hide information expands the creative horizons of grammar."
                    }
                ]
            }
        ]
    },
    {
        id: "misterios-corazon",
        title: "Misterios del Corazón",
        host: "Sofía Mendoza",
        description: "A narrative dialogue podcast focusing on character relationships, dramatic setups, and emotional discourse to master conversational nuances.",
        coverUrl: COVER_MISTERIOS,
        hostAvatarUrl: HOST_SOFIA_AVATAR,
        episodes: [
            {
                id: "misterios-corazon-ep1",
                episodeNumber: "EPISODE 01",
                title: "Declaración bajo la Lluvia",
                description: "Sofía and Diego discuss the intense language of romantic confrontations, focus dialogues, and high-frequency emotional verbs.",
                duration: "0:30",
                durationSeconds: 30,
                level: "BEGINNER",
                // Uses Chapter 4 Intro Audio from storage
                audioUrlPath: "80daa84b-ef60-4a2f-ad90-612d1ac77b39/3570deac-223e-4525-9b23-0fbf424115ad/audio/chapter_04_scene_01_intro.mp3",
                transcript: [
                    {
                        start: 0.0,
                        end: 8.0,
                        speaker: "Sofía",
                        avatarUrl: HOST_SOFIA_AVATAR,
                        textTarget: "Bienvenidos a Misterios del Corazón. Hoy analizamos el drama y la pasión: las grandes declaraciones de amor en la literatura.",
                        textEnglish: "Welcome to Misterios del Corazón. Today we analyze drama and passion: the great declarations of love in literature."
                    },
                    {
                        start: 8.0,
                        end: 15.0,
                        speaker: "Diego",
                        avatarUrl: HOST_DIEGO_AVATAR,
                        textTarget: "Hola Sofía. Es fascinante cómo cambia el vocabulario cuando expresamos emociones profundas frente a barreras sociales.",
                        textEnglish: "Hello Sofía. It's fascinating how vocabulary changes when we express deep emotions in the face of social barriers."
                    },
                    {
                        start: 15.0,
                        end: 22.0,
                        speaker: "Sofía",
                        avatarUrl: HOST_SOFIA_AVATAR,
                        textTarget: "Sí. Las palabras se vuelven más intensas y la entonación es crucial. Hoy escucharemos un fragmento de una confrontación clásica.",
                        textEnglish: "Yes. The words become more intense and the intonation is crucial. Today we will listen to a fragment of a classic confrontation."
                    },
                    {
                        start: 22.0,
                        end: 30.0,
                        speaker: "Diego",
                        avatarUrl: HOST_DIEGO_AVATAR,
                        textTarget: "Perfecto. Prestemos mucha atención a los verbos subjuntivos que expresan deseos y dudas en estos diálogos.",
                        textEnglish: "Perfect. Let's pay close attention to the subjunctive verbs that express desires and doubts in these dialogues."
                    }
                ]
            }
        ]
    }
];
