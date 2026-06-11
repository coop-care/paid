import * as fs from "fs";
import * as path from "path";

// Resolve node_modules path relative to this file's location in tests/mocks/
const anyAsciiDir = path.resolve(__dirname, "../../node_modules/any-ascii");
const anyAsciiJsPath = path.join(anyAsciiDir, "any-ascii.js");
const blockJsPath = path.join(anyAsciiDir, "block.js");

// Read and convert block.js
const blockJsContent = fs.readFileSync(blockJsPath, "utf-8")
    .replace("export default function block", "function block") + "\nreturn block;";

const blockFn = new Function(blockJsContent)();

// Read and convert any-ascii.js
const anyAsciiJsContent = fs.readFileSync(anyAsciiJsPath, "utf-8")
    .replace("import block from './block.js';", "")
    .replace("export default function anyAscii", "function anyAscii") + "\nreturn anyAscii;";

const anyAsciiFn = new Function("block", anyAsciiJsContent)(blockFn);

export default anyAsciiFn;
