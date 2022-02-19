/** Interfaces for modeling the Open API Spec
 * @see https://github.com/raml-org/raml-spec
 * Similar prior work:
 * @see https://github.com/aldonline/raml-typescript/blob/ae5bce74a62ac48713e9fb093a5ce9dab81c7ccf/raml.d.ts
 * @example https://petstore.swagger.io/
 * @author TeamworkGuy2
 */
declare module RamlV1 {

    /** Not part of the spec, an easy way to handle multiple RAML documents that together define a spec */
    export interface Documents {
        [fileName: string]: Document | TypeAny | Library;
    }

    export interface Document {
        /** A short, plain-text label for the API. Its value is a string. */
        title: string;
        /** A substantial, human-friendly description of the API. Its value is a string and MAY be formatted using markdown. */
        description?: string;
        /** The version of the API, for example "v1". Its value is a string. */
        version?: string;
        /** A URI that serves as the base for URIs of all resources. Often used as the base of the URL of each resource containing the location of the API. Can be a template URI. */
        baseUri?: string;
        /** Named parameters used in the baseUri (template). */
        baseUriParameters?: NamedParameterMap;
        /** Additional overall documentation for the API. */
        documentation?: { title: string; content: string }[];
        /** The default media types to use for request and response bodies (payloads), for example "application/json". */
        mediaType?: string | string[];
        /** Specifies the protocols that an API supports.
         * If the protocols node is explicitly specified, such node specification SHALL override any protocol included in the baseUri node.
         * The protocols node MUST be a non-empty array of strings, of values HTTP and/or HTTPS, and be case-insensitive.
         */
        protocols?: string[];
        /** An alias for the equivalent "types" node for compatibility with RAML 0.8. Deprecated - API definitions SHOULD use the "types" node because a future RAML version might
         * remove the "schemas" alias with that node. The "types" node supports XML and JSON schemas. */
        schemas?: { [schemaName: string]: any }[];
        /** Declarations of (data) types for use within the API. */
        types?: { [typeName: string]: string | TypeAny };
        /** The value of this node MUST be a map where key names become names of traits that MAY be referenced throughout the API, and values are trait declarations.
         * There are many advantages of reusing patterns across multiple resources and methods and these  declarations are frequently repetitive.
         * For example, an API that requires OAuth authentication might require an X-Access-Token header for all methods across all resources.
         * It might be preferable to define such a pattern in a single place and apply it consistently everywhere.
         * A trait, like a method, can provide method-level nodes such as a description, headers, query string parameters, and responses.
         */
        traits?: { [traitName: string]: Trait };
        /** The value of this node MUST be a map where keys names become names of resource types that MAY be referenced throughout the API, and values are resource type declarations.
         * There are many advantages of reusing patterns across multiple resources and methods and these  declarations are frequently repetitive.
         * For example, an API that requires OAuth authentication might require an X-Access-Token header for all methods across all resources.
         * It might be preferable to define such a pattern in a single place and apply it consistently everywhere.
         * A resource type, like a resource, can specify security schemes, methods, and other nodes.
         * A resource that uses a resource type inherits its nodes.
         * A resource type can also use, and thus inherit from, another resource type. Resource types and resources are related through an inheritance chain pattern.
         * A resource type definition MUST NOT incorporate nested resources.
         * A resource type definition cannot be used to generate nested resources when the definition is applied to a resource.
         * A resource type definition does not apply to its own existing nested resources.
         */
        resourceTypes?: { [resourceName: string]: Resource };
        /** The value of the annotationsType node is a map whose keys define annotation type names, also referred to as annotations, and whose values
         * are key-value pairs called annotation type declarations. An annotation type declaration has the same syntax as a data type declaration,
         * and its facets have the same syntax as the corresponding ones for data types, but with the addition of the allowedTargets facet.
         * An annotation type declaration constrains the value of an annotation of that type just as a data type declaration constrains the
         * value of a URI parameter, query parameter, header, or body of that type.
         */
        annotationTypes?: { [annotationTypeName: string]: AnnotationType };
        /** The value of securitySchemes is a map having key-value pairs that map security scheme names to security scheme declarations.
         * Most REST APIs have one or more mechanisms to secure data access, identify requests, and determine access level and data visibility.
         * RAML supports the following built-in security scheme types:
         * - Type 	Description
         * - OAuth 1.0 	The API authentication requires using OAuth 1.0 as described in RFC5849
         * - OAuth 2.0 	The API authentication requires using OAuth 2.0 as described in RFC6749
         * - Basic Authentication 	The API authentication relies on using Basic Access Authentication as described in RFC2617
         * - Digest Authentication 	The API authentication relies on using Digest Access Authentication as described in RFC2617
         * - Pass Through 	Headers or query parameters are passed through to the API based on a defined mapping.
         * - x-{other} 	The API authentication relies on another authentication method.
         */
        securitySchemes?: { [securitySchemaName: string]: SecuritySchema };
        /** All API methods, except those having their own securedBy node, can be authenticated by any of the specified security schemes.
         * Applying a security scheme to a method overrides any security scheme applied to the API as a whole. To indicate that a method
         * is protected using a specific security scheme, the method MUST be defined by using the securedBy node.
         * The value assigned to the securedBy node MUST be a list of any of the security schemes previously defined in the securitySchemes node of RAML document root.
         */
        securedBy?: (string | { [securitySchemeName: string]: { scopes: string[] } } | null)[];
        /** RAML libraries are used to combine any collection of data type declarations, resource type declarations, trait declarations,
         * and security scheme declarations into modular, externalized, reusable groups. While libraries are intended to define common
         * declarations in external documents, which are then included where needed, libraries can also be defined inline.
         */
        uses?: { [libraryName: string]: string | Library };
        /** Annotations to be applied to this API. An annotation is a map having a key that begins with "(" and ends with ")" where the text
         * enclosed in parentheses is the annotation name, and the value is an instance of that annotation. */
        [annotationName: `(${string})`]: Annotation;
        /** The resources of the API, identified as relative URIs that begin with a slash (/).
         * A resource node is one that begins with the slash and is either at the root of the API definition or a child of a resource node. For example, /users and /{groupId}. */
        [resourceUri: `/${string}`]: ResourceNode;
    }


