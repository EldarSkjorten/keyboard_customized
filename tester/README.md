# Tester (Playwright, kjøres lokalt eller i en Claude-sky-økt)

Enklest: la testen starte en innebygd server selv (fra repo-roten):

    node tester/med-server.js tester/visuell-0.3.js

Eller start en lokal server fra repo-roten (`python3 -m http.server 8123`) og kjør testene direkte, f.eks.:

    node tester/hovedside.js        # hovedsiden (0.4): pads, kryssfade, C-tangenter, grepfelt
    node tester/innstillinger-0.1.js
    node tester/visuell-beroring.js # visuell: knapper med berøring, pads, grepfelt
    node tester/visuell-bilder.js   # visuell: egne bilder, sveip, lagring
    node tester/visuell-0.2.js      # visuell: Angre, fast avstand, Frys, linjer, navnemeny, deler
    node tester/visuell-0.3.js      # visuell 0.3: standardlyd, knapper over pads, størrelse, Ikke angre likevel,
                                    #   tonelengde, bilder legges til, bilder i linjer, fjern ett bilde
    node tester/sandkasse.js        # sandkasse: Under/Etter, Del for del, Melodier

`visuell-0.2.js` kan også kjøres mot sandkassen:

    node tester/visuell-0.2.js http://localhost:8123/sandkasse/ sandkasse

Skjermbilder havner i `tester/shots/` (ikke i git). Krever `playwright` med Chromium.
