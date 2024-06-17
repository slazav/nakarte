import parseVMAP1 from './vmap';
import parseGpx from './gpx';
import parseZip from './zip';
import {parseKmz, parseKml} from './kml';
import {parseOziPlt, parseOziRte, parseOziWpt} from './ozi';
import {parseGeojson} from './geojson';

const parsers = [
    parseVMAP1,
    parseKmz,
    parseZip,
    parseGpx,
    parseOziRte,
    parseOziPlt,
    parseOziWpt,
    parseKml,
    parseGeojson,
];

export default parsers;