    export interface Annotation {
    }


    export interface AnnotationType {
        displayName?: string;
        description?: string;
        /** The location within an API specification where annotations can be applied MUST be one of the target locations in the following Target Locations table.
         * The targets are the locations themselves, not sub-properties within the locations; for example, the Method target refers to the method node, not to the method display name, description, and so on.
         * - API
         * - DocumentationItem
         * - Resource
         * - Method
         * - Response
         * - RequestBody
         * - ResponseBody
         * - TypeDeclaration
         * - Example
         * - ResourceType
         * - Trait
         * - SecurityScheme
         * - SecuritySchemeSettings
         * - AnnotationType
         * - Library
         * - Overlay
         * - Extension
         */
        allowedTargets?: string[];
        [annotationName: `(${string})`]: Annotation;
    }


    export interface Library {
        usage?: string;
        types?: Document["types"];
        schemas?: Document["schemas"];
        resourceTypes?: Document["resourceTypes"];
        traits?: Document["traits"];
        securitySchemes?: Document["securitySchemes"];
        annotationTypes?: Document["annotationTypes"];
        uses?: Document["uses"];
    }


    /** RESTful API methods are operations that are performed on a resource. These properties correspond to the
     * HTTP methods defined in the HTTP version 1.1 specification RFC2616 and its extension, RFC5789.
     */
    export interface Method {
        /** An alternate, human-friendly method name in the context of the resource. If the displayName node is not defined for a method, documentation tools SHOULD refer to the resource by its key, which acts as the method name. */
        displayName?: string;
        /** A longer, human-friendly description of the method in the context of the resource. Its value is a string and MAY be formatted using markdown. */
        description?: string;
        /** Detailed information about any request headers needed by this method.
         * Like the value of the properties node, the value of the headers node MUST be a map, specifically a properties declaration.
         * Each property in this declaration object is a header declaration. Each property name specifies an allowed header name.
         * Each property value specifies the header value type as a type name or an inline type declaration.
         */
        headers?: { [headerName: string]: string | Property }; // TODO not sure if correct?
        /** Detailed information about any query parameters needed by this method. Mutually exclusive with queryString. */
        queryParameters?: { [headerName: string]: string | Property };
        /** The query string needed by this method. Mutually exclusive with queryParameters. */
        queryString?: string | TypeBase | (string | TypeBase)[];
        /** Information about the expected responses to a request. */
        responses?: { [httpStatusCode: string | number]: ResponseDeclaration };
        /** A request body that the method admits. */
        body?: { [mediaType: string]: string | TypeBase };
        /** Explicitly specify the protocol(s) used to invoke a method, thereby overriding the protocols set elsewhere, for example in the baseUri or the root-level protocols node. */
        protocols?: string[];
        /** A list of the traits to apply to this method. */
        is?: TraitRef[];
        /** The security schemes that apply to this method. */
        securedBy?: (string | { [securitySchemeName: string]: { scopes: string[] } } | null)[];
        /** Annotations to be applied to this API. An annotation is a map having a key that begins with "(" and ends with ")" where the text
         * enclosed in parentheses is the annotation name, and the value is an instance of that annotation. */
        [annotationName: `(${string})`]: Annotation;
    }


