/*
 * walk.js - walk a directory tree
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

import fs from 'node:fs';
import path from 'node:path';
import log4js from 'log4js';
import mm from 'micromatch';

import SourceFile from './SourceFile.js';
import Project from './Project.js';

const logger = log4js.getLogger("ilib-lint.walk");

/**
 * Recursively walk a directory and return a list of files and directories
 * within that directory. The walk is controlled via a list of exclude and
 * include patterns. Each pattern should be a micromatch pattern like this:
 *
 * <code>
 * "*.json"
 * </code>
 *
 * The full path to every file and directory in the top-level directory will
 * be included, unless it matches an exclude pattern, it which case, it will be
 * excluded from the output. However, if the path
 * also matches an include pattern, it will still be included nonetheless. The
 * idea is that you can exclude a whole category of files (like all json files),
 * but include specific ones. For example, you may exclude all json files, but
 * still want to include the "config.json" file.<p>

 * The options parameter may include any of the following optional properties:
 *
 * <ul>
 * <li><i>excludes</i> (Array of strings) - A list of micromatch patterns to
 * exclude from the output. If a pattern matches a directory, that directory
 * will not be recursively searched.
 * <li><i>includes</i> (Array of strings) - A list of micromatch patterns to
 * include in the walk. If a pattern matches both an exclude and an include, the
 * include will override the exclude.
 * </ul>
 *
 * @param {String} root Directory to walk
 * @param {Project} project Project
 * @returns {Array.<DirItem>} an array of file names in the directory, filtered
 * by the the excludes and includes list
 */
function walk(root, project) {
    let list;

    if (typeof(root) !== "string") {
        return [];
    }

    let includes = project.getIncludes();
    let excludes = project.getExcludes();
    let pathName, included, stat, glob;

    try {
        if (fs.existsSync(root)) {
            stat = fs.statSync(root);
            if (stat && stat.isDirectory()) {
                const configFileName = path.join(root, "ilib-lint-config.json");
                if (fs.existsSync(configFileName)) {
                    const data = fs.readFileSync(configFileName, "utf-8");
                    const config = JSON5.parse(data);
                    project = new Project(root, project.getOptions(), config);
                    includes = project.getIncludes();
                    excludes = project.getExcludes();
                    logger.trace(`New project ${project.getName()}`);
                }

                list = fs.readdirSync(root);
                logger.trace(`Searching dir ${root}`);

                if (list && list.length !== 0) {
                    list.sort().forEach((file) => {
                        if (file === "." || file === "..") {
                            return;
                        }

                        pathName = path.join(root, file);
                        included = true;

                        if (excludes) {
                            logger.trace(`There are excludes. Relpath is ${pathName}`);
                            included = !mm.isMatch(pathName, excludes);
                        }

                        if (included) {
                            walk(pathName, project);
                        }
                    });
                }
            } else {
                // file
                included = false;

                if (includes) {
                    logger.trace(`There are includes.`);
                    mm.match(root, includes, {
                        onMatch: (params) => {
                            if (!glob && params.isMatch) {
                                glob = params.glob;
                                const settings = project.getSettings(glob);
                                excludes = settings.excludes || excludes;
                                included = excludes ? !mm.isMatch(root, excludes) : true;
                            }
                        }
                    });
                }

                if (included) {
                    logger.trace(`${pathName} ... included`);
                    glob = glob || "**";
                    project.add(new SourceFile(root, {
                        settings: project.getSettings(glob)
                    }, project));
                } else {
                    logger.trace(`${pathName} ... excluded`);
                }
            }
        } else {
            logger.warn(`File ${pathName} does not exist.`);
        }
    } catch (e) {
        // if the readdirSync did not work, it's maybe a file?
        if (fs.existsSync(root)) {
            project.add(new SourceFile(root, {}, project));
        }
    }

    return project.get();
}

export default walk;