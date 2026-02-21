// 12, 87, 101, 49, 45, 103, 209
export enum EBuild {
  BARRACKS = 12,
  ARCHERY = 87,
  HORSE_STABLE = 101,
  ENGINE = 49,
  SMITHY = 103,
  UNIVERSITY = 209,
  CASTLE = 82,
  FORTRESS = 1251,
  DANJON = 1665,
  FORTIFIED_CHURCH = 1806,
  MONASTERY = 104,
  DOCK = 45
}

export type Tree = {
  war_builds: {
    [key in EBuild]?: {
      units?: Array<number[]>;
      tech_chains?: Array<number[]>;
      techs?: Array<number>;
    }
  },
  def_builds: number[];
}

export const tree: Tree = {
  war_builds: {
    [EBuild.CASTLE]: {
      units: [
        [1811],
        [1966],
        [1954],
        [1978],
      ],
    },
    [EBuild.BARRACKS]: {
      units: [
        [75, 77, 473, 567, 1793], //74, 75 //Militia line (Add 75 for jurchesn and now all militia line has 4 upgrade dots instead of 3 in previous build)
        [2550, 2588, 2552, 2554], // champi warrior line
        [93, 358, 359], // Spearman line
        [751, 753, 752], // Eagle line
        [1901, 1903], //Fire lancer
        [882],
        [2582, 2584], // Ibirapema warrior line
        [2586, 2587], // Temple guard line
        [1699], //Conditierro?
        [1974], //Jian swordsmen
      ],
      // techs: [716, 875, 215, 602],
    },
    [EBuild.ARCHERY]: {
      units: [
        [4, 24, 492],
        [7, 6, 1155],
        [185],
        [39, 474],
        [873, 875],
        [1010, 1012],
        [5],
        [1911], // Grenadier
        [1952], //Xianbei Raider
        [2569, 2571] //Bolas rider
      ],
      // techs: [437, 436]
    },
    [EBuild.HORSE_STABLE]: {
      units: [
        [448, 546, 441, 1707],
        [1751, 1753],
        [1755],
        [329, 330, 207],
        [38, 283, 569, 1813],
        [1132, 1134],
        [1370, 1372],
        [1570],
        [1944, 1946]
      ],
      // techs: [435, 39],
    },
    [EBuild.ENGINE]: {
      units: [
        [1258, 422, 548],
        [1744, 1746],
        [280, 550, 588],
        [1904,1907], // Magonel line
        [1923],
        [1942],
        [279, 542], // Scorpion line
        [1962], // War Chariot
        //[1105], // Siege tower
        [36, 1709],
        [331], // Treb
        [1263]
      ],
    },
    [EBuild.SMITHY]: {
      tech_chains: [
        [67, 68, 75],
        [199, 200, 201],
        [211, 212, 219],
        [74, 76, 77],
        [81, 82, 80],
      ],
      techs: [39, 435, 436, 875, 215, 437, 602], //716 is supplies which has been removed.
    },
    [EBuild.UNIVERSITY]: {
      tech_chains: [
        [140, 63, 64],
        [1665],
        // [319],
        // [316],
        // [439],
        // [230],
        // [438]
      ],
      techs: [377, 51, 230],
    },  
    [EBuild.MONASTERY]: {
      techs: [319, 316, 439, 438],
    },    
    [EBuild.DOCK]: {
      units: [
        [1103, 529, 532, 1302], //1302 = dragon ship
        [539, 21, 442],
        [1104, 527, 528],
        [2626, 2627, 2628], //Hulk line
        [420, 691], //Canon galleon line
        [2633], //Catapult galleon
        [1795], //Dromon
        [831, 832],
        [250, 533],
        [1004, 1006],
        [1750],
        [1948]
      ],
      techs: [375, 373]
    },
  },
  def_builds: [598, 72, 792, 79, 487, 117, 234, 155, 235, 236],
};