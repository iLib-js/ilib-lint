/*
 * StringFixer.js
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

import { Fix, Fixer, IntermediateRepresentation } from "i18nlint-common";
import StringParser from "./StringParser.js";

/**
 * @typedef StringFixCommand
 * @type {InsertCommand | DeleteCommand}
 */

/**
 * @typedef InsertCommand
 * @property {'INSERT'} command
 * @property {number} after character id after which the insertion should be performed
 * @property {string} content string that should be inserted
 */

/**
 * @typedef DeleteCommand
 * @property {'DELETE'} command
 * @property {number} after character id after which the deletion should be performed
 * @property {number} count number of characters that should be deleted
 */

export class StringFix extends Fix {
    /**
     * @override
     * Matches IRs produced by {@link StringParser}
     */
    type = "string";

    /**
     * @readonly
     * @type {StringFixCommand[]}
     */
    commands = [];

    constructor(/** @type {StringFixCommand[]} */ ...commands) {
        super();
        this.commands = commands;
    }

    /** @readonly */
    static commands = {
        /** @readonly @type {(position: number, content: string) => InsertCommand} */ insertAfter: (
            position,
            content
        ) => ({ command: "INSERT", after: position, content }),
        /** @readonly @type {(position: number, count: number) => DeleteCommand} */ deleteAfter: (position, count) => ({
            command: "DELETE",
            after: position,
            count,
        }),
    };
}

export class StringFixer extends Fixer {
    /**
     * @override
     * Matches IRs produced by {@link StringParser}
     */
    type = "string";

    /**
     * @overide
     * @param {IntermediateRepresentation<string>} ir
     * @param {StringFix[]} fixes
     */
    applyFixes(ir, fixes) {
        let /** @type {StringFixCommand[]} */ pickedCommands = [];

        for (const fix of fixes) {
            // skip fix if there is any overlap with
            // the fixes that have already been picked for processing
            if (
                fix.commands.some((command) => {
                    // insert and delete can only overlap if their starting positions are equal
                    pickedCommands.some((pickedCommand) => pickedCommand.after === command.after);
                })
            ) {
                continue;
            }

            // otherwise, add its commands to the queue
            pickedCommands.push(...fix.commands);
            // and mark the fix as applied
            fix.applied = true;
        }

        ir.ir = StringFixer.applyCommands(ir.ir, pickedCommands);
    }
    /**
     * @param {string} content
     * @param {StringFixCommand[]} commands commands that should be applied one by one
     * @return {string} modified content
     */
    static applyCommands(content, commands) {
        // sort the commands by the position in which they should be applied
        const sortedCommands = commands.map((command, idx) => ({command, idx})).sort((a, b) => {
            let pointComp = a.command.after - b.command.after;
            if (pointComp !== 0) return pointComp;
            // if the positions are equal, ensure that the order of commands is preserved
            // (a single fix is allowed to use multiple commands in the same place, because it knows the order in which they should be executed)
            return a.idx - b.idx;
        }).map(({command}) => command);

        // copy the commands so that they could be modified internally here
        const copiedCommands = sortedCommands.map(c => ({...c}));

        let modified = content;
        for (const command of copiedCommands) {
            switch (command.command) {
                case "INSERT":
                    modified =
                        modified.slice(0, command.after) +
                        command.content +
                        modified.slice(command.after);
                    // offset commands that should be applied onto the parts of string that will be further after this insertion
                    copiedCommands.filter(c => c.after > command.after).forEach(c => c.after += command.content.length);
                    break;
                case "DELETE":
                    modified =
                        modified.slice(0, command.after) +
                        modified.slice(command.after + command.count);
                    // offset commands that should be applied onto the parts of string that will be further after this insertion
                    copiedCommands.filter(c => c.after > command.after).forEach(c => c.after -= command.count);
                    break;
                default:
                    // @ts-expect-error: switch should be exhaustive, so the .command would have type `never`
                    throw new Error(`Unknown StringFixCommand ${command.command}`);
            }
        }

        return modified;
    }
}

export default StringFixer;
