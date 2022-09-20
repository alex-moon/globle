import * as geometry from "spherical-geometry-js";
import { Country } from "../lib/country";
import {polygonPoints} from "./geometry"

function average(values: number[]) {
    if (values.length === 0) {
        return null;
    }

    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
    }
    return sum / values.length;
}

// very silly implementation of centroid that's good enough for our purposes
// for reference, Worldle uses geolib: https://www.npmjs.com/package/geolib
function polygonNaiveCentroid(points: number[][]) {
    const lng = average(points.map(point => point[0]));
    const lat = average(points.map(point => point[1]));
    return [lng, lat] as [number, number];
}

// yoinked from www.movable-type.co.uk/scripts/latlong.html#rhumblines
function calculateRhumbLineBearing(point1: [number, number], point2: [number, number]) {
    const lat1 = point1[1];
    const lat2 = point2[1];
    const dlat = Math.log(Math.tan(Math.PI/4 + lat2/2) / Math.tan(Math.PI/4 + lat1/2));

    const lng1 = point1[0];
    const lng2 = point2[0];
    let dlng = lng2 - lng1; // @todo needs to be <180
    if (dlng > 180) {
        dlng = -(360 - dlng);
    }

    // if dlng over 180° take shorter rhumb line across the anti-meridian:
    if (Math.abs(dlng) > Math.PI) {
        dlng = (dlng > 0 ? -1 : 1 ) * (2*Math.PI-dlng);
    }

    return Math.atan2(dlng, dlat) * 180/Math.PI;
}

function calcDirection(centroid1: [number, number], centroid2: [number, number]) {
    const heading = calculateRhumbLineBearing(centroid1, centroid2);
    console.log('heading', heading);
    if (heading >= -22.5 && heading < 22.5) {
        return 'north';
    }
    if (heading < 67.5) {
        return 'north east';
    }
    if (heading < 112.5) {
        return 'east';
    }
    if (heading < 157.5) {
        return 'south east';
    }
    if (heading < -22.5) {
        return 'south';
    }
    if (heading < -67.5) {
        return 'south west';
    }
    if (heading < -112.5) {
        return 'west';
    }
    if (heading < -157.5) {
        return 'north west';
    }
    return 'not sure lol';
}

export function polygonDirection(country1: Country, country2: Country): string {
    console.log('guessing direction from', country1.properties.ADMIN, 'to', country2.properties.ADMIN);
    const points1 = polygonPoints(country1);
    const points2 = polygonPoints(country2);
    const centroid1 = polygonNaiveCentroid(points1);
    const centroid2 = polygonNaiveCentroid(points2);
    const result = calcDirection(centroid1, centroid2);
    console.log('direction', result);
    return result;
}
