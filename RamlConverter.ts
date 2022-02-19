/** Converter for transforming RAML specification JSON into 'CodeAst' structures
 * @author TeamworkGuy2
 */
module RamlConverter {

    /** A frame in the 'typeStack' used by readType() */
    export interface TypeFrame {
        name: string;
        type: string | RamlV1.TypeAny;
        /** the name of a 'properties' if the current type being read is the type of a property */
        propName?: string;
    }


    /** Function to convert a CodeAst.Type to a string in the format 'TypeName<GenericParams, ...>[]'
     * @param type the type to stringify
     * @param [typeConverter] an optional converter for the type names in the type
     * @param [includeNullability=true] whether to include type nullability (i.e. the '?' part of 'int?[]')
     * @param [nullableSymbol="?"] the symbol for nullability (i.e. '?' for C# or ' | null' for TypeScript)
     */
    export var typeToString: (type: CodeAst.Type, typeConverter?: (typeName: string) => string, includeNullability?: boolean, nullableSymbol?: string) => string;

    /** Default converter for naming models - nested model names are generated
     * based on their parent model and prop name, e.g. 'Root_propName_subPropName...'
     * @param nameStack the stack of model names forming a path through the OpenAPI models that lead up to this model being named
     */
    export var defaultModelNamer: (nameStack: string[]) => string = function (nameStack) {
        return nameStack.join("_");
    };


    export function extractRamlModels(ramlDefinitions: RamlV1.Documents, mainRamlFile: string, modelNamer = defaultModelNamer, typeConverter: (typeName: string, format?: string | null) => CodeAst.Type): { [name: string]: CodeAst.Class } {
        var models = <{ [name: string]: CodeAst.Class }>{};
        var ramlMain = <RamlV1.Document>ramlDefinitions[mainRamlFile];

        for (var defName in ramlMain.types) {
            var def = ramlMain.types[defName];

            readType([{ name: defName, type: def }], defName, (clazz) => {
                var clsName = clazz.classSignature.name;
                //console.log("read RAML type:", clsName, clazz.fields.map((f) => TypeConverter.typeToString(f.type) + " " + f.name));
                if (models[clsName] != null) throw new Error("duplicate model name '" + clsName + "'");
                models[clsName] = clazz;
            }, ramlDefinitions, mainRamlFile, modelNamer, typeConverter);
        }

        return models;
    }


    export function createModelParameterFromType(paramName: string, paramType: RamlV1.TypeAny, ramlSpec: RamlV1.Documents | null, mainRamlFile: string | undefined | null,
        typeConverter: (typeName: string, format?: string | null) => CodeAst.Type,
        modelNamer = defaultModelNamer
    ): { parameter: CodeAst.MethodParameter; classes: { [name: string]: CodeAst.Class } } {
        var models = <{ [name: string]: CodeAst.Class }>{};

        var field = readType([{ name: paramName, type: paramType }], paramName, (clazz) => {
            var clsName = clazz.classSignature.name;
            if (models[clsName] != null) throw new Error("duplicate model name '" + clsName + "'");
            models[clsName] = clazz;
        }, ramlSpec || null, <string>mainRamlFile, modelNamer, typeConverter);

        return {
            parameter: {
                name: paramName,
                type: field.type,
                parameterModifiers: ["public"],
                annotations: field.annotations,
            },
            classes: models,
        };
    }


