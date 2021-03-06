"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var OpenApiConverter = require("../OpenApiConverter");
var asr = chai.assert;
suite("OpenApiConverter", function OpenApiConverterTest() {
    test("isOpenApiType()", function () {
        asr.isFalse(OpenApiConverter.isOpenApiType(null));
        asr.isFalse(OpenApiConverter.isOpenApiType({}));
        asr.isTrue(OpenApiConverter.isOpenApiType(openApiType({ type: "number", format: "int32" })));
        asr.isTrue(OpenApiConverter.isOpenApiType(openApiType({ type: "array", items: { type: "boolean" } })));
        asr.isTrue(OpenApiConverter.isOpenApiType(openApiType({ type: "object", properties: { key: { $ref: "#/definitions/Key" } } })));
    });
    test("isOpenApiReference()", function () {
        asr.isFalse(OpenApiConverter.isOpenApiReference(null));
        asr.isFalse(OpenApiConverter.isOpenApiReference({}));
        asr.isTrue(OpenApiConverter.isOpenApiReference({ $ref: "" }));
        asr.isTrue(OpenApiConverter.isOpenApiReference({ $ref: "#/definitions/Key" }));
    });
    test("extractOpenApiModels() #1", function () {
        var models = OpenApiConverter.extractOpenApiModels({
            SimpleType: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    value: { type: "integer", format: "int64" },
                }
            },
            ReferenceType: {
                $ref: "#/definitions/SimpleType"
            }
        }, defaultTypeConverter);
        var definitions = {
            "SimpleType": {
                using: [],
                blockType: "CLASS",
                classSignature: { name: "SimpleType", declarationType: "class", access: "public", annotations: [{ name: "OpenApiModel", arguments: { type: "SimpleType" } }] },
                fields: [{
                        name: "name",
                        type: { typeName: "string" },
                        required: false,
                        annotations: [],
                        accessModifiers: ["public"],
                        comments: undefined,
                    }, {
                        name: "value",
                        type: { typeName: "int64", primitive: true },
                        required: false,
                        annotations: [],
                        accessModifiers: ["public"],
                        comments: undefined,
                    }],
                methods: [],
            },
            "ReferenceType_SimpleType": {
                using: [],
                blockType: "CLASS",
                classSignature: { name: "ReferenceType_SimpleType", declarationType: "class", access: "public", annotations: [{ name: "OpenApiModel", arguments: { type: "ReferenceType.SimpleType" } }] },
                fields: [],
                methods: [],
            }
        };
        definitions.ReferenceType_SimpleType.fields = definitions.SimpleType.fields.slice();
        asr.deepEqual(models, definitions);
    });
    test("extractOpenApiModels() #2", function () {
        var models = OpenApiConverter.extractOpenApiModels({
            Category: {
                type: "object",
                required: ["name"],
                properties: {
                    id: { type: "integer", format: "int64" },
                    name: { type: "string", minLength: 2, maxLength: 20 }
                }
            },
            Tag: {
                type: "object",
                properties: {
                    tagId: { type: "integer", format: "int64" },
                    description: { type: "string" }
                }
            }
        }, defaultTypeConverter);
        var definitions = {
            Category: {
                using: [],
                blockType: "CLASS",
                classSignature: { name: "Category", declarationType: "class", access: "public", annotations: [{ name: "OpenApiModel", arguments: { type: "Category" } }] },
                fields: [{
                        name: "id",
                        type: { typeName: "int64", primitive: true },
                        required: false,
                        annotations: [],
                        accessModifiers: ["public"],
                        comments: undefined,
                    }, {
                        name: "name",
                        type: { typeName: "string" },
                        required: true,
                        annotations: [{ name: "StringLength", arguments: { min: "2", max: "20" } }],
                        accessModifiers: ["public"],
                        comments: undefined,
                    }],
                methods: [],
            },
            Tag: {
                using: [],
                blockType: "CLASS",
                classSignature: { name: "Tag", declarationType: "class", access: "public", annotations: [{ name: "OpenApiModel", arguments: { type: "Tag" } }] },
                fields: [{
                        name: "tagId",
                        type: { typeName: "int64", primitive: true },
                        required: false,
                        annotations: [],
                        accessModifiers: ["public"],
                        comments: undefined,
                    }, {
                        name: "description",
                        type: { typeName: "string" },
                        required: false,
                        annotations: [],
                        accessModifiers: ["public"],
                        comments: undefined,
                    }],
                methods: [],
            }
        };
        asr.deepEqual(models, definitions);
    });
    test("createModelParameterFromType()", function () {
        var _a = OpenApiConverter.createModelParameterFromType("firstParam", {
            type: "object",
            properties: {
                sid: { type: "string", format: "uniqueidentifier" }
            },
            additionalProperties: true,
        }, null, defaultTypeConverter), parameter = _a.parameter, classes = _a.classes;
        asr.deepEqual(classes, {
            firstParam: {
                blockType: "CLASS",
                classSignature: {
                    name: "firstParam",
                    access: "public",
                    annotations: [
                        { name: "OpenApiModel", arguments: { type: "firstParam" } },
                        { name: "AdditionalProperties", arguments: { value: "true" } }
                    ],
                    declarationType: "class"
                },
                fields: [{
                        name: "sid",
                        type: { typeName: "uniqueidentifier" },
                        accessModifiers: ["public"],
                        annotations: [],
                        comments: undefined,
                        required: false
                    }],
                methods: [],
                using: [],
            }
        });
        asr.deepEqual(parameter, {
            name: "firstParam",
            parameterModifiers: ["public"],
            type: { typeName: "firstParam" },
            annotations: undefined
        });
    });
    function openApiType(obj) {
        return obj;
    }
    /** Converter for types in model fields
     * @param typeName the Open API type name, e.g. 'number' or 'integer'
     * @param [format] optional, format of the type, e.g. 'int64' or 'float'
     */
    function defaultTypeConverter(typeName, format) {
        if (isPrimitive(typeName)) {
            return {
                typeName: format || typeName,
                primitive: true,
            };
        }
        else {
            return {
                typeName: format || typeName,
            };
        }
    }
    /** Check if a type is a primitive C#, Java, or TypeScript data type.
     * (i.e. TypeScript's primitives are boolean and number).
     * @param typeName the simple data type name (i.e. 'number' or 'byte')
     */
    function isPrimitive(typeName) {
        typeName = typeName.toLowerCase();
        switch (typeName) {
            case "bool":
            case "boolean":
            case "byte":
            case "sbyte":
            case "char":
            case "short":
            case "ushort":
            case "int":
            case "uint":
            case "long":
            case "ulong":
            case "float":
            case "double":
            case "decimal":
            case "real":
            case "number":
            case "integer":
                return true;
            default:
                return false;
        }
    }
});
