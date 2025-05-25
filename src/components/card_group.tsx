import { ComponentProps, FC } from "react";
import { EBuild, Tree } from "../fixtures/tree.ts";
import { Card } from "./card.tsx";
import classes from "../App.module.css";

type Props = {
  civName: string;
  buildId: EBuild;
  units: NonNullable<Tree["war_builds"][EBuild]>["units"];
  techs: NonNullable<Tree["war_builds"][EBuild]>["techs"];
  tech_chains: NonNullable<Tree["war_builds"][EBuild]>["tech_chains"];
  civData: ComponentProps<typeof Card>["civData"];
}

export const CardGroup: FC<Props> = ({
  civName,
  buildId,
  civData,
  units,
  techs,
  tech_chains,
}) => {
  return (
    // buildId === EBuild.SMITHY || buildId === EBuild.UNIVERSITY ? classes.push_div : ""
    <div>
      {/* <Card type="build" id={buildId} civName={civName} civData={civData} /> */}

      {units?.map((chain) => (
        <Card
          civName={civName}
          key={chain.join()}
          civData={civData}
          type="unit"
          chain={chain}
        />
      ))}

      {tech_chains?.map((chain) => (
        <Card
          civName={civName}
          key={chain.join()}
          civData={civData}
          type="tech_chain"
          chain={chain}
        />
      ))}
      
      {techs?.map((id) => (
        <Card
          civName={civName}
          key={id}
          civData={civData}
          type="tech"
          id={id}
        />
      ))}

    </div>
  )
}