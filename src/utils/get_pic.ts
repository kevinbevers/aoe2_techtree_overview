export const getPic = (type: "civ" | "build" | "unit" | "tech", id: number | string) => (
  `https://aoe2techtree.net/img/${{
    civ: "Civs",
    build: "Building",
    unit: "Unit",
    tech: "Tech",
  }[type]}/${String(id).toLowerCase()}.png`
);