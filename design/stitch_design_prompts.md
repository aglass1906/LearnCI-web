# Google Stitch Design Prompts: LearnCI Web Portal Redesign

This document contains a complete registry of high-fidelity, copy-pasteable prompts to feed into **Google Stitch** (`stitch.withgoogle.com`). These prompts are designed to generate the entire UI suite of the redesigned **LearnCI-web** portal, ensuring visual coherence, structural consistency, and strict adherence to our **Premium Dark Mode Glassmorphic** design system.

---

## Part 1: Design System Context (The "System Prompt")
*Use this context prompt as the initial instruction in your Google Stitch workspace to establish the global styling rules before generating individual screens.*

> **Global Design System Context:**
> You are designing a premium language acquisition platform called **LearnCI** (Comprehensible Input). The visual theme is **Premium Dark Mode with Glassmorphism**. Apply the following tokens across all screens:
> *   **Background Canvas:** Deep navy/charcoal (`#161925`) with subtle dark blue diagonal gradients (`#0D1B2A` to `#1B263B`).
> *   **Surfaces:** Semi-transparent glass cards (`backdrop-blur-md bg-white/5 border-white/10`) with thin, light-emitting borders. Interactive cards brighten their borders on hover.
> *   **Primary Accents:** Glowing Gold/Fire (`#FFA000`) for active states, primary CTAs, and highlighted selections.
> *   **Secondary Accents:** Neon Teal (`#00E5FF`) for completed items, progress rings, and tags.
> *   **Gradients:** Deep royal blue/purple (`#3861FB`) for glowing background backlights and progress indicators.
> *   **Typography:** Google Fonts: **Outfit** for prominent titles and display headers, **Lexend** (uppercase, wide letter-spacing) for tags and category labels, and **Inter** for readable body text, paragraphs, and descriptions.
> *   **Layout:** Responsive grid structures, rounded corners (`border-radius: 12px` for cards, `10px` for bubbles, `8px` for buttons), and absolutely no surrounding laptop/device frames.

---

## Part 2: Public & Authentication Screens

### 1. High-Converting Landing Page (`/`)
> **Stitch Prompt:**
> *Generate a high-converting, premium marketing landing page for LearnCI. The background is a deep navy-charcoal canvas with glowing purple and cyan backlights. At the top, include a glassmorphic header with the LearnCI logo on the left and a prominent "Sign In" button on the right. In the hero section, place a large bold heading in Outfit typography: "Master Languages via Comprehensible Input" using a gold-to-purple text gradient. Below it, add a description paragraph in Inter, followed by two call-to-action buttons: a primary glowing gold button saying "Start Learning in Your Browser" and a secondary glassmorphic button saying "Download on App Store". Under the buttons, show a row of overlapping user avatar thumbnails with the text "Join 10,000+ fluent learners". Below the hero, add a three-column grid showing features (Stories, Podcasts, YouTube TV) as glassmorphic cards.*

### 2. Unified Auth Portal (`/login` & `/signup`)
> **Stitch Prompt:**
> *Generate a unified authentication screen featuring a login and signup card. The background is a deep dark diagonal gradient. In the center, place an elegant, floating glassmorphic card with a thin white-opacity border. The card has tab buttons at the top: "Sign In" and "Create Account". Below the tabs, include clean input fields for Email and Password. The input fields are semi-transparent dark boxes with subtle borders that glow teal when focused. Include a prominent, glowing gold button for submit action and a "Sign In with Google" button with the Google logo. Add a "Forgot Password?" link at the bottom.*

### 3. Secure Password Recovery (`/reset-password`)
> **Stitch Prompt:**
> *Generate a secure password recovery screen. In the center of a deep navy canvas, place a glassmorphic card with a lock icon in glowing gold at the top. The card displays a title "Reset Your Password" in Outfit bold. It includes a text field for "Enter your email address" and a gold "Send Recovery Link" button. Show a success state overlay representing a green glass banner: "Recovery email sent! Check your inbox."*

---

## Part 3: Learner Experience Screens

### 4. Learner Dashboard (`/portal`)
> **Stitch Prompt:**
> *Generate the primary learner dashboard portal. At the top, place a glassmorphic header with navigation tabs: Dashboard, Stories, Vocab SRS, and Watch TV, and a user profile avatar on the right. The page contains a three-column grid:
> 1. Column 1 (Streak): A card displaying a large gold number "7" with a glowing flame icon, labeled "7 Days Streak!" in Outfit, and a mini bar chart representing days of the week.
> 2. Column 2 (Progress): A card featuring a large SVG circular progress ring in neon teal showing 65% completion, with text labels showing "48 Hours Learned", "1.8h Daily Average", and "B2 Level".
> 3. Column 3 (Active Stories): A card displaying a list of two active stories the user is currently reading, showing thumbnail covers, titles, and reading progress bars (e.g., "60% completed").*

