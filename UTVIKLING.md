# Utviklingsnotater (overlevering til nye samtaler)

Les denne først i en ny samtale. Den oppsummerer hva som finnes, hvorfor, og hva som er neste.
**Alle ideer og oppgaver står samlet i [`IDEER.md`](IDEER.md)** (nummerert, med vurdering). Start der når vi tar opp arbeidet igjen.

## Status (22. november 2026)

- Brukeren bruker **`visuell/` (0.3.3)** i presentasjonen om noen dager. 0.3 er testet på iPad (T1–T4 OK).
- **Hovedversjonen i roten (0.4, uten visningsfelt) skal beholdes** som den er.
- Sandkassa er ikke testet ennå og bygger på visuell 0.2. Oppdater den med visuell 0.3.3 før neste test (IDEER.md, 2).
- Neste runde (kanskje om noen uker): gå gjennom IDEER.md sammen med brukeren og velg hva som skal gjøres.

## Hva og hvorfor

Nettpiano for iPad (iPad Pro 11", 2. gen., iPadOS 27, Stage Manager, speilet til ekstern skjerm), brukt live i
presentasjoner for lærere (musikkpedagogikk: hvordan elever kan lage enkle melodier – motiv, repetisjon, variasjon).
Lyden må kunne blandes med andre apper (Bilder, Musikk).

## Sider, mapper og grener

| Adresse | Mappe | Status |
|---|---|---|
| …/keyboard_customized/ | rot (`index.html`, `sw.js`, `manifest.webmanifest`, `samples/`, `icons/`) | **Hovedversjonen 0.4, uten visningsfelt. Stabil. Beholdes. Ikke endre uten at brukeren ber om det.** |
| …/beta/ | `beta/` | Kopi av 0.4 (egne innstillinger) så et gammelt Hjem-skjerm-ikon virker. Kan slettes når brukeren sier fra. |
| …/visuell/ | `visuell/` | **0.3.3. Versjonen brukeren presenterer med.** Piano + pads + visningsfelt. |
| …/visuell-0.2/ | `visuell-0.2/` | Uendret kopi av visuell 0.2 (reserve). Samme lager som `visuell/`. Kan slettes etter presentasjonen. |
| …/sandkasse/ | `sandkasse/` | Eksperimenter, **bygger på visuell 0.2**. Nye ideer prøves her før de ev. flyttes til `visuell/`. |

Grener: `main` (publiseres via GitHub Pages fra roten), `stabil-v0.4` og `stabil-v0.1` (tilbakefallspunkter; proxyen
stopper tag-push, derfor grener), `visuell`, `sandkasse`, `pads` (historisk).
Arbeidsmåte: jobb på egen gren, test, og spol `main` fram. Sjekk at roten er urørt: `git diff --stat stabil-v0.4 main`.
Før større endringer i `visuell/`: lag en reservekopi i egen mappe (som `visuell-0.2/`), så brukeren kan gå tilbake selv.

## Tekniske hovedpunkter

- Én HTML-fil per side, ingen byggesteg. Web Audio; `navigator.audioSession.type = 'ambient'` (blandes med andre apper).
- Piano: Salamander-samples (30 MP3 i `samples/`). Pads: syntese (PeriodicWave, filtre, LFO), kryssfade ved bytte.
- `sw.js` i roten styrer også undermappene: sider hentes fra nettet først (4 s tidsavbrudd), lyder fra lageret først.
- Hver side har egne lagernøkler: `piano.settings.v1` (rot), `piano.settings.beta.v1`, `piano.settings.visuell.v1`,
  `piano.settings.sandkasse.v1`; linjer: `piano.visuell.rows.v1`, `piano.sandkasse.rows.v1`;
  melodier: `piano.sandkasse.melodies.v1`; bilder (IndexedDB): `piano-visuell`, `piano-sandkasse`.
  `piano.visuell.sounddefaults.v2` = standardlyden fra 0.3 er tatt i bruk (én gang).
  `visuell-0.2/` bruker de samme nøklene som `visuell/` (bevisst, så alt er med ved bytte). Ikke endre IndexedDB-versjonen.
- Standardlyd (visuell 0.3): piano 75 %, romklang 0, sustain 5 s; pads 70 %, romklang 50 %. Roten (0.4) har fortsatt 7 s / 30 %.
- Visningsfeltet viser ingen forklaringstekster (publikum ser feltet). Hjelpetekster hører hjemme i innstillingene.
- Farger i feltet: notelinjer = klar blå, tynne (`STAFF_INK`); C-linjer i rutenett = blågrå som C-tangentene;
  skillelinjer mellom linjene = grå, 2 px når rutenett/notelinjer er på.
- Navn: norsk H, engelsk Bb. Transponering +4 som standard. Visningsfeltet viser tangentnavn (ikke transponert).
- Brukeren spiller ofte G–F (to + to svarte tangenter), derfor er C-tangentene markert
  (grå i 0.4, svakt blågrå i visuell 0.3 – samme farge som C-linjene i «Rutenett»).

## Visningsfeltet (`Vis`-modulen i visuell/ og sandkasse/)

- Linjer: `{ id, t0, label: null | { p: del-id, k: 'o' | 'r' | 'v' }, notes: [{ midi, t, d, held }] }`
  (o = første gang, r = repetisjon, v = variasjon; t = start i ms, d = lengde i ms, fra 0.3). Lagres som `[midi, t, d]`.
  Delene ligger i `S.dParts` (`{ id, name, color }`).
- Farger (`PART_COLORS`): første gang = farge, repetisjon = samme farge blekere, variasjon = striper.
- Tonehøyde: diatonisk trinn per hvite tangent (`staffPos`); ♯ står på tonen under, ♭ på tonen over.
- Loddrett ramme (fra 0.3.2, justert i 0.3.3): sentrert på notelinjene (`FRAME_MID`), ± `FRAME_HALF` (11,5) trinn,
  så G3–C6 får plass (C6 3,5 trinn fra toppen, G3 2,5 fra bunnen). Lik i alle visninger. Brukeren godkjente
  størrelsen i 0.3.2 som «litt for liten»; 0.3.3 er ca. 9 % større (FRAME_HALF 12,5 → 11,5).
  Trinnet (`step`) = linjehøyde / rammen, så notestørrelsen avhenger bare av linjehøyden (antall linjer, vindu),
  ikke av tangentområdet eller om Notelinjer er på. Bare toner som spilles utenfor rammen, gjør den større.
  Rutenett tegnes bare for tangentområdet. Brukeren ønsket dette (faste størrelser, luft mot skillelinjene).
- Vannrett: fast skala (`step * 12` px/s) som bare krymper i trinn på 1,25 når den lengste linjen ikke får plass.
- «Angre» bruker øyeblikksbilder (`history`); «Ikke angre likevel» (hold inne Angre) bruker `future`.
  Etter Angre/Frys/ny lasting starter neste tone alltid en ny linje (`fresh`). Navn på linjer er ikke med i Angre.
- Plassering (`applyLayout`): over = høyden deles med flex-grow (`dSzTop`); til venstre = grid-kolonner (`dSzSide`),
  og knappestripa (`#strip`) flyttes inn i `#main` over pads.
- Bilder: `dImgLay` = `rows` (plasser = `dRows`, 1 per linje til venstre, 2 over; `dImg` = -1 betyr ingen vist ennå)
  eller `one`. Nye bilder legges til og alt sorteres etter filnavn (like navn: rekkefølgen de kom i).

## Testing

Se `tester/README.md` (Playwright). `node tester/med-server.js tester/<test>.js` starter en innebygd server selv.

## Beslutninger (fra brukerens tester)

- D3 Plassering: behold begge (over / til venstre), valg i innstillingene. Til venstre: knappene over pads.
- D5 Farger: beholdes som nå; repetisjon av en variasjon vurderes senere (IDEER.md, 9).
- Testpunkter T1–T4 (visuell 0.3) OK: knapper/vindusknapper, C-farge, bilder i linjer, hold inne Angre.
- Sandkassa testes etter presentasjonen, ikke parallelt.
- Notestørrelse: fast, uavhengig av antall tangenter (0.3.2); ett knepp større og notelinjene sentrert (0.3.3). T6 OK. Rutenett vurderes senere (IDEER.md, 24).
- Innstillinger: «Lyseste tone» over «Dypeste tone», lyseste tone øverst i lista (ord og rekkefølge som på noter).

## Ideer, opprydding og visjon

Står i [`IDEER.md`](IDEER.md). Hold den oppdatert: nye ideer får neste nummer, ferdige flyttes til «Ferdig».

## Om brukeren

Svar på norsk, kort og oversiktlig. Nummerer spørsmål og gjenbruk merkene fra samtalen (P, S, V, D …).
Ta ikke med alle ideer bare fordi de nevnes; vei nytte mot stabilitet og brukervennlighet.