    /** Extract CodeAst.Class and CodeAst.Field models from an Open API JSON type definition
     * @param typeStack the names and types of models that lead to this point, used recursively to track nested type names, the last element is the array is the type to read
     * @param rootTypePath the name of the RAML file that contains the current type (the last type in the 'typeStack')
     * @param objectVisitor called for each complete object model read
     * @param ramlDefinitions can be null, the OpenAPI document root 'definitions' for looking up '$ref' types
     * @param mainRamlFile a key into the 'ramlDefinitions' of the main 'Document' RAML definition
     * @param modelNamer (default: 'defaultModelNamer') a function which converts model name stack to a model name
     * @param typeConverter (default: 'defaultTypeConverter') a function which converts type names and format hints to 'CodeAst.Type' types
     */
    export function readType(typeStack: TypeFrame[], rootTypePath: string, objectVisitor: (clazz: CodeAst.Class) => void,
        ramlDefinitions: RamlV1.Documents | null, mainRamlFile: string,
        modelNamer: (nameStack: string[]) => string,
        typeConverter: (typeName: string, format?: string | null) => CodeAst.Type,
    ): CodeAst.Field {
        var typeFrame = last(typeStack);
        var ramlType = typeFrame.type;

        // type reference '!include'
        if (isRamlTypeReference(ramlType) || isRamlTypeReference((<any>ramlType).type)) {
            var refTypeStr = <string>(<any>ramlType).type || <string>ramlType;
            if (ramlDefinitions != null) {
                var refType = queryJsonPath(refTypeStr, ramlDefinitions, rootTypePath);
                if (refType.type == null) {
                    throw new Error("reference type not found " + JSON.stringify(ramlType) + " at " + rootTypePath);
                }
                typeStack.push({ name: fileName(refType.path), type: refType.type });
                var resType = readType(typeStack, refType.path, objectVisitor, ramlDefinitions, mainRamlFile, modelNamer, typeConverter);
                typeStack.pop();
                resType.name = typeFrame.name; // avoid '!include' fields getting named after their '!include' definition/model instead of the field they come from
                return resType;
            }
            else {
                throw new Error("document 'definitions' not provided, cannot follow reference '" + refTypeStr + "'");
            }
        }
        // library type reference (i.e. 'libraryName.typeName')
        else if (isRamlLibraryType(ramlType)) {
            if (ramlDefinitions != null) {
                var refLib = getLibraryType(ramlType, typeStack, ramlDefinitions, mainRamlFile, rootTypePath);

                typeStack.push({ name: refLib.libraryTypeName, type: refLib.libraryType });
                var resType = readType(typeStack, typeof refLib.libraryPath === "string" ? refLib.libraryPath : rootTypePath, objectVisitor, ramlDefinitions, mainRamlFile, modelNamer, typeConverter);
                typeStack.pop();
                return resType;
            }
            else {
                throw new Error("document 'definitions' not provided, cannot follow uses '" + ramlType + "'");
            }
        }
        // union type 'A | B'
        else if (isRamlUnionType(ramlType) || isRamlArrayLiteralType(ramlType)) {
            // load all the union types
            var unionType = parseRamlType(<string>ramlType.type, ramlType.format);

            // check for the 'nil' ('null') type and remove it from the union types
            var nullable = false;
            if (unionType.types.includes("nil")) {
                nullable = true;
                removeValue(unionType.types, "nil");
            }

            var anyTypes: CodeAst.Type[] = [];
            for (var anyType of unionType.types) {
                typeStack.push({ name: typeFrame.name, type: anyType });
                var anyTypeField = readType(typeStack, rootTypePath, objectVisitor, ramlDefinitions, mainRamlFile, modelNamer, typeConverter);
                typeStack.pop();
                anyTypeField.type.nullable = anyTypeField.type.nullable || nullable;
                anyTypes.push(anyTypeField.type);
            }

            // if there's only one type after removing 'null' type and parsing then return that one type
            if (anyTypes.length === 1) {
                var optional = isOptionalType(ramlType, typeFrame.propName);

                return {
                    name: typeFrame.name,
                    type: anyTypes[0],
                    accessModifiers: ["public"],
                    required: !optional,
                    comments: isRamlType(ramlType) && !(ramlType.description == null || ramlType.description.length === 0) ? [ramlType.description] : undefined,
                };
            }

            // create a synthetic type union of all the union types
            var objType = createRamlClass(typeStack, [], rootTypePath, modelNamer);
            objType.classSignature.implementClassNames = addAll(objType.classSignature.implementClassNames, anyTypes);

            objType.classSignature.annotations = addAll(objType.classSignature.annotations, [{ name: "AnyOf", arguments: { value: JSON.stringify(anyTypes.map((type) => typeToString(type))).replace(/\",\"/g, "\", \"") } }]);

            objectVisitor(objType);

            var optional = isOptionalType(ramlType, typeFrame.propName);

            var syntheticUnionType = typeConverter(objType.classSignature.name);
            syntheticUnionType.nullable = syntheticUnionType.nullable || nullable;

            return {
                name: typeFrame.name,
                type: syntheticUnionType,
                accessModifiers: ["public"],
                required: !optional,
                comments: !(ramlType.description == null || ramlType.description.length === 0) ? [ramlType.description] : undefined,
            };
        }
        // array []
        else if (isRamlArrayType(ramlType)) {
            typeStack.push({ name: typeFrame.name, type: ramlType.items });
            var item = readType(typeStack, rootTypePath, objectVisitor, ramlDefinitions, mainRamlFile, modelNamer, typeConverter);
            typeStack.pop();
            item.type.arrayDimensions = (item.type.arrayDimensions || 0) + 1;
            return item;
        }
        // object {}
        else if (isRamlObjectType(ramlType)) {
            var fields: CodeAst.Field[] = [];

            for (var propName in ramlType.properties) {
                var prop = ramlType.properties[propName];
                var nameInfo = parsePropName(propName);

                typeStack.push({ name: nameInfo.name, type: prop, propName: propName });
                var field = readType(typeStack, rootTypePath, objectVisitor, ramlDefinitions, mainRamlFile, modelNamer, typeConverter);
                typeStack.pop();

                if (isRamlType(prop) && prop.required != null) {
                    field.required = prop.required;
                }

                fields.push(field);
            }

            var extendsTypes: CodeAst.Type[] = [];
            var annotations: CodeAst.Annotation[] = [];
            if (ramlType.additionalProperties) {
                annotations.push({ name: "AdditionalProperties", arguments: { value: "true" } });
            }

            // create a class that contains all the fields
            var objType = createRamlClass(typeStack, fields, rootTypePath, modelNamer);

            if (extendsTypes.length > 0) {
                objType.classSignature.implementClassNames = addAll(objType.classSignature.implementClassNames, extendsTypes);
            }
            if (annotations.length > 0) {
                objType.classSignature.annotations = addAll(objType.classSignature.annotations, annotations);
            }

            objectVisitor(objType);

            var optional = isOptionalType(ramlType, typeFrame.propName);

            // return a synthetic field based on the class
            return {
                name: typeFrame.name,
                type: typeConverter(objType.classSignature.name),
                required: !optional,
                accessModifiers: ["public"],
                comments: !(ramlType.description == null || ramlType.description.length === 0) ? [ramlType.description] : undefined,
            };
        }
        // primitive
        else {
            var fullType = typeof ramlType === "string" ? parseRamlType(ramlType) : parseRamlType(<string>ramlType.type, ramlType.format);

            // check for the 'nil' ('null') type and remove it from the union types
            var nullable = false;
            if (fullType.types.includes("nil")) {
                nullable = true;
                removeValue(fullType.types, "nil");
            }

            if (fullType.types.length > 1) {
                throw new Error("unsupported RAML type");
            }
            var isScalar = isRamlScalar(fullType.types[0]);
            if (!isScalar && fullType.types[0] !== "file") {
                throw new Error("unsupported RAML type " + JSON.stringify(ramlType) + " at " + rootTypePath + ", " + typeStack);
            }

            var { name: simpleName, required } = parsePropName(typeFrame.propName || typeFrame.name);

            var annotations: CodeAst.Annotation[] = [];
            if (isRamlType(ramlType, "string") && ((<RamlV1.TypeString>ramlType).minLength != null || ramlType.maxLength != null)) {
                var annArgs: { [name: string]: string } = {};
                if ((<RamlV1.TypeString>ramlType).minLength != null) {
                    annArgs["min"] = String((<RamlV1.TypeString>ramlType).minLength);
                }
                if (ramlType.maxLength != null) {
                    annArgs["max"] = String(ramlType.maxLength);
                }
                annotations.push({ name: "StringLength", arguments: annArgs });
            }
            if (isRamlType(ramlType) && ramlType.enum != null) {
                annotations.push({ name: "EnumOf", arguments: { value: JSON.stringify(ramlType.enum.map((enm) => String(enm))).replace(/\",\"/g, "\", \"") } });
            }

            var fieldType = Object.assign(typeConverter(fullType.types[0], fullType.format), {
                arrayDimensions: fullType.arrayDimensions,
                nullable: nullable,
                primitive: isScalar,
            });

            var field: CodeAst.Field = {
                name: simpleName,
                type: fieldType,
                accessModifiers: ["public"],
                annotations: annotations,
                comments: isRamlType(ramlType) && !(ramlType.description == null || ramlType.description.length === 0) ? [ramlType.description] : undefined,
                required: required,
            };
            return field;
        }
    }


