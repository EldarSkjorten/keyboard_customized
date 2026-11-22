# Utviklingsnotater (overlevering til nye samtaler)

Les denne først i en ny samtale. Den oppsummerer hva som finnes, hvorfor, og hva som er neste.

## Hva og hvorfor

Nettpiano for iPad (iPad Pro 11", 2. gen., iPadOS 27, Stage Manager, speilet til ekstern skjerm), brukt live i
presentasjoner for lærere (musikkpedagogikk: hvordan elever kan lage enkle melodier – motiv, repetisjon, variasjon).
Lyden må kunne blandes med andre apper (Bilder, Musikk).

## Sider, mapper og grener

| Adresse | Mappe | Status |
|---|---|---|
| …/keyboard_customized/ | rot (`index.html`, `sw.js`, `manifest.webmanifest`, `samples/`, `icons/`) | **Hovedversjonen 0.4. Stabil. Ikke endre uten at brukeren ber om det.** |
| …/beta/ | `beta/` | Kopi av 0.4 (egne innstillinger) så et gammelt Hjem-skjerm-ikon virker. Kan slettes når brukeren sier fra. |
| …/visuell/ | `visuell/` | Piano + pads + visningsfelt. «Det enkleste som funker» til presentasjonen. |
| …/sandkasse/ | `sandkasse/` | Eksperimenter. Nye ideer prøves her før de ev. flyttes til `visuell/`. |

Grener: `main` (publiseres via GitHub Pages fra roten), `stabil-v0.4` og `stabil-v0.1` (tilbakefallspunkter; proxyen
stopper tag-push, derfor grener), `visuell`, `sandkasse`, `pads` (historisk).
Arbeidsmåte: jobb på egen gren, test, og spol `main` fram. Sjekk at roten er urørt: `git diff --stat stabil-v0.4 main`.

## Tekniske hovedpunkter

- Én HTML-fil per side, ingen byggesteg. Web Audio; `navigator.audioSession.type = 'ambient'` (blandes med andre apper).
- Piano: Salamander-samples (30 MP3 i `samples/`). Pads: syntese (PeriodicWave, filtre, LFO), kryssfade ved bytte.
- `sw.js` i roten styrer også undermappene: sider hentes fra nettet først (4 s tidsavbrudd), lyder fra lageret først.
- Hver side har egne lagernøkler: `piano.settings.v1` (rot), `piano.settings.beta.v1`, `piano.settings.visuell.v1`,
  `piano.settings.sandkasse.v1`; linjer: `piano.visuell.rows.v1`, `piano.sandkasse.rows.v1`;
  melodier: `piano.sandkasse.melodies.v1`; bilder (IndexedDB): `piano-visuell`, `piano-sandkasse`.
- Navn: norsk H, engelsk Bb. Transponering +4 som standard. Visningsfeltet viser tangentnavn (ikke transponert).
- Brukeren spiller ofte G–F (to + to svarte tangenter), derfor er C-tangentene grå.

## Visningsfeltet (`Vis`-modulen i visuell/ og sandkasse/)

- Linjer: `{ id, t0, label: null | { p: del-id, k: 'o' | 'r' | 'v' }, notes: [{ midi, t, held }] }`
  (o = første gang, r = repetisjon, v = variasjon). Delene ligger i `S.dParts` (`{ id, name, color }`).
- Farger (`PART_COLORS`): første gang = farge, repetisjon = samme farge blekere, variasjon = striper.
- Tonehøyde: diatonisk trinn per hvite tangent (`staffPos`); ♯ står på tonen under, ♭ på tonen over.
- Vannrett: fast skala (`step * 12` px/s) som bare krymper i trinn på 1,25 når den lengste linjen ikke får plass.
- «Angre» bruker øyeblikksbilder; etter Angre/Frys/ny lasting starter neste tone alltid en ny linje (`fresh`).

## Testing

Se `tester/README.md` (Playwright; lokal server på port 8123 fra repo-roten).

## Ideer (vurdert, ikke laget)

1. Eksport/import av melodier som fil, for å flytte mellom Safari, Hjem-skjerm-app og enheter. Anbefalt neste steg hvis Melodier brukes.
2. Trykk på en linje for å høre den igjen (tidene er lagret, så dette er enkelt).
3. Rette opp rytmen (kvantisering): penere bilder, men skjuler ekte spill. Bør være et valg.
4. Eget visningsvindu på ekstern skjerm (BroadcastChannel mellom to vinduer). Krever utvidet skjerm, ikke speiling.
5. G-nøkkel-tegn ved notelinjene.
6. Fra før: glissando-innstilling, grunntone i pianoet ved pad-anslag, egne akkorder, «hold»-modus for pads.
7. Frarådet: lagre «Spill» som PNG til «Bilder». «Melodier» gjør det samme og kan endres.

## Om brukeren

Svar på norsk, kort og oversiktlig. Nummerer spørsmål og gjenbruk merkene fra samtalen (P, S, V, D …).
Ta ikke med alle ideer bare fordi de nevnes; vei nytte mot stabilitet og brukervennlighet.
