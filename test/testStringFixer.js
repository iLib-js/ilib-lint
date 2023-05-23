import { IntermediateRepresentation } from "i18nlint-common";
import StringFixer, { StringFix } from "../src/plugins/StringFixer.js";

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

        const fix = new StringFix(StringFix.commands.insertAfter(2, "!"));

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

        const fix = new StringFix(StringFix.commands.deleteAfter(2, 1));

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
        const fix = new StringFix(StringFix.commands.insertAfter(0, "\""), StringFix.commands.insertAfter(6, "\""));

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
        const fix = new StringFix(StringFix.commands.deleteAfter(0, 1), StringFix.commands.deleteAfter(4, 1));

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

        const fix = new StringFix(StringFix.commands.deleteAfter(2, 1), StringFix.commands.insertAfter(2, "C"));

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

        const fix = new StringFix(StringFix.commands.insertAfter(2, "!"));

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
        const alwaysShoutFix = new StringFix(StringFix.commands.insertAfter(6, "!"));
        // product of mock rule "always quote"
        const alwaysQuoteFix = new StringFix(StringFix.commands.insertAfter(0, "\""), StringFix.commands.insertAfter(6, "\""));

        fixer.applyFixes(subject, [alwaysShoutFix, alwaysQuoteFix]);

        // Fixer cannot apply both fixes, because it cannot tell which command should be executed first:
        // `"abcdef"!` or `"abcdef!"`
        test.equal(alwaysShoutFix.applied, true);
        test.equal(alwaysQuoteFix.applied, false);

        test.done();
    },
};
