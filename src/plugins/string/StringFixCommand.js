/*
 * StringFixCommand.js
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

export class StringFixCommand {
    /**
     * Contains information about a transformation that should be applied to a string.
     * 
     * @param {number} position position in string after which the operation should be performed
     * @param {number} deleteCount count of characters that should be deleted
     * @param {string} insertContent string that should be inserted
     */
    constructor(position, deleteCount, insertContent) {
        if (!Number.isInteger(position) || position < 0) {
            throw new Error("StringFixCommand position must be non-negative integer");
        }
        if (!Number.isInteger(deleteCount) || deleteCount < 0) {
            throw new Error("StringFixCommand deleteCount must be non-negative integer");
        }
        this.position = (position);
        this.deleteCount = deleteCount;
        this.insertContent = insertContent;
    }

    /**
     * position in string from which the operation should be performed
     *
     * in other words: after how many characters relative to original string
     * should the old characters be removed, and the new ones inserted
     * 
     * `example`
     * 
     * | position | previous letter | in string |
     * | --- | --- | --- |
     * | 0 | _none_ | `^example` |
     * | 1 | `e` | `e^xample` |
     * | 2 | `x` | `ex^ample` |
     * | 3 | `a` | `exa^mple` |
     * | 4 | `m` | `exam^ple` |
     * | 5 | `p` | `examp^le` |
     * | 6 | `l` | `exampl^e` |
     * | 7 | `e` | `example^` |
     * @type {number}
     * @readonly
     */
    position;
    /**
     * number of characters that should be deleted starting from {@link position}
     * @type {number}
     * @readonly
     */
    deleteCount;
    /**
     * string that should be inserted at {@link position}
     * @type {string}
     * @readonly
     */
    insertContent;

    /**
     * Range of the original string which this command intends to modify
     */
    get range() {
        return [this.position, this.position + this.deleteCount];
    }

    /**
     * Determines if the ranges of two fix commands have any overlap
     * @param {StringFixCommand} other
     */
    overlaps(other) {
        const thisRange = this.range;
        const otherRange = other.range;
        return thisRange[0] <= otherRange[1] && otherRange[0] <= thisRange[1];
    }

    /**
     * Creates a command to insert a given string `content` after a character at `position` in a string
     *
     * Example:
     * `"example"` & `insertAfter(1, "EEE")` => `"eEEExample"`
     *
     * @param {number} position position in string after which the operation should be performed
     * @param {string} newContent string that should be inserted
     * @returns {StringFixCommand}
     */
    static insertAfter(position, newContent) {
        return new StringFixCommand(position, 0, newContent);
    }
    /**
     * Creates a command to delete a `count` characters after a character at `position` in a string
     *
     * Example:
     * `"example"` & `deleteAfter(2, 2)` => `"exple"`
     *
     * @param {number} position position in string after which the operation should be performed
     * @param {number} count count of characters that should be deleted
     * @returns {StringFixCommand}
     */
    static deleteAfter(position, count) {
        return new StringFixCommand(position, count, "");
    }
    /**
     * Creates a command to delete a `count` characters after a character at `position` in a string,
     * and then insert string `content` in there
     *
     * Example:
     * `"example"` & `replaceAfter(3, 2, "EXAMPLE")` => `"exaEXAMPLEle"`
     *
     * @param {number} position position in string after which the operation should be performed
     * @param {number} count count of characters that should be deleted
     * @param {string} newContent string that should be inserted
     * @returns {StringFixCommand}
     */
    static replaceAfter(position, count, newContent) {
        return new StringFixCommand(position, count, newContent);
    }

    /**
     * Apply multiple StringFixCommands to a supplied string
     * @param {string} content string to apply commands to
     * @param {StringFixCommand[]} commands commands that should be applied to the content string
     * @return {string} modified content
     */
    static applyCommands(content, commands) {
        if (commands.some((one, idx) => commands.slice(idx + 1).some((other) => one.overlaps(other)))) {
            throw new Error("Cannot apply the commands because some of them overlap with each other");
        }
        if (commands.some((command) => command.range[1] > content.length)) {
            throw new Error("Cannot apply the commands because some of them exceed range of the string to modify");
        }

        // sort the commands by the position in which they should be applied
        const sortedCommands = [...commands].sort((a, b) => a.position - b.position);

        // extract those pieces of the original that should be preserved

        // calculate complement ranges for preservation
        // i.e. for a string of length 10 where range [4,6] should be modified,
        // complement ranges for preservation are [0,4] and [6,10]
        const complementRanges =
            // get all range edges: 0, 4, 6, 10
            [0, ...sortedCommands.flatMap((c) => c.range), content.length]
                // bucket them into chunks of 2 items: [0,4], [6,10]
                .reduce((chunks, element, elementIdx) => {
                    const chunkIdx = Math.floor(elementIdx / 2);
                    if (chunks[chunkIdx] === undefined) {
                        chunks[chunkIdx] = [];
                    }
                    chunks[chunkIdx].push(element);
                    return chunks;
                }, /** @type {number[][]} */ ([]));
        // use complement ranges to extract chunks for preservation
        const preservedChunks = complementRanges.map((range) => content.slice(...range));

        // create modified string by interlacing the preserved chunks of original with the replacement contents from each command
        return preservedChunks
            .flatMap((_, idx) => [
                preservedChunks[idx],
                // there is always 1 more of chunks preserved than of commands to apply
                commands[idx]?.insertContent ?? "",
            ])
            .join("");
    }
}

export default StringFixCommand;