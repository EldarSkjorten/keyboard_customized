# Ideer og oppgaver – samlet liste

Alle ideer til retting og videreutvikling, samlet ett sted, så de kan vurderes samlet neste gang.
Sist oppdatert: 22. november 2026 (etter visuell 0.3.3).

Nummerene er faste (bruk dem når vi snakker om dem, f.eks. «idé 9»). Nye ideer får neste ledige nummer.
Vurderingen (nytte / innsats) er et forslag fra Claude og kan overprøves.

## Status nå

- **Til presentasjonen brukes `visuell/` (0.3.3).** Testet og godkjent på iPad (T1–T6 OK), også på TV som ekstern skjerm.
  Brukeren sa «Perfekt. Klar til presentasjon.»
- Hovedversjonen i roten (0.4, uten visningsfelt) beholdes uendret.
- Sandkassa er ikke testet og bygger fortsatt på visuell 0.2 (se 2 og 3–6).

## Opprydding (etter presentasjonen)

1. **Slette `visuell-0.2/`** (reservekopi) når 0.3 har fungert i presentasjonen.
2. **Oppdatere sandkassa med alt fra visuell 0.3.3** før den testes (ellers mangler den nyere rettinger).
   Innsats: liten–middels.
3. **Slette `beta/`** (kopi av 0.4, beholdt for et gammelt Hjem-skjerm-ikon) – når du sier fra.
4. **Git-grener:** `visuell` og `sandkasse` står på gamle versjoner; `main` har alt. Kan ryddes eller spoles fram.

## Laget i sandkassa – venter på test

Adresse: …/keyboard_customized/sandkasse/

5. **Under / Etter:** delene under hverandre (sammenligne) eller etter hverandre i leseretning (hele melodien).
6. **Del for del** (når feltet er frosset): vis én linje om gangen med trykk, ›, piltast eller presentasjonsklikker.
   Merk: dette gjør det samme som arbeidsmåten med skjermbilder → «Bilder» (vise linjene én og én), men uten
   skjermbilde og beskjæring. Test denne før vi bygger mer rundt bilder.
7. **Tonene lyser** blått i feltet når du spiller dem mens feltet er frosset (å spille «oppå» en ferdig melodi).
8. **Melodier:** lagre det som står i feltet med navn, og hent det fram igjen (bilde, ikke lyd).

## Åpne spørsmål

9. **(D5) Farger: repetisjon av en variasjon.** Vurderes senere, når/hvis behovet kommer i praksis.
   Forslag: «Repetisjon» også for variasjonen (bleke striper), eller merke variasjoner Motiv′, Motiv″.
24. **Rutenett: beholde eller droppe?** Kan være forvirrende fordi det ligner notelinjer uten å være det.
    Vurderes senere. Alternativ hvis det beholdes: bare C-linjene (ingen linjer for de andre tangentene).
25. **Notestørrelse:** fra 0.3.2 følger den bare linjehøyden (fast ramme G3–C6 + luft, se UTVIKLING.md), ikke tangentene.
    Den blir derfor større med færre linjer og mindre med flere. Alternativ: helt fast størrelse uansett antall linjer.
    Justeres med ett tall (`FRAME_HALF`) hvis notene bør være litt større eller mindre. Vurder etter presentasjonen
    (hvordan så det ut på stor skjerm?).
26. **Hovedversjonen 0.4:** samme rekkefølge og ord i innstillingene (Lyseste over Dypeste, lyseste tone øverst i lista)?
    Bare hvis du ønsker det – 0.4 skal ellers være uendret.

## Visningsfeltet

10. **Dra i skillet** mellom visningsfelt og piano (i dag: glidebryter under ⚙ → Visning). Nytte: middels · Innsats: middels.
    Må ikke kunne flyttes ved et uhell mens du spiller.
11. **Avspilling:** spill av det som står (én linje ved å trykke på den, eller alt). Start og lengde på hver tone
    lagres fra 0.3, så grunnlaget er der. Nytte: høy · Innsats: middels.
12. **Presentasjonsmodus:** bare visningsfeltet på ekstern skjerm, piano og knapper bare på iPaden.
    Krever utvidet skjerm (ikke speiling) og to vinduer som snakker sammen. Usikkert hvor godt dette virker
    på iPad med Stage Manager – bør prøves enkelt først. Nytte: høy for publikum · Innsats: middels–stor.
13. **Rette opp rytmen (kvantisering):** penere bilde, men skjuler ekte spill. Bør være et valg. Nytte: middels · Innsats: middels.
14. **G-nøkkel-tegn** ved notelinjene. Nytte: liten–middels · Innsats: liten.
15. **Eksport/import av melodier som fil** (flytte mellom Safari, Hjem-skjerm-app og andre enheter).
    Aktuelt hvis «Melodier» (8) blir brukt. Nytte: middels · Innsats: liten–middels.
16. Frarådet: lagre «Spill» som PNG til «Bilder». «Melodier» + «Del for del» (6, 8) gjør det samme og kan endres.
    Vurderes på nytt hvis 6/8 ikke dekker behovet.

## Pads og lyd

17. **Flere pads og egne akkorder:** legg til pads og velg akkord; de sorteres automatisk etter tonehøyde
    og får ulike farger. Nytte: middels–høy · Innsats: middels.
18. **Grunntone i pianoet** når en pad slås an (slik Audanika gjør). Nytte: liten–middels · Innsats: liten.
19. **«Hold»-modus for pads:** lyd bare mens fingeren ligger på (i tillegg til av/på). Nytte: liten–middels · Innsats: liten.
20. **Metronom.** Nytte: middels · Innsats: liten–middels.

## Piano

21. **Glissando:** gli med fingeren over tangentene gir nye toner (valg ja/nei). I dag gir bare nye trykk nye toner.
    Nytte: liten–middels · Innsats: liten–middels.

## Generelt

22. **Språk: norsk / engelsk.** Nytte: avhenger av publikum · Innsats: middels (mange tekster).

## Visjon (langsiktig, ikke nå)

23. **Noteverktøy for elever:** elever lærer noter ved å lage egne melodier (brukerens gamle drøm; nettbaserte
    noteskriveprogrammer var for kompliserte). Trenger enkle noteverdier (hel-, halv-, fjerdedels-, åttendelsnote),
    korrekt notert. Åpne spørsmål:
    - Skal eleven sette notene selv, eller skal systemet foreslå (ut fra spilt rytme) og eleven overprøve?
    - Valg: med eller uten forslag?
    - Skal noteverdiene styre avspillingen (11)?
    Grunnlaget finnes: start og lengde på hver tone lagres, og tonehøyden står allerede som på noter.

## Ferdig (for oversikt)

- visuell 0.3.3: notene ett knepp større, notelinjene sentrert i hver linje.
- visuell 0.3.2: fast notestørrelse (uavhengig av tangentområdet, luft over/under notelinjene og mot skillelinjene);
  innstillinger: «Lyseste tone» over «Dypeste tone», lyseste tone øverst i lista.
- visuell 0.3.1: notelinjene klar blå og tynne (skilles fra de grå skillelinjene); ingen forklaringstekst i tomt felt.
- visuell 0.3: standardlyd, knapper over pads (til venstre-modus), størrelse på feltet, bilder legges til og samles
  i linjer, fjerne ett bilde, «Ikke angre likevel», tydeligere rutenett, tonelengde lagres.
- visuell 0.2: Angre-feil, fast avstand, Frys, rutenett/notelinjer, navn og farger på linjer, plassering til venstre.