    /** Check whether an object is a RAML type object, i.e. an object with a 'type' property.
     * If 'typeString' is not null, then true is only returned if 'obj.type' equals 'typeStr'
     * @param obj the object to test
     * @param typeStr optional, a type string to test this type against, if this argument is not null then true is only returned if 'obj.type' equals this argument
     */
    export function isRamlType(obj: string | RamlV1.TypeAny, typeStr?: string): obj is RamlV1.TypeAny {
        return obj != null && typeof obj !== "string" && "type" in obj && (typeStr == null || obj.type === typeStr);
    }


    /** Check whether an object is a RAML type reference string
     * @param obj the object to test
     */
    export function isRamlTypeReference(obj: any): obj is `!include ${string}` {
        return typeof obj === "string" && obj.startsWith("!include ");
    }


    /** Check whether an object is a RAML library type string.
     * A library type is a type name containing one or more periods '.' separating the type namespace from the type name, i.e. 'libraryName.typeName'
     * @param obj the object to test
     */
    export function isRamlLibraryType(obj: any): obj is `${string}.${string}` {
        return typeof obj === "string" && obj.includes(".");
    }


    /** Check whether an object is a RAML type object with a 'type' property string that ends with '[]'
     * @param type the object to test
     */
    export function isRamlArrayLiteralType(type: string | RamlV1.TypeAny): type is (RamlV1.TypeAny & { type: string }) {
        return type != null && typeof type !== "string" && typeof type.type === "string" && type.type.endsWith("[]");
    }


