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
    stringFixCommandShouldDetectOverlapInOverlappingReplacements: function (test) {
        test.expect(2);
        // command that modifies range [0,2] overlaps
        // another that modifies range [1,3]
        const one = StringFixCommand.replaceAfter(0, 2, "**");
        const other = StringFixCommand.replaceAfter(1, 2, "??");
        test.equals(true, one.overlaps(other));
        test.equals(true, other.overlaps(one));
        test.done();
    },

    stringFixCommandShouldNotDetectOverlapInDistinctReplacements: function (test) {
        test.expect(2);
        // command that modifies range [0,2] does not overlap
        // another that modifies range [3,4]
        // "example" & r 0 2 "**" & r 2 3 "??" => "**??le"
        const one = StringFixCommand.replaceAfter(0, 2, "**");
        const other = StringFixCommand.replaceAfter(3, 2, "??");
        test.equals(false, one.overlaps(other));
        test.equals(false, other.overlaps(one));
        test.done();
    },

    stringFixCommandShouldNotDetectOverlapInAdjacentReplacements: function (test) {
        test.expect(2);
        // command that modifies range [0,2] does not overlap
        // another that modifies range [2,3]
        // "example" & r 0 2 "**" & r 2 3 "??" => "**??le"
        const one = StringFixCommand.replaceAfter(0, 2, "**");
        const other = StringFixCommand.replaceAfter(2, 2, "??");
        test.equals(false, one.overlaps(other));
        test.equals(false, other.overlaps(one));
        test.done();
    },

    stringFixCommandShouldDetectOverlapInSamePositionInsertions: function (test) {
        test.expect(2);
        // insertion starting from 0 does overlap another insertion starting from 0
        // because the outcome would depend on the order of execution
        // "example" & i 0 "*" & i 0 "?" => "*?example"
        // but
        // "example" & i 0 "?" & i 0 "*" => "?*example"
        const one = StringFixCommand.insertAfter(0, "*");
        const other = StringFixCommand.insertAfter(0, "?");
        test.equals(true, one.overlaps(other));
        test.equals(true, other.overlaps(one));
        test.done();
    },

    stringFixCommandShouldNotDetectOverlapInSamePositionInsertionAndDeletion: function (test) {
        test.expect(2);
        // insertion of a char before first char of original string does not overlap
        // the removal of the first char of the original string
        // because the outcome is the same regardless of execution order
        // "example" & i 0 "*" & d 0 1 => "*xample"
        // and
        // "example" & d 0 1 & i 0 "*" => "*xample"
        const one = StringFixCommand.insertAfter(0, "*");
        const other = StringFixCommand.deleteAfter(0, 1);
        test.equals(false, one.overlaps(other));
        test.equals(false, other.overlaps(one));
        test.done();
    },

    stringFixCommandShouldDetectOverlapInInsertionWithinReplacement: function (test) {
        test.expect(2);
        // insertion after 1st char overlaps a replacement (or deletion) of first 2 chars
        const one = StringFixCommand.insertAfter(1, "*");
        const other = StringFixCommand.replaceAfter(0, 2, "??");
        test.equals(true, one.overlaps(other));
        test.equals(true, other.overlaps(one));
        test.done();
    },

    stringFixCommandShouldNotDetectOverlapInAdjacentDeletionThenInsertion: function (test) {
        test.expect(2);
        // deletion of a first char of the original string does not overlap
        // the insertion of the first char of the original string
        // because the outcome is the same regardless of execution order
        // "example" & i 0 "*" & d 0 1 => "*xample"
        // and
        // "example" & d 0 1 & i 0 "*" => "*xample"
        const one = StringFixCommand.insertAfter(0, "*");
        const other = StringFixCommand.deleteAfter(0, 1);
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
        // insert "*" after 1st char
        const command = StringFixCommand.insertAfter(1, "*");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "e*xample");
        test.done();
    },

    stringFixCommandApplyShouldDelete: function (test) {
        test.expect(1);
        const input = "example";
        // delete 2nd char
        const command = StringFixCommand.deleteAfter(1, 1);
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "eample");
        test.done();
    },

    stringFixCommandApplyShouldReplace: function (test) {
        test.expect(1);
        const input = "example";
        // replace 2nd char to "X"
        const command = StringFixCommand.replaceAfter(1, 1, "X");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "eXample");
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
        // delete 3rd and 4th char
        const command = StringFixCommand.deleteAfter(1, 2);
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "emple");
        test.done();
    },

    stringFixCommandApplyShouldReplaceShorterToLonger: function (test) {
        test.expect(1);
        const input = "example";
        // replace 3rd and 4th char with a shorter sequence "*"
        const command = StringFixCommand.replaceAfter(1, 2, "*");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "e*mple");
        test.done();
    },

    stringFixCommandApplyShouldReplaceLongerToShorter: function (test) {
        test.expect(1);
        const input = "example";
        // replace 2nd char with longer sequence "**"
        const command = StringFixCommand.replaceAfter(1, 1, "**");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "e**ample");
        test.done();
    },

    stringFixCommandApplyShouldApplyMultiple: function (test) {
        test.expect(1);
        const input = "example";
        const commands = [
            // replace 2nd char with "?"
            StringFixCommand.replaceAfter(1, 1, "?"),
            // replace last char with "*"
            StringFixCommand.replaceAfter(6, 1, "*"),
        ];
        const modified = StringFixCommand.applyCommands(input, commands);
        test.equals(modified, "e?ampl*");
        test.done();
    },

    stringFixCommandApplyShouldApplyMultipleUnordered: function (test) {
        test.expect(1);
        const input = "example";
        // input not ordered by position
        const commands = [
            // replace last char with "*"
            StringFixCommand.replaceAfter(6, 1, "*"),
            // replace 2nd char with "?"
            StringFixCommand.replaceAfter(1, 1, "?"),
        ];
        const modified = StringFixCommand.applyCommands(input, commands);
        test.equals(modified, "e?ampl*");
        test.done();
    },

    stringFixCommandApplyShouldApplyMultipleWithInsertion: function (test) {
        test.expect(1);
        const input = "example";
        const commands = [
            // insert "*" after 1st char
            StringFixCommand.insertAfter(1, "*"),
            // replace 2nd and 3rd char with "??"
            StringFixCommand.replaceAfter(1, 2, "??"),
        ];
        const modified = StringFixCommand.applyCommands(input, commands);
        test.equals(modified, "e*??mple");
        test.done();
    },

    stringFixCommandApplyShouldApplyMultipleWithInsertionUnordered: function (test) {
        test.expect(1);
        const input = "example";
        // input not ordered by position
        const commands = [
            // replace 2nd and 3rd char with "??"
            StringFixCommand.replaceAfter(1, 2, "??"),
            // insert "*" after 1st char
            StringFixCommand.insertAfter(1, "*"),
        ];
        const modified = StringFixCommand.applyCommands(input, commands);
        test.equals(modified, "e*??mple");
        test.done();
    },

    stringFixCommandApplyShouldThrowOnOverlap: function (test) {
        test.expect(1);
        const input = "example";
        // overlapping commands
        const commands = [
            // replace 1st and 2nd char with "**"
            StringFixCommand.replaceAfter(0, 2, "**"),
            // replace 1st char with "?"
            StringFixCommand.replaceAfter(1, 1, "?"),
        ];
        test.throws(() => StringFixCommand.applyCommands(input, commands));
        test.done();
    },

    stringFixCommandApplyShouldThrowOnReplacementOutOfBounds: function (test) {
        test.expect(1);
        const input = "example";
        // out of bounds
        const commands = [
            StringFixCommand.replaceAfter(99, 1, "*"),
        ];
        test.throws(() => StringFixCommand.applyCommands(input, commands));
        test.done();
    },

    stringFixCommandApplyShouldThrowOnInsertionOutOfBounds: function (test) {
        test.expect(1);
        const input = "example";
        // out of bounds
        const commands = [
            StringFixCommand.insertAfter(99, "*"),
        ];
        test.throws(() => StringFixCommand.applyCommands(input, commands));
        test.done();
    },

    stringFixCommandApplyShouldThrowOnDeletionOutOfBounds: function (test) {
        test.expect(1);
        const input = "example";
        // out of bounds
        const commands = [
            StringFixCommand.deleteAfter(99, 1),
        ];
        test.throws(() => StringFixCommand.applyCommands(input, commands));
        test.done();
    },

    stringFixCommandApplyShouldThrowOnReplacementOutOfBoundsByOne: function (test) {
        test.expect(1);
        const input = "example";
        // out of bounds by 1
        const commands = [
            StringFixCommand.replaceAfter(7, 1, "*"),
        ];
        test.throws(() => StringFixCommand.applyCommands(input, commands));
        test.done();
    },

    stringFixCommandApplyShouldPrepend: function (test) {
        test.expect(1);
        const input = "example";
        // insert "***" before 1st char
        const command = StringFixCommand.insertAfter(0, "***");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "***example");
        test.done();
    },

    stringFixCommandApplyShouldAppend: function (test) {
        test.expect(1);
        const input = "example";
        // insert "***" after last char
        const command = StringFixCommand.insertAfter(7, "***");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "example***");
        test.done();
    },

    stringFixCommandApplyShouldThrowOnDeletionOutOfBoundsByOne: function (test) {
        test.expect(1);
        const input = "example";
        // out of bounds by 1
        const commands = [
            StringFixCommand.deleteAfter(7, 1),
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
