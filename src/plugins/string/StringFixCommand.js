/*
 * StringFixCommand.js
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

/**
 * Provides instruction for modification of a string
 */
export class StringFixCommand {
    /**
     * position in string after which the operation should be performed
     *
     * in other words, after how many characters relative to original string
     * should the old characters be removed, and the new ones inserted
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
     * @private
     * Don't use constructor directly - instead, use static factory methods:
     * - {@link insertAfter}
     * - {@link deleteAfter}
     * - {@link replaceAfter}
     *
     * @param {number} position position in string after which the operation should be performed
     * @param {number} deleteCount count of characters that should be deleted
     * @param {string} insertContent string that should be inserted
     */
    constructor(position, deleteCount, insertContent) {
        this.position = position;
        this.deleteCount = deleteCount;
        this.insertContent = insertContent;
    }

    /**
     * Range of the original string which this command intends to modify
     */
    get range() {
        return [this.position, this.position + this.deleteCount];
    }

    /**
     * Determines if two instances intend to modify the same range of the original string
     * @param {StringFixCommand} other
     */
    overlaps(other) {
        const thisRange = this.range;
        const otherRange = other.range;
        return thisRange[0] <= otherRange[1] && otherRange[0] <= thisRange[1];
    }

    /**
     * Create a copy of this object whose position is offset by a given count of characters
     * @param {number} count count of characters by which the {@link position}
     * should be offset
     */
    offsetCopy(count) {
        return new StringFixCommand(this.position + count, this.deleteCount, this.insertContent);
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
        // sort the commands by the position in which they should be applied
        let commandsQueue = commands.sort((a, b) => a.position - b.position);

        let modified = content;

        let command;
        while ((command = commandsQueue.shift())) {
            modified =
                modified.slice(0, command.position) +
                command.insertContent +
                modified.slice(command.position + command.deleteCount);
            // offset commands by the amount of position shift that has just occurred (i.e. subtract deleted char count and add inserted char count)
            commandsQueue = commandsQueue.map((enqueued) =>
                enqueued.offsetCopy(command.insertContent.length - command.deleteCount)
            );
        }

        return modified;
    }
}