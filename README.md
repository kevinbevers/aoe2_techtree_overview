First install packages with
```bash
npm install
```

run the site with:
```bash
npm run dev
```

Then click a civ badge on the site, see the tech tree overview and press download image. the downloaded image is used in the mod to be part of the UI.
Resize to width 720, height 240 to have them all work ingame with https://imageresizer.com/bulk-resize or https://bulkimageresize.com/



2 things changed in new data output.
a .json per civ in trees/ARMENIANS.json for example.
And less info in data.json.
unit id is not the image id there is now a seperate picture_index.

These are now the image paths
    civ: "Civs",
    build: "Building",
    unit: "Unit",
    tech: "Tech"