    /** Check whether a string is a RAML 'ScalarType' (excluding 'file' and 'nil')
     * @param type the type string to test
     */
    export function isRamlScalar(type: string): type is Exclude<RamlV1.ScalarType, "file" | "nil"> {
        return type === "number" || type === "integer" || type === "boolean" || type === "string" || type === "date-time" || type === "time-only" || type === "datetime-only" || type === "datetime";
    }


    /** Check whether a type is a RAML object type, i.e. 'type' equals 'object' or the type has a 'properties' property
     * @param type the type to test
     */
    export function isRamlObjectType(type: string | RamlV1.TypeAny): type is RamlV1.TypeObject {
        return typeof type !== "string" && (type.type === "object" || "properties" in type ||
            /*nested literal type check*/(type.type != null && typeof type.type !== "string" && (type.type.type === "object" || "properties" in type.type)));
    }


    /** Check whether a type is a RAML array type, i.e. 'type' equals 'array' or the type has an 'items' property
     * @param type the type to test
     */
    export function isRamlArrayType(type: string | RamlV1.TypeAny): type is (RamlV1.TypeArray & { items: string | RamlV1.TypeAny }) {
        return typeof type !== "string" && (type.type === "array" || "items" in type);
    }


    /** Check whether a type is a RAML union type, i.e. the 'type.type' is a string that contains '|' indicating that it contains two or more types.
     * See 'parseRamlType()' for parsing such a string.
     * @param type the type to test
     */
    export function isRamlUnionType(type: string | RamlV1.TypeAny): type is (RamlV1.TypeAny & { type: string }) {
        return typeof type !== "string" && typeof type.type === "string" && type.type.includes(" | ");
    }


    /** Check whether a string is a valid RAML HTTP method
     * @param httpMethod the string to test
     */
    export function isRamlHttpMethod(httpMethod: string): httpMethod is keyof RamlV1.HttpMethods {
        return httpMethod === "get" || httpMethod === "patch" || httpMethod === "put" || httpMethod === "post" || httpMethod === "delete" || httpMethod === "options" || httpMethod === "head";
    }


