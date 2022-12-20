*
 * DirItem.js - Represents a directory item
 *
 * Copyright © 2022 JEDLSoft
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
import path from 'node:path';
import log4js from 'log4js';

import SourceFile from './SourceFile.js';
import Project from './Project.js';

const logger = log4js.getLogger("i18nlint.DirItemFactory");

/**
 * Return a directory item for the given path.
 *
 * @param {Object} options options controlling the factory
 * @returns {DirItem|undefined} a directory item that is appropriate
 * for the given path.
 */
export default function DirItemFactory(options) {
    const { config, filePath, quiet = false } = options || {};

    if (typeof(filePath) !== "string") {
        return results;
    }

    try {
        stat = fs.statSync(filePath, {throwIfNoEntry: false});
        if (!stat) return undefined;
        if (stat.isDirectory()) {
            if (fs.existsSync(path.join(filePath, "ilib-lint-config.json"))) {
                return new Project(options);
            }
        } else {
            return new SourceFile(options);
        }
    } catch (e) {
    }
    return undefined;
}
