/*
 * testFormatterFactory.js - test the formatter factory
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

import FormatterFactory from '../src/FormatterFactory.js';
import Formatter from '../src/Formatter.js';

export const testFormatterFactory = {
    testFormatterFactoryNormal: function(test) {
        test.expect(2);

        const formatter = FormatterFactory();

        test.ok(formatter);
        test.ok(formatter instanceof Formatter);

        test.done();
    },

    testFormatterFactoryNotFound: function(test) {
        test.expect(2);

        const formatter = FormatterFactory({
            formatter: "non-existent"
        });

        test.ok(formatter);
        test.ok(formatter instanceof Formatter);

        test.done();
    }

};

