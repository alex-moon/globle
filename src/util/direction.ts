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
// suggestion: two libraries that do distance, bearing and centroid:
// https://turfjs.org
// https://www.npmjs.com/package/geodesy
function polygonNaiveCentroid(points: number[][]) {
    const lat = average(points.map(point => point[0]));
    const lng = average(points.map(point => point[1]));
    return [lat, lng] as [number, number];
}

function calcDirection(centroid1: [number, number], centroid2: [number, number]) {
    const heading = geometry.computeHeading(centroid1, centroid2);
    if (heading >= 337.5 || heading < 22.5) {
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
    if (heading < 202.5) {
        return 'south';
    }
    if (heading < 247.5) {
        return 'south west';
    }
    if (heading < 292.5) {
        return 'west';
    }
    if (heading < 337.5) {
        return 'north west';
    }
    return 'not sure lol';
}

export function polygonDirection(country1: Country, country2: Country): string {
    const points1 = polygonPoints(country1);
    const points2 = polygonPoints(country2);
    const centroid1 = polygonNaiveCentroid(points1);
    const centroid2 = polygonNaiveCentroid(points2);
    return calcDirection(centroid1, centroid2);
}
