/*
 * index.js - main program of i18nlint
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

import fs from 'fs';
import path from 'path';

import OptionsParser from 'options-parser';
import Locale from 'ilib-locale';
import { JSUtils, Utils, Path } from 'ilib-common';
import json5 from 'json5';
import log4js from 'log4js';

import walk from './walk.js';

const __dirname = Path.dirname(Path.fileUriToPath(import.meta.url));
log4js.configure(path.join(__dirname, '..', 'log4js.json'));

var logger = log4js.getLogger("i18nlint.root");

const optionConfig = {
    help: {
        short: "h",
        help: "This help message",
        showHelp: {
            banner: 'Usage: i18nlint [-h] [options] path [path ...]',
            output: console.log
        }
    },
    config: {
        short: "c",
        "default": "./i18nlint-config.json",
        help: "Give an explicit path to a configuration file instead of trying to find it in the current directory."
    },
    locales: {
        short: "l",
        "default": "en-AU,en-CA,en-GB,en-IN,en-NG,en-PH,en-PK,en-US,en-ZA,de-DE,fr-CA,fr-FR,es-AR,es-ES,es-MX,id-ID,it-IT,ja-JP,ko-KR,pt-BR,ru-RU,tr-TR,vi-VN,zxx-XX,zh-Hans-CN,zh-Hant-HK,zh-Hant-TW,zh-Hans-SG",
        help: "Locales you want your app to support. Value is a comma-separated list of BCP-47 style locale tags. Default: the top 20 locales on the internet by traffic."
    },
    quiet: {
        short: "q",
        flag: true,
        help: "Produce no progress output during the run, except for error messages. Instead exit with a return value. Zero indicates no errors, and a positive exit value indicates errors."
    }
};

const options = OptionsParser.parse(optionConfig);

/*
if (options.args.length < 1) {
    console.log("Error: missing path parameter");
    OptionsParser.help(optionConfig, {
        banner: 'Usage: ii18nlint [-h] [options] path [path ...]',
        output: console.log
    });
    process.exit(1);
}
*/

if (!options.opt.quiet) console.log("i18nlint - Copyright (c) 2022 JEDLsoft, All rights reserved.");

let paths = options.args.slice(1);
if (paths.length === 0) {
    paths.push(".");
}

if (options.opt.locales) {
    options.opt.locales = options.opt.locales.split(/,/g);
}
// normalize the locale specs
options.opt.locales = options.opt.locales.map(spec => {
    let loc = new Locale(spec);
    if (!loc.getLanguage()) {
        loc = new Locale("und", loc.getRegion(), loc.getVariant(), loc.getScript());
    }
    return loc.getSpec();
});

let config = {};
if (options.opt.config) {
    if (!fs.existsSync(options.opt.config)) {
        console.log(`Config file ${options.opt.config} does not exist. Aborting...`);
        process.exit(2);
    }
    const data = fs.readFileSync(options.opt.config, "utf-8");
    config = json5.parse(data);
}

if (!options.opt.quiet) console.log(`\n\nScanning input paths: ${JSON.stringify(paths)}`);

let files = [];
paths.forEach(pathName => {
    files = files.concat(walk(pathName, options));
});
