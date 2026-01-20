# Cell Classification MVP

Nowoczesna aplikacja webowa do klasyfikacji komórek z wykorzystaniem uczenia maszynowego.

## Funkcjonalności

- 📤 **Wgrywanie zdjęć** - Przeciągnij i upuść lub kliknij, aby wgrać zdjęcie z mikroskopu
- 🔬 **Trzy klasyfikatory**:
  - KNN Cosine
  - KNN Cubic
  - Naive Bayes
- 📊 **Wizualizacja wyników** - Wyświetlanie liczby znalezionych komórek w każdej kategorii (A, B, C, D)
- 🎨 **Nowoczesny interfejs** - Płynne animacje i responsywny design

## Instalacja i uruchomienie

### Lokalnie

1. Sklonuj lub pobierz repozytorium
2. Otwórz plik `index.html` w przeglądarce

Lub użyj lokalnego serwera:

```bash
# Python 3
python -m http.server 8000

# Node.js (z http-server)
npx http-server

# PHP
php -S localhost:8000
```

Następnie otwórz `http://localhost:8000` w przeglądarce.

### Hosting na GitHub Pages

1. Utwórz nowe repozytorium na GitHub
2. Wgraj wszystkie pliki do repozytorium:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
3. Przejdź do **Settings** → **Pages**
4. W sekcji **Source** wybierz branch (np. `main`) i folder `/ (root)`
5. Kliknij **Save**
6. Twoja aplikacja będzie dostępna pod adresem: `https://[twoja-nazwa-uzytkownika].github.io/[nazwa-repozytorium]`

## Użycie

1. **Wgraj zdjęcie**: Kliknij obszar wgrywania lub przeciągnij plik
2. **Wybierz klasyfikator**: Kliknij na jedną z trzech opcji klasyfikatora
3. **Rozpocznij analizę**: Kliknij przycisk "Rozpocznij analizę"
4. **Zobacz wyniki**: Po zakończeniu analizy zobaczysz liczbę znalezionych komórek w każdej kategorii

## Uwagi techniczne

- Aplikacja używa zmockowanych danych (symulacja klasyfikacji)
- Wszystkie wyniki są generowane losowo, ale różnią się w zależności od wybranego klasyfikatora
- Aplikacja działa w pełni po stronie klienta (client-side), nie wymaga serwera backendowego

## Technologie

- HTML5
- CSS3 (z animacjami i gradientami)
- Vanilla JavaScript (ES6+)

## Licencja

MIT License

