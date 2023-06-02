/*
 * testStringFix.js
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
import StringFix from "../src/plugins/string/StringFix.js";

export const testStringFix = {
    stringFixCtorShouldThrowOverlappingCommands: function (test) {
        test.expect(1);
        // overlapping commands in a single fix
        test.throws(
            () =>
                new StringFix(
                    // replace 1st and 2nd char with "**"
                    StringFixCommand.replaceAfter(0, 2, "**"),
                    // replace 1st char with "?"
                    StringFixCommand.replaceAfter(1, 1, "?")
                )
        );
        test.done();
    },

    stringFixShouldDetectOverlap: function (test) {
        test.expect(2);
        // fixes overlap because some commands between them overlap
        const one = new StringFix(
            // replace 1st and 2nd char with "**"
            StringFixCommand.replaceAfter(0, 2, "**")
        );
        const other = new StringFix(
            // replace 1st char with "?"
            StringFixCommand.replaceAfter(1, 1, "?")
        );
        test.equals(true, one.overlaps(other));
        test.equals(true, other.overlaps(one));
        test.done();
    },

    stringFixShouldDetectOverlapOfAnyCommands: function (test) {
        test.expect(2);
        // fixes overlap because some commands between them overlap
        // even if not all commands do
        const one = new StringFix(
            StringFixCommand.replaceAfter(0, 2, "**"),
            StringFixCommand.replaceAfter(4, 2, "**")
        );
        const other = new StringFix(
            // no overlap
            StringFixCommand.replaceAfter(2, 1, "?"),
            // overlap with [4,6]
            StringFixCommand.replaceAfter(5, 1, "?")
        );
        test.equals(true, one.overlaps(other));
        test.equals(true, other.overlaps(one));
        test.done();
    },
};
