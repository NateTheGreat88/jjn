import os
import json
import re

GAMES_DIR = "games"
OUTPUT_FILE = "games.js"

def prettify_title(filename: str) -> str:
    name = filename.lower()
    name = re.sub(r'^cl\d*', '', name)   # убираем cl, cl1, cl10 и т.п.
    name = name.replace('.html', '')
    name = name.replace('_', ' ')
    name = re.sub(r'\s+', ' ', name).strip()
    return name.title()

games = []

for file in sorted(os.listdir(GAMES_DIR)):
    if not file.endswith(".html"):
        continue

    title = prettify_title(file)

    games.append({
        "title": title,
        "file": f"{GAMES_DIR}/{file}"
    })

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("window.GAMES = ")
    json.dump(games, f, ensure_ascii=False, indent=2)
    f.write(";")

print(f"✔ Generated {OUTPUT_FILE} with {len(games)} games")