    /** Parse a RAML type string that may contain '|' and may end with '[]'.
     * Valid formats include:
     *   number[][]
     *   number | integer | boolean
     *   (number | string)[]
     * @param typeStr the type string
     * @param format optional 'type.format' string such as 'int8', 'int16', or 'float'
     */
    function parseRamlType(typeStr: string, format?: string): { types: string[]; arrayDimensions: number; format?: string } {
        var arrayDimensions = 0;
        while (typeStr.endsWith("[]")) {
            arrayDimensions++;
            typeStr = typeStr.substr(0, typeStr.length - 2);
        }

        if (typeStr.startsWith("(") && typeStr.endsWith(")")) {
            typeStr = typeStr.substring(1, typeStr.length - 1);
        }

        // TODO doesn't handle nested arrays, i.e. '(A | B[] | (C | D[])[])[]
        var types = typeStr.split("|").map((s) => s.trim());

        return { types, arrayDimensions, format };
    }


    function isOptionalType(type: string | RamlV1.TypeAny, propName: string | undefined | null) {
        return (isRamlType(type) && type.required != null) ? type.required !== true : (propName?.endsWith("?") || false);
    }


    /** Given a property name optionally ending with '?', remove '?' and return the 'name' and 'required' which is true if the name did NOT end with '?'
     * @param name the parameter name optionally ending with '?'
     */
    function parsePropName(name: string): { name: string; required: boolean } {
        var required = !name.endsWith("?");
        var plainName = !required ? name.substr(0, name.length - 1) : name;
        return { name: plainName, required };
    }


    /** Find a RAML 'type': 'libraryName.typeName' type definition.
     * @param type the type name to search for
     * @param typeStack a stack of types indicating where in the RAML this type reference was found (used to search for a parent 'uses' declaration)
     * @param ramlDefinitions all the RAML documents available
     * @param mainFileName the file name of the 'main' RAML document in 'ramlDefinitions'
     * @param rootTypePath the root file name of the file where this 'type' reference is located
     */
    export function getLibraryType(type: string, typeStack: TypeFrame[] | null, ramlDefinitions: RamlV1.Documents, mainFileName: string, rootTypePath: string
    ): { libraryType: RamlV1.TypeAny; libraryTypeName: string; libraryPath: string | null } {
        var [libName, libTypeName] = type.split(".");

        // find the closest 'uses' block that contains the library name, else assume we're in the main definition file and lookup its 'uses' block
        var library = (typeStack != null && typeStack.length > 0) ? findParentUses(typeStack, libName) : <RamlV1.Document>ramlDefinitions[mainFileName];

        if (library == null) {
            throw new Error("could not find find parent 'uses' library for '" + libName + "' of type " + type + " at " + rootTypePath);
        }
        else {
            // the 'uses' key-value could be a file name or an inline literal type definition
            var libraryPath = library.uses![libName];
            if (typeof libraryPath === "string") {
                // if file name, find the file and type
                var refLib = queryJsonPath("!include " + libraryPath, ramlDefinitions, rootTypePath);
                if (refLib.type == null) {
                    throw new Error("library type not found '" + type + " -> " + libraryPath + "' at " + rootTypePath);
                }
                if (refLib.type.types == null) {
                    throw new Error("library found but does not contain 'types', library '" + type + " -> " + libraryPath + "' at " + rootTypePath);
                }
                var refLibType = <string | RamlV1.TypeAny>refLib.type.types[libTypeName];
            }
            else {
                // else an inline literal type
                var refLibType = libraryPath.types![libTypeName];
            }

            // lots of error checks so we know exactly where/why we failed if we can't find the library type
            if (refLibType == null) {
                throw new Error("library with 'types' found, but does not contain '" + libTypeName + "', library: " + libraryPath + " at " + rootTypePath);
            }
            if (typeof refLibType === "string") {
                throw new Error("library with 'types' found, but the type is a string, type name '" + libTypeName + "', library: " + libraryPath + " at " + rootTypePath);
            }

            return {
                libraryType: refLibType,
                libraryTypeName: libTypeName,
                libraryPath: typeof libraryPath === "string" ? libraryPath : null,
            };
        }
    }


