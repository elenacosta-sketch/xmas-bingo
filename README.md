# Christmas Bingo

A festive English-classroom bingo caller. This is a static website: no build, npm install, API key, or backend is required.

## Publish with GitHub Pages

1. Unzip this archive and create a GitHub repository.
2. Upload **the contents of the `christmas-bingo` folder** to the repository root. `index.html` should be at the top level, alongside `app.js`, `audio.js`, `words.js`, `style.css`, `assets/`, and `downloads/`.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select your main branch and **/ (root)**, then save.
5. Open the website address shown by GitHub when deployment completes.

Keep the folder structure intact so illustrations and the PDF download work. The `.nojekyll` file is included for static hosting.

## Preview locally

From inside this folder, run:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000 in a browser. A local web server is recommended instead of opening the HTML file directly.

## Play

- Choose Easy (A1/A2), Medium (B1), or Hard (B2/B2+).
- Before starting, remove unsuitable words with ×. Restore individual words or all words if needed. At least nine words must remain.
- Students see every possible word in the selected round and choose nine different words to fill their own 3 × 3 grids.
- Select **Students ready — start game**, then draw words. Each selected word is drawn once until reset.
- Choose words, icons, or both for the main clue. The sidebar always keeps a written history of called words.
- **Present to class** opens the large classroom view. Space draws a word; Escape exits presentation.
- A drumroll precedes each reveal, bells accompany the new word, and the browser's English voice reads it aloud. Sound effects and voice have separate mute controls; **Repeat word** repeats the current call.
- Press **BINGO!** when a student calls bingo to play fanfare and applause. No microphone or automatic shout detection is used.
- The sidebar includes the downloadable A4 PDF: four blank, decorated bingo cards per page, with nine squares per card.

## Saved progress and sound

Each level's selected words and game progress are saved in this browser's local storage. Reset keeps the selected vocabulary and lets the teacher edit it again. Progress does not sync across devices. Audio starts after a teacher interacts with the page. Spoken words require browser speech synthesis and an available English voice. Check browser or device sound/speech settings if voice is unavailable. Audio effects are synthesized locally with the Web Audio API; there are no external sound downloads.

Google Fonts is used for optional web typography. System serif and sans-serif fonts are used if it cannot load. The site does not require a Sites account when hosted on GitHub Pages.

## Files

- `index.html` — page layout and controls.
- `style.css` — responsive red-and-white Christmas theme.
- `app.js` — round preparation, selected vocabulary, random draws, history, and presentation.
- `words.js` — vocabulary and icons, grouped by classroom difficulty.
- `audio.js` — speech, drumrolls, bells, fanfare, and applause.
- `assets/` — candy-cane and present illustrations.
- `downloads/` — printable bingo PDF.
- `scripts/create-bingo-template.py` — optional PDF regeneration script.

The difficulty groups are teaching estimates, not official CEFR word ratings. Vocabulary was curated from the six Christmas reference images provided for this project.

## Regenerate the printable (optional)

The ready-to-use PDF is already included. To regenerate it, install Python's `reportlab` package and run:

```sh
python3 -m pip install reportlab
python3 scripts/create-bingo-template.py
```

The script writes `downloads/christmas-bingo-blank-3x3.pdf`.
