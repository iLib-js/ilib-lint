/*
 * testStringFixCommand.js
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

import StringFixCommand from "../src/plugins/string/StringFixCommand.js";

const testCreation = {
    stringFixCommandShouldConstruct: function (test) {
        test.expect(1);
        test.ok(new StringFixCommand(0, 1, "test"));
        test.done();
    },

    stringFixCommandCtorShouldThrowPositionNegative: function (test) {
        test.expect(1);
        // can't insert before string start
        test.throws(() => new StringFixCommand(-1, 0, ""));
        test.done();
    },

    stringFixCommandCtorShouldThrowPositionNonInteger: function (test) {
        test.expect(1);
        // can't insert in the middle of a character
        test.throws(() => new StringFixCommand(0.5, 0, ""));
        test.done();
    },

    stringFixCommandCtorShouldThrowDeleteCountNegative: function (test) {
        test.expect(1);
        // can't delete backwards
        test.throws(() => new StringFixCommand(0, -1, ""));
        test.done();
    },

    stringFixCommandCtorShouldThrowDeleteCountNonInteger: function (test) {
        test.expect(1);
        // can't delete half a character
        test.throws(() => new StringFixCommand(0, 0.5, ""));
        test.done();
    },

    stringFixCommandFactoryMethodShouldCreateReplacementCommand: function (test) {
        test.expect(1);
        const expected = new StringFixCommand(0, 1, "test");
        const actual = StringFixCommand.replaceAfter(0, 1, "test");
        test.deepEqual(actual, expected);
        test.done();
    },

    stringFixCommandFactoryMethodShouldCreateInsertionCommand: function (test) {
        test.expect(1);
        const expected = new StringFixCommand(0, 0, "test");
        const actual = StringFixCommand.insertAfter(0, "test");
        test.deepEqual(actual, expected);
        test.done();
    },

    stringFixCommandFactoryMethodShouldCreateDeletionCommand: function (test) {
        test.expect(1);
        const expected = new StringFixCommand(0, 1, "");
        const actual = StringFixCommand.deleteAfter(0, 1);
        test.deepEqual(actual, expected);
        test.done();
    },
};

const testOverlap = {
    stringFixCommandShouldDetectOverlap: function (test) {
        test.expect(2);
        // command that modifies range [0,2] overlaps
        // another that modifies range [1,3]
        const one = StringFixCommand.replaceAfter(0, 2, "one");
        const other = StringFixCommand.replaceAfter(1, 2, "other");
        test.equals(true, one.overlaps(other));
        test.equals(true, other.overlaps(one));
        test.done();
    },

    stringFixCommandShouldNotDetectOverlapInDistinctRanges: function (test) {
        test.expect(2);
        // command that modifies range [0,2] does not overlap
        // another that modifies range [3,4]
        const one = StringFixCommand.replaceAfter(0, 2, "one");
        const other = StringFixCommand.replaceAfter(3, 2, "other");
        test.equals(false, one.overlaps(other));
        test.equals(false, other.overlaps(one));
        test.done();
    },

    stringFixCommandShouldNotDetectOverlapInAdjacentRanges: function (test) {
        test.expect(2);
        // command that modifies range [0,2] does not overlap
        // another that modifies range [2,3]
        const one = StringFixCommand.replaceAfter(0, 2, "one");
        const other = StringFixCommand.replaceAfter(2, 2, "other");
        test.equals(false, one.overlaps(other));
        test.equals(false, other.overlaps(one));
        test.done();
    },

    stringFixCommandShouldNotDetectOverlapInSamePlaceInsertions: function (test) {
        test.expect(2);
        // insertion starting from 0 does not overlap another insertion starting from 0
        // because logically, ranges modified by these insertions don't overlap
        // (both are empty)
        // though it would be better to combine them into a single longer insertion
        const one = StringFixCommand.insertAfter(0, "a");
        const other = StringFixCommand.insertAfter(0, "b");
        test.equals(false, one.overlaps(other));
        test.equals(false, other.overlaps(one));
        test.done();
    },

    stringFixCommandShouldDetectOverlapInSamePlaceDeletions: function (test) {
        test.expect(2);
        // deletion starting from 0 overlaps another deletion starting from 0
        const one = StringFixCommand.deleteAfter(0, 1);
        const other = StringFixCommand.deleteAfter(0, 2);
        test.equals(true, one.overlaps(other));
        test.equals(true, other.overlaps(one));
        test.done();
    },
};

const testApply = {
    stringFixCommandApplyShouldInsert: function (test) {
        test.expect(1);
        const input = "example";
        // insert "E" in the beginnning
        const command = StringFixCommand.insertAfter(0, "E");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "Eexample");
        test.done();
    },

    stringFixCommandApplyShouldDelete: function (test) {
        test.expect(1);
        const input = "example";
        // delete 1 char from the beginning
        const command = StringFixCommand.deleteAfter(0, 1);
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "xample");
        test.done();
    },

    stringFixCommandApplyShouldReplace: function (test) {
        test.expect(1);
        const input = "example";
        // replace 1 char from the beginning with "E"
        const command = StringFixCommand.replaceAfter(0, 1, "E");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "Example");
        test.done();
    },

    stringFixCommandApplyShouldInsertLonger: function (test) {
        test.expect(1);
        const input = "example";
        // insert "**" after 1st char
        const command = StringFixCommand.insertAfter(1, "**");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "e**xample");
        test.done();
    },

    stringFixCommandApplyShouldDeleteLonger: function (test) {
        test.expect(1);
        const input = "example";
        // delete 2 chars after the first char
        const command = StringFixCommand.deleteAfter(1, 2);
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "emple");
        test.done();
    },

    stringFixCommandApplyShouldReplaceShorterToLonger: function (test) {
        test.expect(1);
        const input = "example";
        // replace 2 chars after 1st char with shorter sequence "*"
        const command = StringFixCommand.replaceAfter(1, 2, "*");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "e*mple");
        test.done();
    },

    stringFixCommandApplyShouldReplaceLongerToShorter: function (test) {
        test.expect(1);
        const input = "example";
        // replace 1 char after 1st char with longer sequence "**"
        const command = StringFixCommand.replaceAfter(1, 1, "**");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "e**ample");
        test.done();
    },

    stringFixCommandApplyShouldApplyMultiple: function (test) {
        test.expect(1);
        const input = "example";
        const commands = [
            // replace 1st char with "E"
            StringFixCommand.replaceAfter(0, 1, "E"),
            // replace last char with "*"
            StringFixCommand.replaceAfter(6, 1, "*"),
        ];
        const modified = StringFixCommand.applyCommands(input, commands);
        test.equals(modified, "Exampl*");
        test.done();
    },

    stringFixCommandApplyShouldInsertSamePositionPreservingSequence: function (test) {
        // in context of string fix commands only, this behaviour can be expected
        // because logically, ranges modified by these insertions don't overlap
        // (both are empty) and the commands provided for .applyCommands() are
        // in an array, so one can assume that the order in which they were provided
        // is intentional and should be preserved;
        // of course, having two insertions in the same spot does not make too much sense,
        // because they should just be combined into a single, longer insertion instead
        test.expect(1);
        const input = "example";
        const commands = [
            // append "!"
            StringFixCommand.insertAfter(7, "!"),
            // append "?"
            StringFixCommand.insertAfter(7, "?"),
        ];
        const modified = StringFixCommand.applyCommands(input, commands);
        test.equals(modified, "example!?");
        test.done();
    },

    stringFixCommandApplyShouldThrowOnOverlap: function (test) {
        test.expect(1);
        const input = "example";
        // overlapping commands
        const commands = [
            // replace 1st two chars with "EX"
            StringFixCommand.replaceAfter(0, 2, "EX"),
            // replace 1st char with "*"
            StringFixCommand.replaceAfter(1, 1, "*"),
        ];
        test.throws(() => StringFixCommand.applyCommands(input, commands));
        test.done();
    },
};

export const testStringFixCommand = {
    ...testCreation,
    ...testOverlap,
    ...testApply,
};