    export interface NamedParameterMap {
        [parameterName: string]: NamedParameter | NamedParameter[];
    }


    /** A resource is identified by its relative URI, which MUST begin with a slash (/). Every node whose key begins with a slash, and is either at the
     * root of the API definition or is the child node of a resource node, is such a resource node.
     */
    export interface ResourceNode extends ResourceNodeLeaf {
        /** A nested resource is any node whose name begins with a slash (/). This resource SHALL therefore be treated as a relative URI. */
        [resourceUri: `/${string}`]: ResourceNode;
    }


    export interface HttpMethods {
        get?: Method;
        patch?: Method;
        put?: Method;
        post?: Method;
        delete?: Method;
        options?: Method;
        head?: Method;
    }


    /** The basis for a 'ResourceNode' except without nested resources */
    export interface ResourceNodeLeaf extends HttpMethods {
        /** An alternate, human-friendly name for the resource. If the displayName node is not defined for a resource, documentation tools
         * SHOULD refer to the resource by its key, which acts as the resource name. For example, tools SHOULD refer to the relative URI /jobs.
         */
        displayName?: string;
        description?: string;
        /** The value MUST be the name of a resource type defined within the root-level resourceTypes node or in a library. Resource type definitions do not apply to existing nested resources. */
        type?: string[];
        /** A list of traits to apply to all methods declared (implicitly or explicitly) for this resource. Individual methods can override this declaration. */
        is?: TraitRef[];
        securedBy?: (string | { [securitySchemeName: string]: { scopes: string[] } } | null)[];
        uriParameters?: NamedParameterMap;
        /** Annotations to be applied to this API. An annotation MUST be a map having a key that begins with "(" and ends with ")", where the
         * text enclosed in parentheses is the annotation name and the value is an instance of that annotation.
         */
        [annotationName: `(${string})`]: Annotation;
    }


    export interface ResponseDeclaration {
        /** A substantial, human-friendly description of a response. Its value MUST be a string and MAY be formatted using Markdown. */
        description?: string;
        /** Detailed information about any response headers returned by this method */
        headers?: { [headerName: string]: string | TypeAny }; // TODO not sure if correct?
        /** The body of the response */
        body?: { [mediaType: string]: any };
        /** Annotations to be applied to this API. An annotation MUST be a map having a key that begins with "(" and ends with ")", where the text enclosed in parentheses is the annotation name and the value is an instance of that annotation. */
        [annotationName: `(${string})`]: Annotation;
    }


