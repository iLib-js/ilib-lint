import { IntermediateRepresentation } from "i18nlint-common";
import StringFixer, { StringFix } from "../src/plugins/StringFixer.js";

let processed = StringFixer.applyCommands("12345678", [
    StringFix.commands.insertAfter(0, "0"), // add 0 before 1
    StringFix.commands.deleteAfter(1, 1), // delete "2",
    StringFix.commands.insertAfter(8, "9"), // add 9 after 8
    StringFix.commands.deleteAfter(5, 2), // delete "67"
]);

console.log(processed);
console.log(processed === "0134589");

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

        // product of mock rule "ensure string wrapped in quotes"
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
        // @TODO fix

        test.done();
    },
};
