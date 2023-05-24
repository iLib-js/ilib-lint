/*
 * StringParser.js - Parser for plain text files
 *
 * Copyright © 2022-2023 JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'node:fs';
import { Parser, IntermediateRepresentation } from 'i18nlint-common';

/**
 * @class Parser for plain text files that treats the whole file as a
 * simple string.
 */
class StringParser extends Parser {
    /**
     * Construct a new plugin.
     * @constructor
     */
    constructor(options = {}) {
        super(options);
        this.path = options.filePath;

        this.extensions = [ "*" ]; // can parse any text file
        this.name = "string";
        this.description = "A parser for plain text files treats the whole file as a simple string."
    }

    /**
     * Parse the current file into an intermediate representation.
     */
    parse() {
        const data = fs.readFileSync(this.path, "utf-8");
        return [new IntermediateRepresentation({
            type: "string",
            ir: data,
            filePath: this.path
        })];
    }

    getType() {
        return "string";
    }

    getExtensions() {
        return this.extensions;
    }

    canWrite = true;

    /** 
     * @override
     * @param {IntermediateRepresentation<string>} ir
     */
    write(ir) {
        if (ir.type !== "string") {
            throw new Error(`Cannot write representation of type ${ir.type}`);
        }
        fs.writeFileSync(this.path, ir.ir, "utf-8");
    }
};

export default StringParser;
