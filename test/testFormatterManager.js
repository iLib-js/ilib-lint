/*
 * testFormatterManager.js - test the formatter manager
 *
 * Copyright © 2022 JEDLSoft
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
import { Formatter } from 'i18nlint-common';

import FormatterManager from '../src/FormatterManager.js';

export const testFormatterManager = {
    testFormatterManagerNormal: function(test) {
        test.expect(3);

        const mgr = new FormatterManager();
        test.ok(mgr);

        const formatter = mgr.get("ansi-console-formatter");

        test.ok(formatter);
        test.ok(formatter instanceof Formatter);

        test.done();
    },

    testFormatterManagerNotFound: function(test) {
        test.expect(2);

        const mgr = new FormatterManager();
        test.ok(mgr);
        const formatter = mgr.get("non-existent");

        test.ok(!formatter);

        test.done();
    }
};

