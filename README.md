# Krucze Galery

Galeria albumów Google Photos dla Bractwa Wojowników Kruki.  
Strona dostępna pod adresem: **https://bractwowojownikowkruki.github.io/krucze-galery/**

---

## Jak dodać album

Nie trzeba instalować niczego ani klonować repozytorium. Wystarczy konto na GitHubie z dostępem do tego repo.

### Krok 1 — Otwórz plik `albums.txt` w przeglądarce

Przejdź do:  
**https://github.com/BractwoWojownikowKruki/krucze-galery/blob/main/albums.txt**

### Krok 2 — Kliknij ikonę ołówka ✏️

W prawym górnym rogu widoku pliku kliknij ikonę ołówka („Edit this file").

### Krok 3 — Dodaj URL albumu

Na końcu pliku dopisz link do udostępnionego albumu Google Photos:

```
https://photos.app.goo.gl/XYZ
```

Nazwa i data zostaną pobrane automatycznie z tytułu albumu w Google Photos.

#### Własna nazwa (opcjonalnie)

Jeśli chcesz nadać albumowi inną nazwę niż w Google Photos, dopisz ją po pionowej kresce `|`:

```
https://photos.app.goo.gl/XYZ | 2024-08-03 Wolin
```

Przydatne gdy:
- tytuł albumu w Google Photos jest nieczytelny lub pusty
- album obejmuje kilka dni: `2024-08-03-05 Wolin` (sortuje po 3 sie, wyświetla „Wolin")

### Krok 4 — Zapisz zmiany

Przewiń na dół, w polu „Commit changes" wpisz krótki opis (np. `dodaj album Wolin 2024`) i kliknij **Commit changes**.

### Krok 5 — Poczekaj chwilę

GitHub automatycznie uruchomi synchronizację (ok. 1–2 minuty). Po jej zakończeniu album pojawi się na stronie galerii.

Postęp synchronizacji można śledzić w zakładce **Actions**:  
https://github.com/BractwoWojownikowKruki/krucze-galery/actions

---

## Format nazwy albumu

Data jest wykrywana automatycznie i służy do sortowania. Obsługiwane formaty:

| Format w nazwie | Przykład |
|---|---|
| `YYYY-MM-DD` | `2024-08-03 Wolin` |
| `YYYY.MM.DD` | `2024.08.03 Wolin` |
| `YYYY/MM/DD` | `2024/08/03 Wolin` |
| `YYYY-MM` (sam miesiąc) | `2024-08 Obozy letnie` |
| `YYYY.MM` | `Radzim 2025.05` |
| Data na końcu tytułu | `Wolin 2024-08-03` |
| Zakres dni | `2024-08-03-05 Wolin` |

---

*Strona stworzona przez [CardioCanWait](https://www.cardiocanwait.com) dla Bractwa Wojowników Kruki.*
