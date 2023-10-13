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
    testStringFixCommandShouldConstruct: function(test) {
        test.expect(1);
        test.ok(new StringFixCommand(0, 1, "test"));
        test.done();
    },

    testStringFixCommandCtorShouldThrowPositionNegative: function(test) {
        test.expect(1);
        // can't insert before string start
        test.throws(() => new StringFixCommand(-1, 0, ""));
        test.done();
    },

    testStringFixCommandCtorShouldThrowPositionNonInteger: function(test) {
        test.expect(1);
        // can't insert in the middle of a character
        test.throws(() => new StringFixCommand(0.5, 0, ""));
        test.done();
    },

    testStringFixCommandCtorShouldThrowDeleteCountNegative: function(test) {
        test.expect(1);
        // can't delete backwards
        test.throws(() => new StringFixCommand(0, -1, ""));
        test.done();
    },

    testStringFixCommandCtorShouldThrowDeleteCountNonInteger: function(test) {
        test.expect(1);
        // can't delete half a character
        test.throws(() => new StringFixCommand(0, 0.5, ""));
        test.done();
    },

    testStringFixCommandFactoryMethodShouldCreateReplacementCommand: function(test) {
        test.expect(1);
        const expected = new StringFixCommand(0, 1, "test");
        const actual = StringFixCommand.replaceAfter(0, 1, "test");
        test.deepEqual(actual, expected);
        test.done();
    },

    testStringFixCommandFactoryMethodShouldCreateInsertionCommand: function(test) {
        test.expect(1);
        const expected = new StringFixCommand(0, 0, "test");
        const actual = StringFixCommand.insertAfter(0, "test");
        test.deepEqual(actual, expected);
        test.done();
    },

    testStringFixCommandFactoryMethodShouldCreateDeletionCommand: function(test) {
        test.expect(1);
        const expected = new StringFixCommand(0, 1, "");
        const actual = StringFixCommand.deleteAfter(0, 1);
        test.deepEqual(actual, expected);
        test.done();
    },
};

