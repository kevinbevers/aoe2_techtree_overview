First install packages with
```bash
npm install
```

run the site with:
```bash
npm run dev
```

Then click a civ badge on the site, see the tech tree overview and press download image. the downloaded image is used in the mod to be part of the UI.
Downloads are automatically resized to width 720, height 240 so they work ingame (no need for a bulk resize tool anymore).



2 things changed in new data output.
a .json per civ in trees/ARMENIANS.json for example.
And less info in data.json.
unit id is not the image id there is now a seperate picture_index.
Tree filenames now match the uppercased civ key (e.g. trees/HINDUSTANIS.json, trees/MAGYARS.json), so no name mapping is needed anymore.

These are now the image paths
    civ: "Civs",
    build: "Building",
    unit: "Unit",
    tech: "Tech"
