import classes from "./App.module.css";
import { useMemo, useState, useRef } from "react";
import { produce } from "immer";
import clsx from "clsx";
import { getPic } from "./utils/get_pic.ts";
import { cleanString } from "./utils/clean_string.ts";
import { CardGroup } from "./components/card_group.tsx";
import { CardGroupUnique } from "./components/card_group_unique.tsx";
import { EBuild } from "./fixtures/tree.ts";
import { useDataTechTree } from "src/hooks/use_data.ts";
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';

type Civ = keyof NonNullable<ReturnType<typeof useDataTechTree>["datasets"]>["civ_names"];

const WAR_BUILDS_SORTING = [EBuild.BARRACKS, EBuild.ARCHERY, EBuild.HORSE_STABLE, EBuild.ENGINE, EBuild.DOCK, EBuild.SMITHY, EBuild.UNIVERSITY, EBuild.MONASTERY];

function App() {
  const printRef = useRef<HTMLDivElement>(null);
  const {
    datasets,
    strings,
    tree,
  } = useDataTechTree();

  const [selectedCivs, setSelectedCivs] = useState<Map<Civ, boolean>>(new Map());

  const handleSelectCiv = (civ: Civ) => () => {
    setSelectedCivs((state) => produce(state, (draft) => {
      if (draft.has(civ)) {
        draft.delete(civ);
      } else {
        draft.set(civ, true);
      }

      return draft;
    }));
  };

  const selectedCivsArray = useMemo(() => Array.from(selectedCivs.keys()), [selectedCivs]);

  const warBuilds = useMemo(() => (Object.keys(tree.war_builds) as unknown as EBuild[]).sort((b1, b2) => (
    WAR_BUILDS_SORTING.indexOf(Number(b1)) - WAR_BUILDS_SORTING.indexOf(Number(b2))
  )), [tree.war_builds]);

  if (!datasets || !strings) {
    return null;
  }

  // console.log(datasets);

  const scrapCivHelpText = (helpText: string, civName: string) => {
    // console.log(helpText);
    let bonus: string[] = [];
    let uniqueUnit: string = "";
    let uniqueTechs: string[] = [];
    let teamBonus: string = "";

    // •
    const cleanUp = helpText.split("<b>")[0].split("civilization")[1].replace("<br>", "").replace("<br>", "").trim().replace(/(\r\n|\n|\r)/gm, "");
    bonus = cleanUp.split('•');
    // Remove first empty string by using shift
    bonus.shift();
    uniqueUnit = helpText.split("<b>")[1];
    uniqueTechs = helpText.split("<b>")[2].split("<br>");
    teamBonus = helpText.split("<b>")[3].split("<br>")[1];
    // bonus.forEach((b) => {
    //   console.log("Bonus: " + cleanString(b));
    // });
    // const uuCleaned = cleanString(uniqueUnit.split(",")[0]).trim()?.replace(/(\r\n|\n|\r)/gm, "")?.replace("Unique Unit:</b> ", "")?.replace("Unique Unit:</b>", "")?.replace("Unique Units:</b>", "");
    // console.log(uuCleaned);

    // console.log("UT1: " + cleanString(uniqueTechs[1].split("(")[1].replace(")", "")));
    // console.log("UT2: " + cleanString(uniqueTechs[2].split("(")[1].replace(")", "")));
    // console.log("TB: " + cleanString(teamBonus));

    const ut1 = civName === "Sicilians" ? cleanString(uniqueTechs[1].replace("• First Crusade (", "")).replace("max 5", "max 5)") : uniqueTechs[1].split("(")[1] + (uniqueTechs[1].split("(")[2] !== undefined ? uniqueTechs[2].split("(")[2]?.replace(")", "") : "");
    const ut2 = uniqueTechs[2].split("(")[1] + (uniqueTechs[2].split("(")[2] !== undefined ? uniqueTechs[2].split("(")[2]?.replace(")", "") : "");

    return <div className={classes.info_text}>
      {bonus.map((b) => (<p>{cleanString(b)}</p>))}
      <p><b>TB:</b> {cleanString(teamBonus)}</p>
      <p><img alt="UT1" src="https://aoe2techtree.net/img/Techs/unique_tech_1.png" /> {cleanString(ut1.replace(")", ""))}</p>
      <p><img alt="UT2" src="https://aoe2techtree.net/img/Techs/unique_tech_2.png" /> {cleanString(ut2.replace(")", ""))}</p>
    </div>;
  };

  const getUniqueType = (helpText: string) => {
    let uniqueUnit: string = "";
    uniqueUnit = helpText.split("<b>")[1];
    const uuCleaned = cleanString(uniqueUnit.split(",")[0]).trim()?.replace(/(\r\n|\n|\r)/gm, "")?.replace("Unique Unit:</b> ", "")?.replace("Unique Unit:</b>", "")?.replace("Unique Units:</b>", "");
    console.log(uuCleaned.split("(")[1].replace(")", "").trim());

    return(uuCleaned.split("(")[1].replace(")", "").trim().replace(" ", "_"));
  };

  const handleDownloadImage = async (civName: string) => {
    const element = printRef.current;
    if(element != null) {
    const canvas = await html2canvas(element, {useCORS: true, scale: 1, backgroundColor: null});

    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');

    if (typeof link.download === 'string') {
      link.href = data;
      link.download = `${civName}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  }
  };

  const handleDownloadImageAlt = async (civName: string) => {
    const element = printRef.current;
    if(element != null) {
      domtoimage.toPng(element, { quality: 1 })
      .then(function (dataUrl: any) {
          var link = document.createElement('a');
          link.download = `${civName.toLowerCase()}.png`;
          link.href = dataUrl;
          link.click();
      });
  }
  };
  

  return (
    <>
      <div className={classes.civs}>
        {(Object.keys(datasets.civ_names) as Civ[]).map((civ) => (
          <div
            key={civ}
            className={clsx(classes.civs__item, selectedCivs.has(civ) && classes.civs__item_active)}
            onClick={handleSelectCiv(civ)}
          >
            <img alt={civ} src={getPic("civ", civ)} />
          </div>
        ))}
      </div>

      <div>
        {selectedCivsArray.map((civ) => (<div className={classes.wrapper}>
            <div className={classes.civ_title}>
              <h5>{civ}</h5>
              <img className={classes.main__pic} alt={civ} src={getPic("civ", civ)} />
              <button type="button" onClick={() => {handleDownloadImageAlt(civ)}}>
                Download as Image
              </button>
            </div>
          <div className={classes.main} key={civ} ref={printRef}>
            {/* <div><img className={classes.main__pic} alt={civ} src={getPic("civ", civ)} /></div> */}
            {/* <div
              className={classes.main__desc}
              dangerouslySetInnerHTML={{ __html: strings[Number(datasets.civ_helptexts[civ])] }}
            /> */}

            {/* <div className={classes.main_list}> */}
            <div>
              {warBuilds.slice(0, 5).map((buildId) => (<>
                <CardGroup
                  civName={civ}
                  key={buildId}
                  civData={datasets.techtrees[civ]}
                  buildId={Number(buildId)}
                  units={tree.war_builds[buildId]?.units}
                  techs={tree.war_builds[buildId]?.techs}
                  tech_chains={tree.war_builds[buildId]?.tech_chains}
                /></>
              ))}
            </div>
            <div>
              <CardGroupUnique
                civName={civ}
                uniqueType={getUniqueType(strings[Number(datasets.civ_helptexts[civ])])}
                key={strings[datasets.data.units[datasets.techtrees[civ].unique.castleAgeUniqueUnit].LanguageNameId]}
                civData={datasets.techtrees[civ]}
                buildId={EBuild.CASTLE}
                units={[datasets.techtrees[civ].unique.castleAgeUniqueUnit, datasets.techtrees[civ].unique.imperialAgeUniqueUnit]}
                techs={[]}
                tech_chains={[]}
              />
            </div>

            <div className={classes.move_left}>
              {warBuilds.slice(5, 8).map((buildId) => (<>
                <CardGroup
                  civName={civ}
                  key={buildId}
                  civData={datasets.techtrees[civ]}
                  buildId={Number(buildId)}
                  units={tree.war_builds[buildId]?.units}
                  techs={tree.war_builds[buildId]?.techs}
                  tech_chains={tree.war_builds[buildId]?.tech_chains}
                /></>
              ))}
            </div>
            {/* </div> */}

            <div className={classes.move_left_text}>{scrapCivHelpText(strings[Number(datasets.civ_helptexts[civ])], civ)}</div>
            {/* <div className={classes.main__castle}>
            Unique unit:<br />
              <b>{strings[datasets.data.units[datasets.techtrees[civ].unique.castleAgeUniqueUnit].LanguageNameId]}</b>
              <div dangerouslySetInnerHTML={
                { __html:
                    strings[datasets.data.units[datasets.techtrees[civ].unique.castleAgeUniqueUnit]
                    .LanguageHelpId]
                      .match(/Unique.*?\.(.*?)<i>/gs)?.[0].replace("<i>", "") || ""}
              } />
            </div> */}
          </div>
          </div>))}
      </div>
    </>
  );
}

export default App;
