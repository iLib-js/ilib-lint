/*
 * testProject.js - test the project object
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
import { ResourceString } from 'ilib-tools-common';

import Project from '../src/Project.js';
import PluginManager from '../src/PluginManager.js';

const pluginManager = new PluginManager();

export const testProject = {
    testProjectConstructorEmpty: function(test) {
        test.expect(1);

        const project = new Project("x", {pluginManager}, {});
        test.ok(project);

        test.done();
    },

    testProjectConstructorInsufficientParamsRoot: function(test) {
        test.expect(1);

        test.throws(() => {
            const project = new Project(undefined, {pluginManager}, {});
        });

        test.done();
    },

    testProjectConstructorInsufficientParamsOptions: function(test) {
        test.expect(1);

        test.throws(() => {
            const project = new Project("x", undefined, {});
        });

        test.done();
    },

    testProjectConstructorInsufficientParamsConfig: function(test) {
        test.expect(1);

        test.throws(() => {
            const project = new Project("x", {pluginManager});
        });

        test.done();
    },
};

