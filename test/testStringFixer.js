/*
 * testStringFixer.js
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

import { IntermediateRepresentation } from "i18nlint-common";
import StringFixer from "../src/plugins/string/StringFixer.js";

export const testStringFixer = {
    stringFixerShouldInsert: function (test) {
        test.expect(2);

        const subject = new IntermediateRepresentation({
            type: "string",
            filePath: "test/file.txt",
            ir: "abcdef",
        });

        const fixer = new StringFixer();
        test.ok(fixer);

        const fix = fixer.createFix(fixer.commands.insertAfter(2, "!"));

        fixer.applyFixes(subject, [fix]);

        test.equal(subject.ir, "ab!cdef");

        test.done();
    },

    stringFixerShouldDelete: function (test) {
        test.expect(2);

        const subject = new IntermediateRepresentation({
            type: "string",
            filePath: "test/file.txt",
            ir: "abcdef",
        });

        const fixer = new StringFixer();
        test.ok(fixer);

        const fix = fixer.createFix(fixer.commands.deleteAfter(2, 1));

        fixer.applyFixes(subject, [fix]);

        test.equal(subject.ir, "abdef");

        test.done();
    },

    stringFixerShouldInsertMultiple: function (test) {
        test.expect(2);

        const subject = new IntermediateRepresentation({
            type: "string",
            filePath: "test/file.txt",
            ir: "abcdef",
        });

        const fixer = new StringFixer();
        test.ok(fixer);

        // product of mock rule "always quote"
        const fix = fixer.createFix(fixer.commands.insertAfter(0, "\""), fixer.commands.insertAfter(6, "\""));

        fixer.applyFixes(subject, [fix]);

        test.equal(subject.ir, "\"abcdef\"");

        test.done();
    },

    stringFixerShouldDeleteMultiple: function (test) {
        test.expect(2);

        const subject = new IntermediateRepresentation({
            type: "string",
            filePath: "test/file.txt",
            ir: "abcdef",
        });

        const fixer = new StringFixer();
        test.ok(fixer);

        // product of mock rule "disallow vowels"
        const fix = fixer.createFix(fixer.commands.deleteAfter(0, 1), fixer.commands.deleteAfter(4, 1));

        fixer.applyFixes(subject, [fix]);

        test.equal(subject.ir, "bcdf");

        test.done();
    },

    stringFixerShouldReplace: function (test) {
        test.expect(2);

        const subject = new IntermediateRepresentation({
            type: "string",
            filePath: "test/file.txt",
            ir: "abcdef",
        });

        const fixer = new StringFixer();
        test.ok(fixer);

        const fix = fixer.createFix(fixer.commands.replaceAfter(2, 1, "C"));

        fixer.applyFixes(subject, [fix]);

        test.equal(subject.ir, "abCdef");

        test.done();
    },

    stringFixerShouldFlagAppliedFix: function (test) {
        test.expect(2);

        const subject = new IntermediateRepresentation({
            type: "string",
            filePath: "test/file.txt",
            ir: "abcdef",
        });

        const fixer = new StringFixer();
        test.ok(fixer);

        const fix = fixer.createFix(fixer.commands.insertAfter(2, "!"));

        fixer.applyFixes(subject, [fix]);

        test.equal(fix.applied, true);

        test.done();
    },

    stringFixerShouldSkipOverlappingFix: function (test) {
        test.expect(3);

        const subject = new IntermediateRepresentation({
            type: "string",
            filePath: "test/file.txt",
            ir: "abcdef",
        });

        const fixer = new StringFixer();
        test.ok(fixer);

        // product of mock rule "always shout"
        const alwaysShoutFix = fixer.createFix(fixer.commands.insertAfter(6, "!"));
        // product of mock rule "always quote"
        const alwaysQuoteFix = fixer.createFix(fixer.commands.insertAfter(0, "\""), fixer.commands.insertAfter(6, "\""));

        fixer.applyFixes(subject, [alwaysShoutFix, alwaysQuoteFix]);

        // Fixer cannot apply both fixes, because it cannot tell which command should be executed first:
        // `"abcdef"!` or `"abcdef!"`
        test.equal(alwaysShoutFix.applied, true);
        test.equal(alwaysQuoteFix.applied, false);

        test.done();
    },
};