### 5. Learner Library Catalog & Resource Browser (`/portal/stories`)
> **Stitch Prompt:**
> *Generate the Comprehensible Input library catalog. Below the header, show a filter bar containing glassmorphic dropdown selectors for Language (Spanish, French, Japanese) and Level (A1 to C2). On the right, show a search bar. Below the filter bar, display a 3-column grid of Story Cards. Each card has a cover art image with a gradient bottom fade, an uppercase level tag (e.g., "SPANISH B1") in a Lexend badge, a bold title in Outfit, a short description, and a bottom row showing "3 Chapters • 18 Mins" with a glowing teal "PLAY" button.*

### 6. Interactive Story Player & Prose Presenter (`/portal/stories/[id]`)
> **Stitch Prompt:**
> *Generate the interactive story player in Prose Mode (StoryBookPresenter). At the top, show a back button, a large landscape story cover art, and a title "El Gran Escape" in Outfit bold. Below it, show a glassmorphic chapter intro card with an italicized thematic quote in Spanish and English. In the main area, place a large glass card displaying story prose. A few words (like "estaba", "dormía") are highlighted in glowing gold to represent synchronized audio playback. On the right side, show a "Vocabulary Lookup" sidebar panel containing definitions, grammar tags, and an "+ Add to SRS" gold button. At the bottom, place a persistent floating audio player dock containing a waveform progress bar, time stamps, playback speed controls (0.8x to 1.5x), and a play/pause button.*

### 7. Interactive Comic Presenter (`/portal/stories/[id]?layout=comic`)
> **Stitch Prompt:**
> *Generate the story player in Comic Book Mode (ComicBookPresenter). The screen features a responsive grid of four comic panels showing high-fidelity AI-generated scene illustrations. Each panel has a semi-transparent dialogue bubble overlay. The dialogue bubbles have a white background, black text, and a bold gold character name badge (e.g., "CARLOS") at the top. At the bottom of the screen, place the persistent floating audio control bar synchronized with the active comic panel.*

### 8. Dialogue speech bubble presenter (`/portal/stories/[id]?layout=bubbles`)
> **Stitch Prompt:**
> *Generate the story player in Conversational Dialogue Mode (InteractiveBookPresenter). The screen displays a vertical scroll of speech bubbles representing a conversation between two characters. Left-aligned bubbles represent Character A (Teal accent name badge), and right-aligned bubbles represent Character B (Gold accent name badge). The bubbles are styled as soft glassmorphic panels with high-contrast text. At the bottom of the screen, show the persistent audio controller cockpit.*

### 9. Vocabulary SRS Flashcards (`/portal/review`)
> **Stitch Prompt:**
> *Generate the vocabulary spaced repetition study screen. The top has a card showing progress: "7/20 Cards Reviewed" with a teal progress bar. In the center, place a large 3D flip card with a glassmorphic surface and a thin teal border. The front of the card displays the word "el guarda" in 4xl Outfit bold typography with the label "[Noun / Masculine]". The back of the card (shown side-by-side or as flipped) displays the definition "the guard / sentinel" in gold, followed by an example sentence: "El guarda dormía plácidamente." and its English translation. Below the card, place a row of four spaced repetition action buttons: "Again" (red border), "Hard" (orange border), "Good" (solid green, glowing), and "Easy" (teal border) with review intervals (1m, 12h, 3d, 7d) displayed below each.*

### 10. Vocabulary Game Center (`/portal/games`)
> **Stitch Prompt:**
> *Generate the vocabulary games catalog. The screen displays a grid of game cards for our 4 vocabulary games:
> 1. Memory: Card showing flip-tiles with target words and definitions.
> 2. WordRain: Card showing falling word bubbles in the target language that the user must match to translations at the bottom.
> 3. Linker: Card showing two columns of vocabulary words (Spanish on left, English on right) with glowing connector lines linking matched pairs.
> 4. WordCrush: Card showing a letter grid representing a word search game.
> Each game card is a glassmorphic container with a unique glowing neon icon, game title, high-score badge, and a gold "Play Game" button.*

### 11. Podcast Hub & Episode Player (`/portal/podcasts`)
> **Stitch Prompt:**
> *Generate the podcast listening portal. The screen is split into a two-column layout. The left column shows a grid of Podcast Shows featuring show cover art, titles, host names, and episode counts. The right column displays the active Episode Player showing the selected episode cover, host descriptions, and a scrollable transcript box. The transcript highlights the active line in glowing gold as the hosts speak, with clear speaker badges separating the conversation. At the bottom, place the persistent audio cockpit with playback speed selectors.*

