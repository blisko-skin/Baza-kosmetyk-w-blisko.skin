# blisko.skin — biblioteka kosmetyków

Prywatna, modułowa biblioteka kosmetyków blisko.skin. Aplikacja pomaga katalogować produkty, notować informacje o składzie, dopasowaniu i odczuciach sensorycznych oraz odróżniać własne obserwacje od roboczych analiz.

## Uruchomienie lokalne

Wymagany jest współczesny browser z obsługą IndexedDB. W katalogu projektu uruchom:

```sh
python3 -m http.server 8000 --directory dist
```

Następnie otwórz http://localhost:8000.

## Dane i kopie

Produkty zapisują się w IndexedDB w przeglądarce, w której korzystasz z aplikacji. Nie synchronizują się automatycznie między urządzeniami. Eksportuj kopię JSON z poziomu biblioteki i przechowuj ją poza repozytorium. Przywracanie kopii zastępuje bieżącą bazę po sprawdzeniu pliku.

Nie dodawaj do repozytorium danych klientów ani plików z prywatnymi notatkami.

## Modułowość

Katalog jest wspólnym fundamentem. Moduły analizy składu, dopasowania do skóry, sensoryki i własnych obserwacji można włączać i wyłączać bez kasowania ich danych. Dane przykładowe są oznaczone w aplikacji jako fikcyjne.

## Hosting

Aplikacja działa jako prywatny Site blisko.skin. Repozytorium przechowuje kod źródłowy; publikowanie aktualizacji Site jest osobnym krokiem.