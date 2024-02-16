/*
 * LineParser.js - Parser for plain text files
 *
 * Copyright © 2022-2024 JEDLSoft
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
import { Parser, IntermediateRepresentation } from 'ilib-lint-common';

/**
 * @class Parser for plain text files that splits them by lines
 */
class LineParser extends Parser {
    /**
     * Construct a new plugin.
     * @constructor
     */
    constructor(options) {
        super(options);
        this.path = options.filePath;

        this.extensions = [ "txt", "md" ];
        this.name = "line";
        this.description = "A parser for plain text files that splits them into lines."
    }

    /**
     * Parse the current file into an intermediate representation.
     */
    parse() {
        const data = fs.readFileSync(this.path, "utf-8");
        const lines = data.split(/\n/g);
        return [new IntermediateRepresentation({
            type: "line",
            ir: lines,
            filePath: this.path
        })];
    }

    getType() {
        return "line";
    }

    getExtensions() {
        return this.extensions;
    }
};

export default LineParser;
