/*
 * StringFixer.js
 *
 * Copyright © 2023 JEDLSoft
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

import { Fixer, IntermediateRepresentation } from "i18nlint-common";
import StringParser from "./StringParser.js";
import { StringFixCommand } from "./StringFixCommand.js";
import { StringFix } from "./StringFix.js";

export class StringFixer extends Fixer {
    /**
     * @override
     * Matches IRs produced by {@link StringParser}
     */
    type = "string";

    /**
     * @overide
     * @param {IntermediateRepresentation} ir
     * @param {StringFix[]} fixes
     */
    applyFixes(ir, fixes) {
        // skip fix if there is any overlap with
        // the fixes that have already been enqueued for processing
        let enqueued = fixes.reduce((queue, fix) => {
            if (!queue.some((enqueued) => fix.overlaps(enqueued))) {
                queue.push(fix);
            }
            return queue;
        }, /** @type {StringFix[]} */ ([]));

        enqueued.forEach((fix) => {
            fix.applied = true;
        });

        ir.ir = StringFixCommand.applyCommands(
            ir.ir,
            enqueued.flatMap((fix) => fix.commands)
        );
    }

    /** 
     * Creates a string fix which can consist of multiple {@link StringFixer.commands|commands}
     */
    createFix(/** @type {StringFixCommand[]} */ ...commands) {
        return new StringFix(...commands);
    }

    /** @readonly */
    commands = {
        /**
         * Insert a given string `content` after a character at `position` in a string
         *
         * Example:
         * `"example"` & `insertAfter(1, "EEE")` => `"eEEExample"`
         *
         * @param {number} position position in string after which the operation should be performed
         * @param {string} newContent string that should be inserted
         * @returns {StringFixCommand}
         * @readonly
         */
        insertAfter: (position, newContent) => {
            return StringFixCommand.insertAfter(position, newContent);
        },
        /**
         * Delete a `count` characters after a character at `position` in a string
         *
         * Example:
         * `"example"` & `deleteAfter(2, 2)` => `"exple"`
         *
         * @param {number} position position in string after which the operation should be performed
         * @param {number} count count of characters that should be deleted
         * @returns {StringFixCommand}
         * @readonly
         */
        deleteAfter: (position, count) => {
            return StringFixCommand.deleteAfter(position, count);
        },
        /**
         * Delete a `count` characters after a character at `position` in a string,
         * and then insert string `content` in there
         *
         * Example:
         * `"example"` & `replaceAfter(3, 2, "EXAMPLE")` => `"exaEXAMPLEle"`
         *
         * @param {number} position position in string after which the operation should be performed
         * @param {number} count count of characters that should be deleted
         * @param {string} newContent string that should be inserted
         * @returns {StringFixCommand}
         * @readonly
         */
        replaceAfter: (position, count, newContent) => {
            return StringFixCommand.replaceAfter(position, count, newContent);
        },
    }
}

export default StringFixer;
