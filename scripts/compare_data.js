import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const PROCESSED_PATH = path.join(DATA_DIR, 'processed_data.json');
const MANIFEST_PATH = path.join(DATA_DIR, 'data.json');

function compare() {
    if (!fs.existsSync(PROCESSED_PATH) || !fs.existsSync(MANIFEST_PATH)) {
        console.error('One or both data files are missing.');
        return;
    }

    const processed = JSON.parse(fs.readFileSync(PROCESSED_PATH, 'utf8'));
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

    console.log('--- Data Comparison ---');

    // 1. Check Top Level Data Counts
    const mUnits = Object.keys(manifest.data.units || {}).length;
    const pUnits = Object.keys(processed.data.units || {}).length;
    console.log(`Units: Manifest(${mUnits}) vs Processed(${pUnits}) - ${mUnits === pUnits ? 'MATCH' : 'MISMATCH'}`);

    const mBuildings = Object.keys(manifest.data.buildings || {}).length;
    const pBuildings = Object.keys(processed.data.buildings || {}).length;
    console.log(`Buildings: Manifest(${mBuildings}) vs Processed(${pBuildings}) - ${mBuildings === pBuildings ? 'MATCH' : 'MISMATCH'}`);

    const mTechs = Object.keys(manifest.data.techs || {}).length;
    const pTechs = Object.keys(processed.data.techs || {}).length;
    console.log(`Techs: Manifest(${mTechs}) vs Processed(${pTechs}) - ${mTechs === pTechs ? 'MATCH' : 'MISMATCH'}`);

    // 2. Check Civilizations
    const mCivs = Object.keys(manifest.techtrees || {});
    const pCivs = Object.keys(processed.techtrees || {});
    console.log(`Civilizations (filtered): Manifest(${mCivs.length}) vs Processed(${pCivs.length}) - ${mCivs.length === pCivs.length ? 'MATCH' : 'MISMATCH'}`);

    // 3. Sample Check: node_id preservation vs picture_index
    const sampleCiv = pCivs[0];
    if (sampleCiv) {
        console.log(`\nSample check for ${sampleCiv}:`);
        const civData = processed.techtrees[sampleCiv];
        const building = civData.buildings[0];
        if (building) {
            console.log(`  First Building ID: ${building.id}`);
            console.log(`  First Building Picture Index: ${building.picture_index}`);
            if (building.id === building.picture_index) {
                console.warn('  WARNING: ID matches Picture Index. node_id preservation might have failed if they were meant to be different.');
            } else {
                console.log('  SUCCESS: ID and Picture Index are distinct (assuming they were different in source).');
            }
        }

        console.log(`  Unique Techs/Units:`);
        console.log(`    castleAgeUniqueUnit: ${civData.unique.castleAgeUniqueUnit}`);
        console.log(`    imperialAgeUniqueUnit: ${civData.unique.imperialAgeUniqueUnit}`);
    }

    // 4. Missing Keys in Manifest Data
    const manifestUnitKeys = Object.keys(manifest.data.units || {});
    const processedUnitKeys = Object.keys(processed.data.units || {});
    const missingUnits = manifestUnitKeys.filter(k => !processedUnitKeys.includes(k));
    if (missingUnits.length > 0) {
        console.error(`  ERROR: ${missingUnits.length} units missing from processed data!`);
    }
}

compare();
