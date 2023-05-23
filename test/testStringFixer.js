import StringFixer, { StringFix } from "../src/plugins/StringFixer.js";


let processed = StringFixer.applyCommands("12345678", [
    StringFix.commands.insertAfter(0, "0"), // add 0 before 1
    StringFix.commands.deleteAfter(1, 1), // delete "2",
    StringFix.commands.insertAfter(8, "9"), // add 9 after 8
    StringFix.commands.deleteAfter(5, 2) // delete "67"
]);

console.log(processed);
console.log(processed === "0134589");