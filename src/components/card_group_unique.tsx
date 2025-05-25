import { ComponentProps, FC } from "react";
import { EBuild, Tree } from "../fixtures/tree.ts";
import classes from "../App.module.css";
import { Card } from "./card.tsx";

type Props = {
  civName: string;
  uniqueType: string;
  buildId: EBuild;
  units: Number[];
  techs: NonNullable<Tree["war_builds"][EBuild]>["techs"];
  tech_chains: NonNullable<Tree["war_builds"][EBuild]>["tech_chains"];
  civData: ComponentProps<typeof Card>["civData"];
}

export const CardGroupUnique: FC<Props> = ({
  civName,
  uniqueType,
  buildId,
  civData,
  units,
}) => {
  return (
    <div className={classes.unique_card}>
      {/* <Card type="build" id={buildId} civName={civName} civData={civData} /> */}

        <Card
          unique={true}
          uniquetype={uniqueType}
          civName={civName}
          key={units.join()}
          civData={civData}
          type="unit"
          chain={units as number[]}
        />

    </div>
  )
}