    /** Follow a JSON path in the format '#/path/to/value'
     * @param path the path, separated by '/'
     * @param obj the object to traverse
     * @returns the value from 'obj' from following 'path' or null if obj is null or null is encountered while following the path
     */
    export function queryJsonPath(path: string, context: any, currentPath: string | null): { type: any; path: string } {
        if (!path.startsWith("!include ")) {
            throw new Error("relative JSON path not supported, expected to start with '!include ' but was '" + path + "'");
        }
        var cleanPath = path.substr("!include ".length);
        cleanPath = cleanPath.startsWith("/") ? cleanPath.substr(1) : cleanPath;

        if (context[cleanPath] != null) {
            return { type: context[cleanPath], path: cleanPath };
        }

        var parts = cleanPath.split("/");

        var res = context;
        var i = 0;

        for (var size = parts.length; i < size; i++) {
            if (res == null) {
                break;
            }
            res = res[parts[i]];
        }

        if (res == null && currentPath != null) {
            var relativizedPath = dirPath(currentPath) + last(parts);

            return queryJsonPath("!include " + relativizedPath, context, null);
        }

        return { type: res, path: cleanPath };
    }


    function createRamlClass(typeStack: TypeFrame[], fields: CodeAst.Field[], rootFileName: string, modelNamer: (nameStack: string[]) => string): CodeAst.Class {
        var typeNames = typeStack.map((t) => t.name);
        return {
            classSignature: {
                name: modelNamer(typeNames),
                declarationType: "class",
                access: "public",
                annotations: [{ name: "RamlModel", arguments: { type: typeNames.join(".") } }, { name: "RamlFileName", arguments: { fileName: rootFileName } }],
            },
            blockType: "CLASS",
            using: [],
            fields: fields,
            methods: [],
        };
    }


    /** Search a 'typeStack' for types with 'uses' and search for a 'uses' reference named the 'target'
     * @param typeStack the type stack leading to the type containing the 'target' type reference
     * @param target the 'uses' type to search for
     */
    function findParentUses(typeStack: TypeFrame[], target?: string) {
        for (var i = typeStack.length - 1; i > -1; i--) {
            var stackType = typeStack[i];
            var uses = <{ [name: string]: string | RamlV1.Library }>(<any>stackType.type).uses;
            if (uses != null && (!target || uses[target])) {
                return {
                    name: stackType.name,
                    type: stackType.type,
                    uses: uses,
                };
            }
        }
        return null;
    }


    function addAll<T>(target: ArrayLike<T> | null | undefined, ary: ArrayLike<T>): T[] {
        var res = target != null ? Array.prototype.slice.call(target) : [];
        Array.prototype.push.apply(res, <any[]><any>ary);
        return res;
    }


    function dirPath(filePath: string): string {
        var lastIdx = filePath.lastIndexOf("/");
        return lastIdx > -1 ? filePath.substr(0, lastIdx + 1) : "";
    }


    function fileName(filePath: string): string {
        var file = last(filePath.split("/"));
        var dotIdx = file.lastIndexOf(".");
        return dotIdx > 0 ? file.substr(0, dotIdx) : file;
    }


    function last<T>(ary: T[]): T {
        return ary.length > 0 ? ary[ary.length - 1] : <any>null;
    }


    // copied from 'ts-mortar'
    /** Remove the first instance of a matching value from an array
     * @returns the removed index or -1 if the value could not be found
     */
    function removeValue<E>(ary: E[], value: E): number {
        var idx = ary.indexOf(value);
        if (idx > -1) {
            removeIndex(ary, idx);
        }
        return idx;
    }


    /** Remove an index from an array
     * For example: Arrays.removeIndex(["Alpha", "Beta", "Gamma"], 1)
     * returns: ["Alpha", "Gamma"]
     * @param ary the array to remove an index from
     * @param index the index of the value to remove
     * @returns the 'ary' with the value at 'index' removed
     */
    function removeIndex<E>(ary: E[], index: number): E[] {
        var size = ary.length;
        if (size < 1 || index < 0 || index >= size) { return ary; }

        for (var i = index + 1; i < size; i++) {
            ary[i - 1] = ary[i];
        }
        ary[size - 1] = <never>null;
        ary.length = size - 1;
        return ary;
    }
}

export = RamlConverter;