import {ResourceString} from 'ilib-tools-common';
import { Result } from 'ilib-lint-common';

import ResourceSnakeCase from '../src/rules/ResourceSnakeCase.js';



describe("ResourceSnakeCase", () => {
    test("creates ResourceSnakeCase rule instance", () => {
        const rule = new ResourceSnakeCase();

        expect(rule).toBeInstanceOf(ResourceSnakeCase);
        expect(rule.getName()).toEqual("resource-snake-case");
    });

    test.each([
        {name: "empty", source: ""},
        {name: "undefined", source: undefined},
        {name: "null", source: null},
    ])("does not apply rule if source string is $name", ({source}) => {
        const rule = new ResourceSnakeCase();
        const resource = createTestResourceString({source, target: "snake_case_target"});

        const result = rule.matchString({source: resource.source});

        expect(result).toBeUndefined();

    });

    test.each([
        {name: "empty", target: ""},
        {name: "undefined", target: undefined},
        {name: "null", target: null},
    ])("does not apply rule if target string is $name", ({target}) => {
        const rule = new ResourceSnakeCase();
        const resource = createTestResourceString({source: "snake_case_source", target});

        const result = rule.matchString({target: resource.target});

        expect(result).toBeUndefined();
    });

    test.each(
        [
            {name: "whitespace (solely)", source: " "},
            {name: "text and whitespace", source: "snake case"},
            {name: "snake case and text", source: "snake_case and text"},
            {name: "screaming snake case and text", source: "SCREAMING_SNAKE_CASE and text"},
            {name: "mixed case", source: "mixed_CASE"},
        ]
    )("does not apply rule if source string is $name", ({name, source}) => {
        const rule = new ResourceSnakeCase();
        const resource = createTestResourceString({source, target: "does not matter"});

        const result = rule.matchString({source: resource.source});

        expect(result).toBeUndefined();
    });

    test.each(
        [
            {name: "snake case", source: "snake_case"},
            {name: "snake case with leading and trailing whitespace", source: " snake_case "},
            {name: "snake case with numbers (123)", source: " snake_case123 "},
            {name: "snake case with underscored numbers (_123)", source: " snake_case_123 "},

            {name: "screaming snake case", source: "SOME_SCREAMING_SNAKE_CASE"},
            {name: "screaming snake case with leading and trailing whitespace", source: " SOME_SCREAMING_SNAKE_CASE "},
            {name: "screaming snake case with numbers", source: "SOME_SCREAMING_SNAKE_CASE123 "},
            {name: "screaming snake case with underscored numbers", source: "SOME_SCREAMING_SNAKE_CASE_123 "},

            {name: "camel snake case", source: "camel_Snake_Case"},
            {name: "came snake case with leading and trailing whitespace", source: " camel_Snake_Case "},
            {name: "camel snake case with numbers", source: "camel_Snake_Case123 "},
            {name: "camel snake case with underscored numbers", source: "camel_Snake_Case_123 "},
        ]
    )("applies rule if source string is $name", ({name, source}) => {
        const rule = new ResourceSnakeCase();
        const resource = createTestResourceString({source, target: source});

        const result = rule.matchString({
            source: resource.source,
            target: resource.target,
            file: resource.pathName,
            resource
        });

        expect(result).toBeUndefined();
    });

    test("returns `undefined` if source and target strings are the same", () => {
        const rule = new ResourceSnakeCase();
        const resource = createTestResourceString({source: "do_not_translate_me", target: "do_not_translate_me"});

        const result = rule.matchString({
            source: resource.source,
            target: resource.target,
            file: resource.pathName,
            resource
        });

        expect(result).toBeUndefined();
    });

    test("returns error if source and target strings are different", () => {
        const rule = new ResourceSnakeCase();
        const resource = createTestResourceString({source: "two_words_in_english", target: "dos_palabras_en_español"});

        const result = rule.matchString({
            source: resource.source,
            target: resource.target,
            file: resource.pathName,
            resource
        });

        console.log({result})

        expect(result).toBeInstanceOf(Result);
        expect(result.rule).toBeInstanceOf(ResourceSnakeCase)
        expect(result.severity).toEqual("error");
    });


});

function createTestResourceString({source, target}) {
    return new ResourceString({
        source,
        target,
        key: "snake.case.test.string.id",
        targetLocale: "xd-XD",
        pathName: "tests/for/snake_case.xliff"
    });
}

