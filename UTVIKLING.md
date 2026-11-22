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
| …/visuell/ | `visuell/` | **0.3.** Piano + pads + visningsfelt. «Det enkleste som funker» til presentasjonen. |
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
- Navn: norsk H, engelsk Bb. Transponering +4 som standard. Visningsfeltet viser tangentnavn (ikke transponert).
- Brukeren spiller ofte G–F (to + to svarte tangenter), derfor er C-tangentene markert
  (grå i 0.4, svakt blågrå i visuell 0.3 – samme farge som C-linjene i «Rutenett»).

## Visningsfeltet (`Vis`-modulen i visuell/ og sandkasse/)

- Linjer: `{ id, t0, label: null | { p: del-id, k: 'o' | 'r' | 'v' }, notes: [{ midi, t, d, held }] }`
  (o = første gang, r = repetisjon, v = variasjon; t = start i ms, d = lengde i ms, fra 0.3). Lagres som `[midi, t, d]`.
  Delene ligger i `S.dParts` (`{ id, name, color }`).
- Farger (`PART_COLORS`): første gang = farge, repetisjon = samme farge blekere, variasjon = striper.
- Tonehøyde: diatonisk trinn per hvite tangent (`staffPos`); ♯ står på tonen under, ♭ på tonen over.
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
- D5 Farger: beholdes som nå. Åpent spørsmål: repetisjon av en variasjon. Forslag hvis behovet kommer:
  la «Repetisjon» også finnes for variasjonen (bleke striper), eller merk variasjoner Motiv′, Motiv″.
- Sandkassen testes senere. Før neste sandkasse-runde: ta inn alt fra visuell 0.3 først.

## Ideer (vurdert, ikke laget)

Nærmest (sandkasse):
1. Dra i skillet mellom visningsfelt og piano (i dag: «Størrelse på visningsfeltet» i innstillingene).
2. Avspilling: spill av det som står (en linje, eller alt). Tidene og (fra 0.3) lengdene er lagret.
3. Flere pads, velg akkord selv; sorteres automatisk etter tonehøyde og får ulike farger.
4. Eksport/import av melodier som fil, for å flytte mellom Safari, Hjem-skjerm-app og enheter.

Senere:
5. Metronom.
6. Presentasjonsmodus: bare visningsfeltet på ekstern skjerm (eget vindu, BroadcastChannel). Krever utvidet skjerm, ikke speiling.
7. Språk: norsk/engelsk.
8. Rette opp rytmen (kvantisering): penere bilder, men skjuler ekte spill. Bør være et valg.
9. G-nøkkel-tegn ved notelinjene.
10. Fra før: glissando-innstilling, grunntone i pianoet ved pad-anslag, «hold»-modus for pads.
11. Frarådet: lagre «Spill» som PNG til «Bilder». «Melodier» gjør det samme og kan endres.

## Visjon (langsiktig, ikke nå)

Videreutvikle til et verktøy der elever lærer noter ved å lage egne melodier (brukerens gamle drøm; nettbaserte
noteskriveprogrammer var for kompliserte). Trenger enkle noteverdier (hel-, halv-, fjerdedels-, åttendelsnote), korrekt notert.
Åpne spørsmål:
- Skal eleven sette notene selv, eller skal systemet foreslå (ut fra spilt rytme) og eleven overprøve?
- Valg: med eller uten forslag?
- Skal noteverdiene styre avspillingen?
Grunnlaget finnes: start og lengde på hver tone lagres (fra visuell 0.3), og tonehøyden står allerede som på noter.

## Om brukeren

Svar på norsk, kort og oversiktlig. Nummerer spørsmål og gjenbruk merkene fra samtalen (P, S, V, D …).
Ta ikke med alle ideer bare fordi de nevnes; vei nytte mot stabilitet og brukervennlighet.
