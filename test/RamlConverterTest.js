"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var RamlConverter = require("../RamlConverter");
var asr = chai.assert;
suite("RamlConverter", function RamlConverterTest() {
    test("isRamlType()", function () {
        asr.isFalse(RamlConverter.isRamlType(null));
        asr.isFalse(RamlConverter.isRamlType({}));
        asr.isTrue(RamlConverter.isRamlType(ramlType({ type: "number", format: "int32" })));
        asr.isTrue(RamlConverter.isRamlType(ramlType({ type: "array", items: { type: "boolean" } })));
        asr.isTrue(RamlConverter.isRamlType(ramlType({ type: "object", properties: { key: { type: "library.typeRef" } } })));
    });
    test("isOpenApiReference()", function () {
        asr.isFalse(RamlConverter.isRamlTypeReference(null));
        asr.isFalse(RamlConverter.isRamlTypeReference({}));
        asr.isFalse(RamlConverter.isRamlTypeReference("file.raml"));
        asr.isTrue(RamlConverter.isRamlTypeReference("!include path/library.raml"));
    });
    test(".", function () {
        var models = RamlConverter.extractRamlModels({
            "main.raml": {
                title: "Test RAML Definition",
                types: {
                    "Mammal": {
                        type: "object",
                        properties: {
                            "speciesName": "string",
                            "nativeEnvironment?": "string | nil",
                        }
                    }
                },
                uses: {
                    "Operations": "/operations-library.raml",
                },
                "/mammal": {
                    "/{species}": {
                        get: {
                            description: "Search for a species by name",
                            is: [
                                {
                                    "Operations.read": {
                                        "media-type": "application/json",
                                        "response-200-type": "Mammal",
                                        "object-name": "Mammal"
                                    }
                                },
                                "Errors.default",
                                "Errors.experience"
                            ]
                        }
                    }
                }
            },
            "/operations-library.raml": {
                "traits": {
                    "create": {
                        "displayName": "Create <<object-name>> Object",
                        "description": "Creating new <<object-name>> object",
                        "body": {
                            "<<media-type>>": {
                                "type": "<<data-add-type>>"
                            }
                        },
                        "responses": {
                            "201": {
                                "headers": {
                                    "x-correlation-id": {
                                        "type": "string"
                                    },
                                    "Content-Type": {
                                        "type": "string",
                                        "default": "<<media-type>>"
                                    }
                                },
                                "body": {
                                    "<<media-type>>": {
                                        "type": "<<response-201-type>>"
                                    }
                                }
                            }
                        }
                    },
                    "read": {
                        "displayName": "Read <<object-name>> Object",
                        "description": "Retrieving <<object-name>> object",
                        "responses": {
                            "200": {
                                "headers": {
                                    "x-correlation-id": {
                                        "type": "string"
                                    },
                                    "Content-Type": {
                                        "type": "string",
                                        "default": "<<media-type>>"
                                    }
                                },
                                "body": {
                                    "<<media-type>>": {
                                        "type": "<<response-200-type>>"
                                    }
                                }
                            }
                        }
                    }
                },
                "resourceTypes": {
                    "create": {
                        "post": {
                            "is": [
                                "create"
                            ]
                        }
                    },
                    "read": {
                        "post": {
                            "is": [
                                "read"
                            ]
                        }
                    }
                }
            }
        }, "main.raml", RamlConverter.defaultModelNamer, defaultTypeConverter);
        var definitions = {
            "Mammal": {
                blockType: "CLASS",
                classSignature: { access: "public", declarationType: "class", name: "Mammal", annotations: [{ name: "RamlModel", arguments: { type: "Mammal" } }, { name: "RamlFileName", arguments: { fileName: "Mammal" } }] },
                fields: [{
                        name: "speciesName",
                        type: { typeName: "string", primitive: true, nullable: false, arrayDimensions: 0 },
                        required: true,
                        accessModifiers: ["public"],
                        annotations: [],
                        comments: undefined,
                    }, {
                        name: "nativeEnvironment",
                        type: { typeName: "string", primitive: true, nullable: true, arrayDimensions: 0 },
                        required: false,
                        accessModifiers: ["public"],
                        annotations: [],
                        comments: undefined,
                    }],
                methods: [],
                using: [],
            }
        };
        asr.deepEqual(models, definitions);
    });
    function ramlType(obj) {
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
