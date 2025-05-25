import { FC, useMemo } from "react";
import { getPic } from "../utils/get_pic.ts";
import { EBuild } from "../fixtures/tree.ts";
import classes from "./card.module.css";
import clsx from "clsx";
import { TechTreeCiv, TechTreeData } from "../hooks/use_data.ts";
import { backgroundImage } from "html2canvas/dist/types/css/property-descriptors/background-image";

const uniqueUnitUpgrades = (propName: string, propChain: number[], civName1: string, civName2: string, firstUnitInTreeID: number, unitToReplace: number, ReplacementUnit: number) => {
  const checkArray = propChain;
  if(checkArray.indexOf(firstUnitInTreeID)  > -1) {
    // console.log("hello unit tree");
  if (propName === civName1 || propName === civName2) {
    const index = checkArray.indexOf(unitToReplace);
    const modArray = propChain;
    if (index > -1) { // only splice array when item is found
      // console.log("Remove Default");
      if(!modArray.includes(ReplacementUnit))
      {
        // console.log("Add Special");
        modArray.push(ReplacementUnit);
      }
      return modArray.splice(index, 1); // 2nd parameter means remove one item only
    }
  }
  else {
    const index = checkArray.indexOf(ReplacementUnit);
    const modArray = propChain;
    if (index > -1) { // only splice array when item is found
      // console.log("Remove Special");
      if(!modArray.includes(unitToReplace))
      {
        // console.log("Add Default");
        modArray.push(unitToReplace);
      }
      return modArray.splice(index, 1); // 2nd parameter means remove one item only
    }
  }
  }
};

const removeUnitFromChainIfNotCiv = (propName: string, propChain: number[], civName: string, firstUnitInTreeID: number, UnitToRemove: number) => {
  const checkArray = propChain;
  if(checkArray.indexOf(firstUnitInTreeID)  > -1) {
    // console.log("hello unit tree");
  if (propName === civName) {
    const modArray = propChain;

      if(!modArray.includes(UnitToRemove))
      {
        // console.log("Add Special");
        modArray.push(UnitToRemove);
      }
      return modArray;
    }
  else {
    const index = checkArray.indexOf(UnitToRemove);
    const modArray = propChain;
    if (index > -1) { // only splice array when item is found
      return modArray.splice(index, 1); // 2nd parameter means remove one item only
    }
  }
  }
};

const removeMultipleUnitsFromSpecificCivChain = (type: string, propName: string, propChain: number[], civName: string, firstUnitInTreeID: number, UnitToRemove1: number, UnitToRemove2: number, UnitToAdd: number) => {
  if(type !== "tech_chain") {
  const checkArray = propChain;
  if(checkArray.indexOf(firstUnitInTreeID)  > -1) {
    // console.log("hello unit tree");
  if (propName === civName) {
    const index = checkArray.indexOf(UnitToRemove1);
    const index2 = checkArray.indexOf(UnitToRemove2);
    const modArray = propChain;
    if (index > -1) { // only splice array when item is found
      modArray.splice(index, 1); // 2nd parameter means remove one item only
    }

    if(index2 > -1) {
      modArray.splice(index2, 1);
    }

    if(!modArray.includes(UnitToAdd))
      {
        // console.log("Add Special");
        modArray.push(UnitToAdd);
      }

    return modArray;
    }
  else {
    const modArray = propChain;
    const index = checkArray.indexOf(UnitToAdd);
    if (index > -1) { // only splice array when item is found
      modArray.splice(index, 1); // 2nd parameter means remove one item only
    }

    if(!modArray.includes(UnitToRemove1))
    {
      // console.log("Add Special");
      modArray.push(UnitToRemove1);
    }
    if(!modArray.includes(UnitToRemove2))
      {
        // console.log("Add Special");
        modArray.push(UnitToRemove2);
      }
    return modArray;
  }
}
}
};


type Props = {
  civName: string;
  uniquetype?: string;
  unique?: boolean;
  civData: TechTreeData["techtrees"][TechTreeCiv];
} & (
    | {
      type: "build";
      id: EBuild;
    }
    | {
      type: "unit";
      chain: number[];
    }
    | {
      type: "tech_chain";
      chain: number[];
    }
    | {
      type: "tech";
      id: number;
    });

