function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

export const cleanString = (text: string) => {

  const cavCleaned = replaceAll(text, "Cavalry", "Cav");
  const cavCleaned2 = replaceAll(cavCleaned, "cavalry", "Cav");
  const lancerCleaned = replaceAll(cavCleaned2, "Steppe Lancer", "Lancer");
  const teamCleaned = replaceAll(lancerCleaned, "team members", "Team");
  const demoCleaned = replaceAll(teamCleaned, "Demolition", "Demo");
  const hpCleaned = replaceAll(demoCleaned, "hit points", "HP");
  const carryCleaned = replaceAll(hpCleaned, "carry capacity", "capacity");
  const skirmCleaned = replaceAll(carryCleaned, "Skirmishers", "Skirms");
  const camelCleaned = replaceAll(skirmCleaned, "camel rider", "Camel");
  const tcCleaned = replaceAll(camelCleaned, "Town Center", "TC");
  const maxCleaned = replaceAll(tcCleaned, "maximum", "max");
  return replaceAll(maxCleaned.replace(/(\r\n|\n|\r)/gm, "").trim(), "<br>", "");
};