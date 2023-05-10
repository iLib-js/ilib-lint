/*
 * testLineRegexpChecker.js - test the regular-expression-based rule
 * for plain text files
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

import fs from 'node:fs';
import { IntermediateRepresentation } from 'i18nlint-common';

import LineRegexpChecker from '../src/rules/LineRegexpChecker.js';

const noNormalize = {
    name: "source-no-normalize",
    description: "Make sure we don't have any calls to the deprecated normalize function.",
    note: "Calls to the deprecated normalize function are not allowed.",
    regexps: [ /\.normalize\s*\(/g ]
};

import { Result } from 'i18nlint-common';

export const testLineRegexpChecker = {
    testLineRegexpChecker: function(test) {
        test.expect(1);

        const rule = new LineRegexpChecker({
            name: "z",
            description: "a",
            note: "b",
            regexps: [ "c" ]
        });
        test.ok(rule);

        test.done();
    },

    testLineRegexpCheckerMissingName: function(test) {
        test.expect(1);

        test.throws(() => {
            const rule = new LineRegexpChecker({
                description: "a",
                note: "b",
                regexps: [ "a" ]
            });
        });

        test.done();
    },

    testLineRegexpCheckerMissingDescription: function(test) {
        test.expect(1);

        test.throws(() => {
            const rule = new LineRegexpChecker({
                name: "a",
                note: "b",
                regexps: [ "a" ]
            });
        });

        test.done();
    },

    testLineRegexpCheckerMissingNote: function(test) {
        test.expect(1);

        test.throws(() => {
            const rule = new LineRegexpChecker({
                name: "a",
                description: "a",
                regexps: [ "a" ]
            });
        });

        test.done();
    },

    testLineRegexpCheckerMissingRegexps: function(test) {
        test.expect(1);

        test.throws(() => {
            const rule = new LineRegexpChecker({
                name: "a",
                description: "a",
                note: "b"
            });
        });

        test.done();
    },

    testLineRegexpCheckerSimpleRegexp: function(test) {
        test.expect(8);

        const rule = new LineRegexpChecker(noNormalize);
        test.ok(rule);

        const lines = `
            Path.join = function(var_args) {
                var arr = [];
                for (var i = 0; i < arguments.length; i++) {
                    arr.push(arguments[i] && arguments[i].length > 0 ? arguments[i] : ".");
                }
                return Path.normalize(arr.join("/"));
            };`.split(/\n/g);

        const ir = new IntermediateRepresentation({
            type: "line",
            ir: lines,
            filePath: "x/y"
        });
        const actual = rule.match({
            ir,
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].description, "Calls to the deprecated normalize function are not allowed.");
        test.equal(actual[0].highlight, '                return Path<e0>.normalize(</e0>arr.join("/"));');
        test.equal(actual[0].pathName, "x/y");
        test.equal(actual[0].lineNumber, 6);

        test.done();
    },

    testLineRegexpCheckerSimpleRegexpNoMatch: function(test) {
        test.expect(2);

        const rule = new LineRegexpChecker(noNormalize);
        test.ok(rule);

        const lines = `
            Path.join = function(var_args) {
                var arr = [];
                for (var i = 0; i < arguments.length; i++) {
                    arr.push(arguments[i] && arguments[i].length > 0 ? arguments[i] : ".");
                }
                return arr.join("/");
            };`.split(/\n/g);

        const ir = new IntermediateRepresentation({
            type: "line",
            ir: lines,
            filePath: "x/y"
        });
        const actual = rule.match({
            ir,
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testLineRegexpCheckerSimpleRegexpReallyLongLine: function(test) {
        test.expect(8);

        const rule = new LineRegexpChecker(noNormalize);
        test.ok(rule);

        const lines = [`Path.join = function(var_args) { var arr = []; for (var i = 0; i < arguments.length; i++) { arr.push(arguments[i] && arguments[i].length > 0 ? arguments[i] : "."); } return Path.normalize(arr.join("/")); };                                                                                                                                                                                                           `];

        const ir = new IntermediateRepresentation({
            type: "line",
            ir: lines,
            filePath: "x/y"
        });
        const actual = rule.match({
            ir,
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        // should truncate the highlight to 100 chars before and after the match and put an ellipsis
        test.equal(actual[0].severity, "error");
        test.equal(actual[0].description, "Calls to the deprecated normalize function are not allowed.");
        test.equal(actual[0].highlight, '...ength; i++) { arr.push(arguments[i] && arguments[i].length > 0 ? arguments[i] : "."); } return Path<e0>.normalize(</e0>arr.join("/")); };                                                                                  ...');
        test.equal(actual[0].pathName, "x/y");
        test.equal(actual[0].lineNumber, 0);

        test.done();
    },

    testLineRegexpCheckerRegexpMultipleMatches: function(test) {
        test.expect(18);

        const rule = new LineRegexpChecker(noNormalize);
        test.ok(rule);

        const source = fs.readFileSync("./test/testfiles/js/Path.js", "utf-8");

        const ir = new IntermediateRepresentation({
            type: "line",
            ir: source.split(/\n/g),
            filePath: "x/y"
        });
        const actual = rule.match({
            ir,
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 3);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].description, "Calls to the deprecated normalize function are not allowed.");
        test.equal(actual[0].highlight, '    pathname = Path<e0>.normalize(</e0>pathname);');
        test.equal(actual[0].pathName, "x/y");
        test.equal(actual[0].lineNumber, 50);

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].description, "Calls to the deprecated normalize function are not allowed.");
        test.equal(actual[1].highlight, '    return (pathname === ".") ? ".." : Path<e0>.normalize(</e0>pathname + "/..");');
        test.equal(actual[1].pathName, "x/y");
        test.equal(actual[1].lineNumber, 51);

        test.equal(actual[2].severity, "error");
        test.equal(actual[2].description, "Calls to the deprecated normalize function are not allowed.");
        test.equal(actual[2].highlight, '    return Path<e0>.normalize(</e0>arr.join("/"));');
        test.equal(actual[2].pathName, "x/y");
        test.equal(actual[2].lineNumber, 91);

        test.done();
    },

    testLineRegexpCheckerTestSeverity: function(test) {
        test.expect(8);

        const rule = new LineRegexpChecker({
            ...noNormalize,
            severity: "warning"
        });
        test.ok(rule);

        const lines = `
            Path.join = function(var_args) {
                var arr = [];
                for (var i = 0; i < arguments.length; i++) {
                    arr.push(arguments[i] && arguments[i].length > 0 ? arguments[i] : ".");
                }
                return Path.normalize(arr.join("/"));
            };`.split(/\n/g);

        const ir = new IntermediateRepresentation({
            type: "line",
            ir: lines,
            filePath: "x/y"
        });
        const actual = rule.match({
            ir,
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].description, "Calls to the deprecated normalize function are not allowed.");
        test.equal(actual[0].highlight, '                return Path<e0>.normalize(</e0>arr.join("/"));');
        test.equal(actual[0].pathName, "x/y");
        test.equal(actual[0].lineNumber, 6);
        test.equal(actual[0].severity, "warning");

        test.done();
    },

    testLineRegexpCheckerTestSeverityDefault: function(test) {
        test.expect(9);

        const rule = new LineRegexpChecker(noNormalize);
        test.ok(rule);

        const lines = `
            Path.join = function(var_args) {
                var arr = [];
                for (var i = 0; i < arguments.length; i++) {
                    arr.push(arguments[i] && arguments[i].length > 0 ? arguments[i] : ".");
                }
                return Path.normalize(arr.join("/"));
            };`.split(/\n/g);

        const ir = new IntermediateRepresentation({
            type: "line",
            ir: lines,
            filePath: "x/y"
        });
        const actual = rule.match({
            ir,
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].description, "Calls to the deprecated normalize function are not allowed.");
        test.equal(actual[0].highlight, '                return Path<e0>.normalize(</e0>arr.join("/"));');
        test.equal(actual[0].pathName, "x/y");
        test.equal(actual[0].lineNumber, 6);
        test.equal(actual[0].severity, "error"); // default severity

        test.done();
    }
};