export const Card: FC<Props> = (props) => {

  const chain = useMemo(() => {
    if (props.type === "unit" || props.type === "tech_chain") {
      // console.log(props.chain);
      // Paladin and Savar
      return uniqueUnitUpgrades(props.civName, props.chain, "Persians", "Persians", 38, 569, 1813) ?? 
      // Hussar and Winged Hussar
      uniqueUnitUpgrades(props.civName, props.chain, "Poles", "Lithuanians", 448, 441, 1707) ?? 
      // Imperial Skirm
      removeUnitFromChainIfNotCiv(props.civName, props.chain, "Vietnamese", 7, 1155) ??
      // houfnice
      removeUnitFromChainIfNotCiv(props.civName, props.chain, "Bohemians", 36, 1709) ??
      // Imp camel rider
      removeUnitFromChainIfNotCiv(props.civName, props.chain, "Hindustanis", 329, 207) ??
      // Legionary
      removeMultipleUnitsFromSpecificCivChain(props.type, props.civName, props.chain, "Romans", 77, 473, 567, 1793) ??
      // Default
      props.chain;
    }

    return [];

  }, [props]);

  const picId = useMemo(() => {
    if (props.type === "build" || props.type === "tech") {
      return props.id;
    } else if (props.type === "unit" || props.type === "tech_chain") {

      let listOfAvailableUnits: number[] = [];

      props.chain.forEach((item) => {
        // console.log("item: " + item);
        if (props.type === "unit") {
          // console.log("unit.return: " + props.civData.units.some((unit) => unit.id === item));
          // console.log(props.civData.unique);
          if (props.civData.units.some((unit) => unit.id === item)) {
            listOfAvailableUnits.push(item);
          }
        } else if (props.type === "tech_chain") {
          // console.log("techchain.return: " + props.civData.techs.some((tech) => tech.id === item));

          // Add Donjon for sicilians to uni tech tree
          if(props.civData.buildings.some((building) => building.id === item)){
            listOfAvailableUnits.push(item);
          }
          if (props.civData.techs.some((tech) => tech.id === item)) {
            listOfAvailableUnits.push(item);
          }
        }
      });
      if(props.unique === true){
        listOfAvailableUnits = props.chain;
      }

      const result = listOfAvailableUnits.slice(-1)[0];
      const val = props.chain.find(Boolean);
      if (result !== undefined) {
        return result;
      }
      // 420 = cannon galleon, 1104 = demo ship, 1103 = fireship, 5 = handcannon, 36 = bombard, 81 = horse armor
      else if ([420, 1104, 1103, 5, 36, 81, 319, 316, 439, 230, 438, 377].includes(Number(val))) {
        return val;
      }

    }
  }, [props]);


  const isDisabled = useMemo(() => {
    if (props.type === "build") {
      return !props.civData.buildings.some(({ id }) => id === props.id);
    } else if (props.type === "unit") {
        return props.unique ? false : !props.chain.some((id) => props.civData.units.some((unit) => unit.id === id));
    } else if (props.type === "tech") {
      return !props.civData.techs.some(({ id }) => id === props.id);
    } else if (props.type === "tech_chain") {
      return props.chain.some((id) => id === 1665) ? false : !props.chain.some((id) => props.civData.techs.some((tech) => tech.id === id));
    }

    return false;
  }, [props]);

  const isUnique = useMemo(() => {
    if(props.unique === true) {
      return true;
    }
    if (props.type === "unit") {
      
      let listOfAvailableUnits: number[] = [];

      props.chain.forEach((item) => {
        // console.log("item: " + item);
        if (props.type === "unit") {
          // console.log("unit.return: " + props.civData.units.some((unit) => unit.id === item));
          if (props.civData.units.some((unit) => unit.id === item)) {
            listOfAvailableUnits.push(item);
          }
        }
      });

      const result = listOfAvailableUnits.slice(-1)[0];
      if(result !== undefined){
        // Slinger, Imp Skirm, Hoefnice, Genitour, VikingShip, Caraval, turtleShip, Legionary, Conditierro, Flemish Militia, Shirvamsha Rider, Savar, Winged Hussar, Camel Scout, Xolotl Warrior, thirisadai
          if([185, 1155, 1709, 1012, 533, 1006, 832, 1793, 882, 1699, 1753, 1813, 1707, 1755, 207, 1570, 1263, 1750].includes(result)) {
            return true;
          }
        }
      }
      return false;

  }, [props]);

  if (!picId) {
    return null;
  }

  return (
    <div
      className={clsx(
        classes.card,
        classes[isUnique ? `uu_${props.uniquetype}` : `card_${props.type === "tech_chain" ? "tech" : props.type}`],
        isDisabled && classes.card_disabled,
        isUnique && classes.card_unique
      )}
    >
      <div
        className={clsx(classes.card__img, isDisabled && classes.disabled_img)}
        style={{backgroundImage: `url(${picId === 1665 ? getPic("build",picId) : getPic(props.type === "tech_chain" ? "tech" : props.type,picId)})`, backgroundColor: isDisabled ?   'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0)'}}
        // src={ picId === 1665 ? getPic("build",picId) : getPic(props.type === "tech_chain" ? "tech" : props.type,picId)}
        // src={""}
        // alt={String(picId)}
        
      />

      {(props.type === "unit" || props.type === "tech_chain") && !isDisabled && (
        <div className={classes.circles}>
          {chain.map((item, idx) => {
            const enabled = (() => {
              if (props.type === "unit") {
                return props.unique ? true : props.civData.units.some((unit) => unit.id === item);
              } else if (props.type === "tech_chain") {
                return props.chain.some((id) => id === 1665) ? true : props.civData.techs.some((tech) => tech.id === item);
              }

              return item !== 0;
            })();

            return (
              <div
                key={idx}
                className={clsx(
                  classes.circles__item,
                  enabled && classes.circles__item_enabled
                )}
              />
            )
          })}
        </div>
      )}
    </div>
  );
}