const testOverlap = {
    testStringFixCommandShouldDetectOverlapInOverlappingReplacements: function(test) {
        test.expect(2);
        // command that modifies range [0,2] overlaps
        // another that modifies range [1,3]
        const one = StringFixCommand.replaceAfter(0, 2, "**");
        const other = StringFixCommand.replaceAfter(1, 2, "??");
        test.equals(true, one.overlaps(other));
        test.equals(true, other.overlaps(one));
        test.done();
    },

    testStringFixCommandShouldNotDetectOverlapInDistinctReplacements: function(test) {
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

    testStringFixCommandShouldNotDetectOverlapInAdjacentReplacements: function(test) {
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

    testStringFixCommandShouldDetectOverlapInSamePositionInsertions: function(test) {
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

    testStringFixCommandShouldNotDetectOverlapInSamePositionInsertionAndDeletion: function(test) {
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

    testStringFixCommandShouldDetectOverlapInInsertionWithinReplacement: function(test) {
        test.expect(2);
        // insertion after 1st char overlaps a replacement (or deletion) of first 2 chars
        const one = StringFixCommand.insertAfter(1, "*");
        const other = StringFixCommand.replaceAfter(0, 2, "??");
        test.equals(true, one.overlaps(other));
        test.equals(true, other.overlaps(one));
        test.done();
    },

    testStringFixCommandShouldNotDetectOverlapInAdjacentDeletionThenInsertion: function(test) {
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

    testStringFixCommandShouldDetectOverlapInSamePlaceDeletions: function(test) {
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
    testStringFixCommandApplyShouldInsert: function(test) {
        test.expect(1);
        const input = "example";
        // insert "*" after 1st char
        const command = StringFixCommand.insertAfter(1, "*");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "e*xample");
        test.done();
    },

    testStringFixCommandApplyShouldDelete: function(test) {
        test.expect(1);
        const input = "example";
        // delete 2nd char
        const command = StringFixCommand.deleteAfter(1, 1);
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "eample");
        test.done();
    },

    testStringFixCommandApplyShouldReplace: function(test) {
        test.expect(1);
        const input = "example";
        // replace 2nd char to "X"
        const command = StringFixCommand.replaceAfter(1, 1, "X");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "eXample");
        test.done();
    },

    testStringFixCommandApplyShouldInsertLonger: function(test) {
        test.expect(1);
        const input = "example";
        // insert "**" after 1st char
        const command = StringFixCommand.insertAfter(1, "**");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "e**xample");
        test.done();
    },

    testStringFixCommandApplyShouldDeleteLonger: function(test) {
        test.expect(1);
        const input = "example";
        // delete 3rd and 4th char
        const command = StringFixCommand.deleteAfter(1, 2);
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "emple");
        test.done();
    },

    testStringFixCommandApplyShouldReplaceShorterToLonger: function(test) {
        test.expect(1);
        const input = "example";
        // replace 3rd and 4th char with a shorter sequence "*"
        const command = StringFixCommand.replaceAfter(1, 2, "*");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "e*mple");
        test.done();
    },

    testStringFixCommandApplyShouldReplaceLongerToShorter: function(test) {
        test.expect(1);
        const input = "example";
        // replace 2nd char with longer sequence "**"
        const command = StringFixCommand.replaceAfter(1, 1, "**");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "e**ample");
        test.done();
    },

    testStringFixCommandApplyShouldApplyMultiple: function(test) {
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

    testStringFixCommandApplyShouldApplyMultipleUnordered: function(test) {
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

    testStringFixCommandApplyShouldApplyMultipleWithInsertion: function(test) {
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

    testStringFixCommandApplyShouldApplyMultipleWithInsertionUnordered: function(test) {
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

    testStringFixCommandApplyShouldThrowOnOverlap: function(test) {
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

    testStringFixCommandApplyShouldThrowOnReplacementOutOfBounds: function(test) {
        test.expect(1);
        const input = "example";
        // out of bounds
        const commands = [
            StringFixCommand.replaceAfter(99, 1, "*"),
        ];
        test.throws(() => StringFixCommand.applyCommands(input, commands));
        test.done();
    },

    testStringFixCommandApplyShouldThrowOnInsertionOutOfBounds: function(test) {
        test.expect(1);
        const input = "example";
        // out of bounds
        const commands = [
            StringFixCommand.insertAfter(99, "*"),
        ];
        test.throws(() => StringFixCommand.applyCommands(input, commands));
        test.done();
    },

    testStringFixCommandApplyShouldThrowOnDeletionOutOfBounds: function(test) {
        test.expect(1);
        const input = "example";
        // out of bounds
        const commands = [
            StringFixCommand.deleteAfter(99, 1),
        ];
        test.throws(() => StringFixCommand.applyCommands(input, commands));
        test.done();
    },

    testStringFixCommandApplyShouldThrowOnReplacementOutOfBoundsByOne: function(test) {
        test.expect(1);
        const input = "example";
        // out of bounds by 1
        const commands = [
            StringFixCommand.replaceAfter(7, 1, "*"),
        ];
        test.throws(() => StringFixCommand.applyCommands(input, commands));
        test.done();
    },

    testStringFixCommandApplyShouldPrepend: function(test) {
        test.expect(1);
        const input = "example";
        // insert "***" before 1st char
        const command = StringFixCommand.insertAfter(0, "***");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "***example");
        test.done();
    },

    testStringFixCommandApplyShouldAppend: function(test) {
        test.expect(1);
        const input = "example";
        // insert "***" after last char
        const command = StringFixCommand.insertAfter(7, "***");
        const modified = StringFixCommand.applyCommands(input, [command]);
        test.equals(modified, "example***");
        test.done();
    },

    testStringFixCommandApplyShouldThrowOnDeletionOutOfBoundsByOne: function(test) {
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
