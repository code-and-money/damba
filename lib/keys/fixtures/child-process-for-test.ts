import process from "node:process";
import { camelKeys } from "../camel";

const camelcaseKeysArgs = JSON.parse(process.argv[2]);

console.log(JSON.stringify(camelKeys(camelcaseKeysArgs)));
