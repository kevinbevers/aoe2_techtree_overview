import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://aoe2techtree.net/data';
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const OUTPUT_PATH = path.join(DATA_DIR, 'processed_data.json');

// Standard Castle techs that are NOT unique techs
const STANDARD_CASTLE_TECHS = [315, 321, 377, 408];

async function transformData() {
    console.log('Starting data transformation from API...');

    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }

        console.log('Fetching manifest...');
        const manifestResponse = await fetch(`${BASE_URL}/data.json`);
        if (!manifestResponse.ok) {
            throw new Error(`Failed to fetch manifest: ${manifestResponse.statusText}`);
        }
        const manifest = await manifestResponse.json();

        // Map manifest data to lowercase plural keys expected by UI
        const processedData = {
            civ_names: manifest.civ_names || {},
            civ_helptexts: manifest.civ_helptexts || {},
            techtrees: {}, // Start with empty object, build it up from tree data
            tech_tree_strings: manifest.tech_tree_strings || {},
            data: {
                units: manifest.data.units || manifest.data.Unit || {},
                buildings: manifest.data.buildings || manifest.data.Building || {},
                techs: manifest.data.techs || manifest.data.Tech || {}
            },
            age_names: manifest.age_names || {}
        };

        const civKeys = Object.keys(manifest.civs || {});
        console.log(`Found ${civKeys.length} civilizations in manifest. Filtering and fetching tree data...`);

        // Map civ names to their tree file names (for cases where they don't match)
        const civToTreeNameMap = {
            "Hindustanis": "INDIANS",
            "Magyars": "MAGYAR",
            // Add other mappings here if needed
        };

        // First, fetch a reference civ that has all buildings to get a complete list of all techs and buildings
        // Use "Saracens" as reference (they have almost everything)
        let allTechsMap = new Map(); // Map<techId, {age, picture_index, building_id}>
        let allBuildingsMap = new Map(); // Map<buildingId, {age, picture_index}>
        const referenceCiv = "Saracens";
        try {
            const refTreeResponse = await fetch(`${BASE_URL}/trees/${referenceCiv.toUpperCase()}.json`);
            if (refTreeResponse.ok) {
                const refTreeData = await refTreeResponse.json();

                // Collect reference techs
                (refTreeData.units_techs || [])
                    .filter(n => n.use_type === 'Tech')
                    .forEach(item => {
                        allTechsMap.set(item.node_id, {
                            age: item.age_id,
                            picture_index: item.picture_index,
                            building_id: item.building_id
                        });
                    });

                // Collect reference buildings
                (refTreeData.buildings || [])
                    .forEach(item => {
                        allBuildingsMap.set(item.node_id, {
                            age: item.age_id,
                            picture_index: item.picture_index
                        });
                    });

                console.log(`Reference civ (${referenceCiv}) loaded: ${allTechsMap.size} techs and ${allBuildingsMap.size} buildings found`);
            }
        } catch (err) {
            console.warn(`Warning: Could not load reference civ ${referenceCiv}: ${err.message}`);
        }

        for (const civKey of civKeys) {
            const civMetadata = manifest.civs[civKey];
            if (civKey === 'Armenians') {
                console.log('Armenians Metadata Units:', civMetadata.Unit);
            }

            // Filter out antiquity era
            if (civMetadata.era === 'antiquity') {
                console.log(`Skipping antiquity era civ: ${civKey}`);
                continue;
            }

            // Use mapped tree name if available, otherwise use uppercase civKey
            const treeFileName = civToTreeNameMap[civKey] || civKey.toUpperCase();
            const treeUrl = `${BASE_URL}/trees/${treeFileName}.json`;

            console.log(`Fetching tree for ${civKey}...`);
            try {
                const treeResponse = await fetch(treeUrl);
                if (!treeResponse.ok) {
                    console.warn(`Warning: Failed to fetch tree for ${civKey} (${treeResponse.status}). Skipping details.`);
                    processedData.civ_names[civKey] = String(civMetadata.name_string_id);
                    processedData.civ_helptexts[civKey] = String(civMetadata.help_string_id);
                    processedData.techtrees[civKey] = {
                        era: civMetadata.era,
                        help_string_id: civMetadata.help_string_id,
                        internal_name: civMetadata.internal_name,
                        name_string_id: civMetadata.name_string_id,
                        meta: civMetadata.meta || {},
                        unique: {
                            castleAgeUniqueUnit: -1,
                            imperialAgeUniqueUnit: -1,
                            castleAgeUniqueTech: -1,
                            imperialAgeUniqueTech: -1
                        },
                        buildings: [],
                        techs: [],
                        units: []
                    };
                    continue;
                }

                const treeData = await treeResponse.json();
                const unitsTechs = treeData.units_techs || [];

                // Extract unique units and techs
                const unique = {
                    castleAgeUniqueUnit: -1,
                    imperialAgeUniqueUnit: -1,
                    castleAgeUniqueTech: -1,
                    imperialAgeUniqueTech: -1
                };

                // Find Unique Units from tree data
                const uniqueUnitsAtCastle = (treeData.units_techs || []).filter(n => n.node_type === 'UniqueUnit' && n.building_id === 82);
                const castleUU = uniqueUnitsAtCastle.find(n => n.age_id === 3);
                const imperialUU = uniqueUnitsAtCastle.find(n => n.age_id === 4);

                if (castleUU) unique.castleAgeUniqueUnit = castleUU.node_id;
                if (imperialUU) unique.imperialAgeUniqueUnit = imperialUU.node_id;

                // Find Unique Techs (Research at Castle that are not standard)
                const researchAtCastle = (treeData.units_techs || []).filter(n => n.node_type === 'Research' && n.building_id === 82);
                const uniqueTechs = researchAtCastle.filter(n => !STANDARD_CASTLE_TECHS.includes(n.node_id));

                const castleUT = uniqueTechs.find(n => n.age_id === 3);
                const imperialUT = uniqueTechs.find(n => n.age_id === 4);

                if (castleUT) unique.castleAgeUniqueTech = castleUT.node_id;
                if (imperialUT) unique.imperialAgeUniqueTech = imperialUT.node_id;

                // Get available IDs from civMetadata if they exist
                const availableBuildings = new Set(civMetadata.Building || []);
                const availableTechs = new Set(civMetadata.Tech || []);
                const availableUnits = new Set(civMetadata.Unit || []);

                // Build merged civ object
                // Only include specific fields from civMetadata, exclude Building/Tech/Unit arrays
                const mergedCiv = {
                    era: civMetadata.era,
                    help_string_id: civMetadata.help_string_id,
                    internal_name: civMetadata.internal_name,
                    name_string_id: civMetadata.name_string_id,
                    meta: civMetadata.meta || {},
                    unique,
                    // Include ALL buildings/techs/units so we can get picture_index for unavailable ones
                    // But mark which are available for the component to use
                    buildings: (() => {
                        const buildingsFromTree = new Map();
                        (treeData.buildings || []).forEach(item => {
                            buildingsFromTree.set(item.node_id, {
                                age: item.age_id,
                                id: item.node_id,
                                picture_index: item.picture_index,
                                available: availableBuildings.size > 0
                                    ? availableBuildings.has(item.node_id)
                                    : (item.available !== false && item.available !== null)
                            });
                        });

                        // Add missing buildings from reference (e.g., Stables for Aztecs)
                        allBuildingsMap.forEach((refBuilding, buildingId) => {
                            if (!buildingsFromTree.has(buildingId)) {
                                buildingsFromTree.set(buildingId, {
                                    age: refBuilding.age,
                                    id: buildingId,
                                    picture_index: refBuilding.picture_index,
                                    available: false
                                });
                            }
                        });

                        return Array.from(buildingsFromTree.values());
                    })(),
                    techs: (() => {
                        // Get techs from treeData
                        const techsFromTree = new Map();
                        (treeData.units_techs || [])
                            .filter(n => n.use_type === 'Tech')
                            .forEach(item => {
                                techsFromTree.set(item.node_id, {
                                    age: item.age_id,
                                    id: item.node_id,
                                    picture_index: item.picture_index,
                                    available: availableTechs.size > 0
                                        ? availableTechs.has(item.node_id)
                                        : (item.available !== false && item.available !== null)
                                });
                            });

                        // Add missing techs from reference (e.g., Stable techs when Stables don't exist)
                        allTechsMap.forEach((refTech, techId) => {
                            if (!techsFromTree.has(techId)) {
                                techsFromTree.set(techId, {
                                    age: refTech.age,
                                    id: techId,
                                    picture_index: refTech.picture_index,
                                    available: false // Mark as unavailable since it's not in treeData
                                });
                            }
                        });

                        return Array.from(techsFromTree.values());
                    })(),
                    units: (treeData.units_techs || [])
                        .filter(n => n.use_type === 'Unit')
                        .map(item => ({
                            age: item.age_id,
                            id: item.node_id,
                            picture_index: item.picture_index,
                            available: availableUnits.size > 0
                                ? availableUnits.has(item.node_id)
                                : (item.available !== false && item.available !== null)
                        }))
                };

                processedData.civ_names[civKey] = String(civMetadata.name_string_id);
                processedData.civ_helptexts[civKey] = String(civMetadata.help_string_id);
                processedData.techtrees[civKey] = mergedCiv;
            } catch (err) {
                console.error(`Error processing ${civKey}: ${err.message}`);
            }
        }

        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(processedData, null, 2));
        console.log(`Success! Processed data saved to ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('Critical error during transformation:', error.message);
        process.exit(1);
    }
}

transformData();
