# BOW build plan

## Product direction

Build BOW as a premium, responsive street-dog welfare platform with a warm ivory foundation, deep forest-green actions, restrained warm brown/gold accents, Instrument Serif headlines, and Work Sans interface text. Keep the visual language editorial and cinematic: real street-dog photography, glossy but restrained surfaces, refined borders, soft shadows, and subtle motion.

## Delivery sequence

### 1. Homepage and shared product shell
- Replace the blank home route with the BOW homepage.
- Create the responsive shared header and footer with the requested navigation, desktop actions, and polished mobile menu.
- Add a cinematic dog hero with the BOW message, primary/secondary actions, handwritten accent, impact strip, and visible hint of the next module on small screens.
- Build the six service tiles, report preview, AI analysis preview, community story preview, birthday feeding banner, adoption preview, and rescue command preview using realistic demo data.
- Add accessible interactions: mobile navigation, CTA navigation, report form preview, story/adoption actions, and lightweight hover/focus motion.

### 2. Connected core pages
Create separate TanStack routes with page-specific metadata for:
- `/about` — mission and the See → Report → Understand → Respond → Support → Adopt story.
- `/report` — multi-photo/video upload UI, location capture/manual entry, description, voice report controls, priority-aware AI demo result, explainability, and non-diagnostic disclaimer.
- `/rescue` — command center with case counts, workflow states, recommended case/team decision support, and Ask BOW demo assistant.
- `/community` — editorial feed, rescue stories, before/after recovery timelines, birthday feeding, food donation form, and responsible-food guidance.
- `/adopt` — adoption marketplace, filters/details, compatibility questionnaire, AI-assisted match results, and adoption story timeline.
- `/donate` — food/feeding drive entry points, nearby initiative recommendations, and donation guidance.

### 3. Supporting account views
- Add `/login` and `/profile` as polished prototype screens.
- Keep profile impact, badges, supported stories, reports, and feeding drives populated with demo content.
- Keep all contribution labels clear about submitted, verified, and AI-assisted information.

## Functional prototype behavior

- Use typed shared demo data for cases, dogs, stories, impact metrics, teams, and feeding points so every major view is populated consistently.
- Keep AI behavior mock-backed but shaped behind small service functions so a future vision, speech, or assistant provider can replace the demo without changing the screens.
- Implement browser-only voice capture/transcription affordances as a safe demo interaction unless a real AI service is explicitly connected; never present a diagnosis.
- Make all major buttons navigate to a real route or open a working local interaction; avoid dead-end decorative CTAs.
- Use client-side validation and clear status messaging on report, food, donation, and matching forms.

## Visual implementation

- Extend the existing semantic token system in `src/styles.css` with BOW ivory, forest, brown, gold, surface, and shadow roles; avoid hardcoded component colors.
- Load Instrument Serif and Work Sans through the root route head, respecting the existing TanStack Start setup.
- Generate a cohesive set of cinematic street-dog images for the hero, rescue/story states, feeding, and adoption cards; do not embed the uploaded reference screenshot.
- Use stable responsive grid/flex structures, accessible icon buttons with tooltips, reduced-motion support, and restrained transitions.

## Technical notes

- Preserve TanStack Router and the generated route tree; add route files rather than manual path switching.
- Keep the first milestone frontend-only with mock data so the homepage can ship quickly. If persistence, real login, uploads, maps, or production AI are added, enable Lovable Cloud first and add server-side validation/authentication rather than browser-only storage.
- Add unique `head()` metadata for every content route, including title, description, Open Graph title/description/type, and Twitter card.
- Validate the homepage and key routes at desktop, tablet, and mobile widths, including the mobile menu and report interaction states.