### 12. YouTube Immersion Center (`/portal/watch`)
> **Stitch Prompt:**
> *Generate the integrated YouTube Immersion Center. The top header shows a status widget: "Logged Today: 15 Mins" in Lexend. The main layout features an embedded video player in focus mode (dimmed surrounding elements) showing an intermediate Spanish travel vlog. On the right, display a list of recommended videos as horizontal glass cards showing thumbnail previews, titles, channel names, and difficulty levels (e.g., "A2 Elementary"). Below the video player, show a progress log widget indicating how many minutes are being tracked and synced to the user's dashboard.*

### 13. Learner Profile & Account Settings (`/portal/profile`)
> **Stitch Prompt:**
> *Generate the user profile settings dashboard. The screen features a glassmorphic form card containing sections for:
> 1. Target Language: Dropdown selector showing Spanish, French, German, Italian, Portuguese, Mandarin.
> 2. Comprehension Level: Slider or selector showing levels A1 to C2.
> 3. Personalization: Selectors for TTS voice gender (Male/Female) and default playback speed.
> 4. Account Credentials: Form fields to change email, update password, and manage linked Google account status.
> At the bottom, place a solid teal "Save Profile Settings" button and a red-bordered "Sign Out" button.*

---

## Part 4: Administrative & Operator Screens

### 14. Site Admin Metrics Dashboard (`/admin`)
> **Stitch Prompt:**
> *Generate the master Site Administrator dashboard. At the top, place a navigation bar to switch between Pipeline, Stories, Database, and Users. The dashboard displays a grid of four statistical cards:
> 1. Total Registered Users: Showing user count and a list of level distributions (e.g., "A1: 450, B2: 1200").
> 2. Mindset Logs: Showing average daily mood rating (e.g., "4.2 / 5.0") and a mood distribution bar chart.
> 3. Learning Activities: Showing total logged minutes (e.g., "240,500 mins") and a breakdown of activity types (Stories, Podcasts, Videos).
> 4. Database Resources: Showing total catalog assets and status distributions.
> The UI is highly analytical, clean, and styled in the dark glassmorphic design system.*

### 15. Admin 7-Phase Draft Pipeline Workspace (`/admin/pipeline/[draftId]`)
> **Stitch Prompt:**
> *Generate the data-centric 7-Phase creator pipeline workspace. The screen features a left-side navigation rail representing the 7 stages (Idea, Script, Arts Forge, Optimizer, Layout, Post-Prod, Publish). The main area displays:
> 1. At the top: A raw database table row viewer showing metadata for the active draft.
> 2. In the center: A split-pane container. The left pane is an interactive JSON Schema Editor showing the draft's "scene_breakdown_json" with syntax highlighting. The right pane is a GenAI Prompt Console displaying the exact "System Prompt" and "User Prompt" text areas used by the AI edge functions, with custom model parameters.
> 3. At the bottom: An Edge Function Trigger cockpit containing manual buttons for "Generate Script", "Forge Cover Art", and "Generate Timings" alongside a live terminal log terminal showing Deno console outputs. All cards are semi-transparent glass panels with thin borders.*

### 16. Live Stories Database Cockpit (`/admin/stories`)
> **Stitch Prompt:**
> *Generate the administrative live stories manager. The screen displays a dense database table representing the "stories" table. Columns show Story ID, Title, Language, Level, Chapters, Cover Art Path, and Video Path. Each row contains quick-action buttons: "Edit JSON", "Update Media Paths", and "Clone to Draft Pipeline". When "Edit JSON" is clicked, a glassmorphic modal overlays the screen containing a structured JSON editor allowing direct modification of story schemas. The header includes a search input and a filter dropdown for languages.*

### 17. Admin Learning Resources Manager (`/admin/database`)
> **Stitch Prompt:**
> *Generate the admin learning resources manager. The screen displays an administrative data grid to manage rows in the "learning_resources" table (curated YouTube videos, channels, and external links). It displays fields for Type, Title, URL, Language, Difficulty, and Status (Active/Muted) with inline toggles to publish or mute links, and text inputs to modify URLs and metadata directly. At the top, show a "Add New Resource" button that opens a card with input fields.*

### 18. Admin User & Activity Audit Center (`/admin/users`)
> **Stitch Prompt:**
> *Generate the user audit console. The screen displays a dual-pane layout. The left pane shows a list of registered users with search filters. When a user is selected, the right pane displays their detailed profile, a log of their recent activity rows (displaying activity type, minutes logged, and timestamp), a checklist of completed milestone check-ins, and a list of daily mindset feedbacks containing mood ratings and raw text entries. All panels are styled in the dark glassmorphic theme.*
