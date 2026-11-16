# Usable Instagram

**Don't lose friends, stay concentrated.**

Ein Userscript, das Instagram im Browser auf das Wesentliche reduziert: Nachrichten von Freunden und Beiträge von Leuten, denen du folgst. Ohne Reels-Feed, ohne Entdecken und ohne vorgeschlagene Beiträge.

## Was es macht

- **Nur Gefolgte:** Die Startseite öffnet immer den Feed „Folge ich“. Er ist chronologisch und zeigt keine vorgeschlagenen Beiträge.
- **Kein Reels-Tab, kein Entdecken:** Beides wird ausgeblendet. Wer die Seiten direkt aufruft, wird zur Startseite umgeleitet.
- **Reels aus DMs funktionieren:** Reels, die dir jemand schickt, kannst du ansehen.
- **Kein Weiterscrollen:** In einem geöffneten Reel ist Wischen und Scrollen gesperrt. Du siehst das eine Reel und nicht das nächste.
- **Keine „Vorgeschlagen für dich“-Blöcke** und kein „Mehr Beiträge“ unter einem Post.

## Installation

### iPhone / iPad (Safari)
1. Installiere die kostenlose App [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) aus dem App Store.
2. Aktiviere sie unter **Einstellungen → Safari → Erweiterungen → Userscripts** und erlaube den Zugriff auf `instagram.com`.
3. Lege `usable-instagram.user.js` in den Userscripts-Ordner. Alternativ öffnest du die Raw-Datei in Safari und installierst sie über die Erweiterung.
4. Öffne `instagram.com` in einem normalen Safari-Tab. Als Web-App auf dem Home-Bildschirm laufen keine Erweiterungen.

### Android (Firefox)
1. Installiere **Firefox** und darin das Add-on **Violentmonkey**.
2. Öffne die Raw-Datei von `usable-instagram.user.js`. Violentmonkey bietet dir dann die Installation an.

### Desktop (Chrome, Firefox, Edge, Safari)
Installiere Tampermonkey oder Violentmonkey und öffne die Raw-Datei des Skripts.

## Tipp

Lösch die Instagram-App vom Handy. Das Skript wirkt nur im Browser, und ohne die App gibt es keinen bequemen Weg zurück zu den Reels.

## Hinweise

- Instagram ändert regelmäßig seinen Seitenaufbau. Wenn etwas nicht mehr greift, eröffne bitte ein Issue.
- Das Skript läuft komplett lokal in deinem Browser. Es sammelt und sendet keine Daten.
- Dieses Projekt hat keine Verbindung zu Instagram oder Meta.

## Lizenz

MIT