    export interface SecuritySchema {
        /** Specifies the API security mechanisms. One API-supported authentication method is allowed.
         * The value MUST be one of the following methods: OAuth 1.0, OAuth 2.0, Basic Authentication, Digest Authentication, Pass Through, x-<other> */
        type: string;
        displayName?: string;
        description?: string;
        describedBy?: DescribedBy;
        settings?: any;
    }


    export interface DescribedBy {
        /** The value of the headers node MUST be a map, specifically a properties declaration. Each property in this declaration object is a header declaration.
         * Each property name specifies an allowed header name. Each property value specifies the header value type as a type name or an inline type declaration. */
        headers?: { [headerName: string]: string | TypeAny }; // TODO not sure if correct?
        queryParameters?: { [headerName: string]: string | Property };
        queryString?: string | TypeBase;
        responses?: { [httpStatusCode: string | number]: ResponseDeclaration };
        [annotationName: `(${string})`]: Annotation;
    }


    /** The value of this node MUST be a map where keys names become names of resource types that MAY be referenced throughout the API, and values are resource type declarations. */
    export interface Resource {
        usage?: string;
        /* TODO - the type should be: ResourceNodeLeaf & { [M in keyof HttpMethods as `${M}?`]: Method }; */
        [resourceTypeName: string]: any;
    }


    /** The value of this node MUST be a map where key names become names of traits that MAY be referenced throughout the API, and values are trait declarations.
     */
    export interface Trait {
        usage?: string;
        /* TODO - the type should be: ResourceNodeLeaf; */
        [traitName: string]: any;
    }


    /** The value of a trait MUST be an array of any number of elements. Each element MUST be the name of a trait defined within the root-level traits node or in a library.
     * A trait can also be applied to a resource by using the is node. Using this node is equivalent to applying the trait to all methods for that
     * resource, whether the method is declared explicitly in the resource definition or inherited from a resource type. A trait is applied to a method
     * in left-to-right order, according to the traits defined in the is node. Trait definitions do not apply to nested resources.
     */
    export type TraitRef = string | {
        [name: string]: { [parameterName: string]: any };
    }


    export interface BaseParameter {

    }


    export interface NumericParameter extends BaseParameter {

    }


    export interface StringParameter extends BaseParameter {

    }


    export type NamedParameter = BaseParameter | NumericParameter | StringParameter;


    export type ScalarType = "number" | "integer" | "boolean" | "string" | "date-time" | "time-only" | "datetime-only" | "datetime" | "file" | "nil";


    export interface TypeBase {
        /** A default value for a type. When an API request is completely missing the instance of a type, then the API must act as if the API client had
         * sent an instance of that type with the instance value being the value in the default facet. */
        default?: any;
        /** Deprecated - API definitions SHOULD use the "type" facet because the "schema" alias for that facet name might be removed in a future RAML version.
         * An alias for the equivalent "type" facet for compatibility with RAML 0.8. The "type" facet supports XML and JSON schemas. */
        schema?: any;
        /** The type which the current type extends or just wraps. The value of a type node MUST be either
         * a) the name of a user-defined type or
         * b) the name of a built-in RAML data type (object, array, or one of the scalar types) or
         * c) an inline type declaration.
         */
        type?: string | TypeAny;
        example?: any;
        examples?: any;
        /** An alternate, human-friendly name for the type */
        displayName?: string | null;
        /** A substantial, human-friendly description of the type. Its value is a string and MAY be formatted using markdown. */
        description?: string | null;
        /** A map of additional, user-defined restrictions that will be inherited and applied by any extending subtype. See section User-defined Facets for more information. */
        facets?: { [facetName: string]: any };
        /** The capability to configure XML serialization of this type instance. */
        xml?: any;
        /** An enumeration of all the possible values of instances of this type. The value is an array containing representations of these possible values;
         * an instance of this type MUST be equal to one of these values. */
        enum?: any[];
        [annotationName: `(${string})`]: Annotation;
        /** any other properties, to support sub-types */
        [prop: string]: any;
    }


    export interface TypeObject extends TypeBase {
        properties?: { [name: string]: string | Property };
        minProperties?: number;
        maxProperties?: number;
        additionalProperties?: boolean;
        discriminator?: string;
        discriminatorValue?: any;
    }


    export interface TypeArray extends TypeBase {
        type: "array";
        /** Boolean value that indicates if items in the array MUST be unique. */
        uniqueItems?: boolean;
        /** Indicates the type all items in the array are inherited from. Can be a reference to an existing type or an inline type declaration. */
        items?: string | TypeAny;
        /** default: 0, minimum amount of items in array. Value MUST be equal to or greater than 0. */
        minItems?: number;
        /** default: 2147483647, maximum amount of items in array. Value MUST be equal to or greater than 0. */
        maxItems?: number;
    }


    export interface TypeString extends TypeBase {
        type: "string";
        /** Regular expression that this string MUST match. */
        pattern?: string;
        /** default: 0, minimum length of the string. Value MUST be equal to or greater than 0. */
        minLength?: number;
        /** default: 2147483647, maximum length of the string. Value MUST be equal to or greater than 0. */
        maxLength?: number;
    }


    export interface TypeNumber extends TypeBase {
        type: "number" | "integer";
        minimum?: number;
        maximum?: number;
        format?: "int" | "int8" | "int16" | "int32" | "int64" | "long" | "float" | "double";
        multipleOf?: number;
    }


    export interface TypeBoolean extends TypeBase {
        type: "boolean";
    }


    export type TypeAny = TypeBase | TypeObject | TypeArray | TypeString | TypeNumber | TypeBoolean | TypeDate | TypeFile;


    export interface TypeDate extends TypeBase {
        /** The following date type representations MUST be supported:
         * 'date-only' - The "full-date" notation of RFC3339, namely yyyy-mm-dd. Does not support time or time zone-offset notation.
         * 'time-only' - The "partial-time" notation of RFC3339, namely hh:mm:ss[.ff...]. Does not support date or time zone-offset notation.
         * 'datetime-only' - Combined date-only and time-only with a separator of "T", namely yyyy-mm-ddThh:mm:ss[.ff...]. Does not support a time zone offset.
         * 'datetime' - A timestamp in one of the following formats: if the format is omitted or set to rfc3339, uses the "date-time" notation of RFC3339;
         *   if format is set to rfc2616, uses the format defined in RFC2616.
         */
        type: "date-only" | "time-only" | "datetime-only" | "datetime";
        /** The format of the value of a type 'datetime'. The value MUST be either rfc3339 or rfc2616. Any other values are invalid. */
        format?: "rfc3339" | "rfc2616";
    }


    export interface TypeFile extends TypeBase {
        type: "file";
        /** A list of valid content-type strings for the file. The file type '* / *' (without spaces) MUST be a valid value. */
        fileTypes?: string[];
        /** default: 0, specifies the minimum number of bytes for a parameter value. The value MUST be equal to or greater than 0. */
        minLength?: number;
        /** default: 2147483647, specifies the maximum number of bytes for a parameter value. The value MUST be equal to or greater than 0. */
        maxLength?: number;
    }


    export type Property = TypeAny & {
        /** default: true, specifies that the property is required or not. */
        required?: boolean;
    };


    export type TypedFragmentIdentifier =
        "DocumentationItem"
        | "DataType"
        | "NamedExample"
        | "ResourceType"
        | "Trait"
        | "AnnotationTypeDeclaration"
        | "Library"
        | "Overlay"
        | "Extension"
        | "SecurityScheme";

}