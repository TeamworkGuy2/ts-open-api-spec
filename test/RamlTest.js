"use strict";
// Just a stand-in to ensure that the spec is correct
function raml1Tests() {
    var doc = {
        "title": "PoweScope Experience API",
        "description": "This is a RAML defination for an example API\n\n**Published History:**\n\n| Asset Version | Published By  | Date / Time | Remarks |\n|:-------------:| ------------- | ----------- | ------- |\n| **1.0.0**     | John Smith    | 2021-10-17  | \n| **1.1.0**     | John Smith   | 2021-11-15  | Adding pagination\n| **1.1.2**   | John Smith | 2021-12-20 | RAML changes for assets\n| **2.0.0** | John Smith | 2022-01-06 | Changes for files and Materials in request\n| **2.0.1** | John Smith | 2022-01-15 | Updated c4e-standard-security-traits version to 1.0.6\n| **2.2.0** | John Smith | 2022-01-24 | Changed maxLength attribute of field value in page object",
        "version": "v2.0",
        "mediaType": "application/json",
        "documentation": [
            {
                "title": "Overview",
                "content": "!include docs/Home.md"
            },
            {
                "title": "How To Use The API?",
                "content": "!include docs/HowTo.md"
            },
            {
                "title": "Error Handling",
                "content": "!include docs/ErrorHandling.md"
            },
            {
                "title": "Releases",
                "content": "!include docs/Release.md"
            }
        ],
        "types": {
            "CountyCountyId": "!include /resources/types/CountyCountyId.raml",
            "CountySearch": "!include /resources/types/CountySearch.raml",
            "AssetResponse": "!include resources/types/AssetResponse.raml",
            "FileAsset": "!include resources/types/FileAsset.raml",
            "Vendors": "!include /resources/types/Vendors.raml",
            "VendorsResponse": "!include /resources/types/VendorsResponse.raml",
            "Documents": "!include /resources/types/Documents.raml",
            "DocumentsResponse": "!include /resources/types/DocumentsResponse.raml",
            "DocumentContextsResponse": "!include /resources/types/DocumentContextsResponse.raml",
            "LocationMapping": "!include /resources/types/LocationMapping.raml",
            "LocationMappingResponse": "!include resources/types/LocationMappingResponse.raml",
            "FileTransfer": "!include /resources/types/FileTransfer.raml",
            "FileTransferResponse": "!include /resources/types/FileTransferResponse.raml",
            "county": {
                "properties": {
                    "countyId?": "string"
                }
            },
            "state": {
                "properties": {
                    "stateId?": "string"
                }
            },
            "item": {
                "properties": {
                    "itemID?": "string"
                }
            },
            "section": {
                "properties": {
                    "sectionID?": "string"
                }
            },
            "category": {
                "properties": {
                    "categoryID?": "string"
                }
            },
            "sectionCategory": {
                "properties": {
                    "sectionID?": "string",
                    "categoryID?": "string"
                }
            },
        },
        "uses": {
            "Errors": "/exchange_modules/c4e-standard-errors-library/1.0.0/c4e-standard-errors-library.raml",
            "Operations": "/exchange_modules/c4e-standard-data-management-operations-library/1.0.0/c4e-standard-data-management-operations-library.raml",
            "Security": "/exchange_modules/c4e-standard-security-traits/1.0.6/c4e-standard-security-traits.raml",
            "Requests": "/exchange_modules/c4e-standard-requests-library/1.0.3/c4e-standard-request-librabry.raml"
        },
        "/assetManagement": {
            "/vendors": {
                "/search": {
                    "is": [
                        "Security.jwt"
                    ],
                    "post": {
                        "queryString": [
                            "county|state"
                        ],
                        "description": "This operation will query a **Vendors** object. ",
                        "is": [
                            {
                                "Operations.searchOperation": {
                                    "media-type": "application/json",
                                    "data-search-type": "Vendors",
                                    "response-200-type": "VendorsResponse",
                                    "object-name": "Vendors"
                                }
                            },
                            "Errors.default",
                            "Errors.experience"
                        ]
                    }
                }
            },
            "/document-contexts": {
                "is": [
                    "Security.jwt"
                ],
                "description": "Retrieve document types",
                "get": {
                    "description": "This operation will return a **Documents** object.",
                    "is": [
                        {
                            "Operations.read": {
                                "media-type": "application/json",
                                "response-200-type": "DocumentContextsResponse",
                                "object-name": "Document Context"
                            }
                        },
                        "Errors.default",
                        "Errors.experience"
                    ]
                }
            },
            "/documents": {
                "/search": {
                    "is": [
                        "Security.jwt"
                    ],
                    "post": {
                        "description": "This operation will query a **document** object. ",
                        "is": [
                            {
                                "Operations.searchOperation": {
                                    "media-type": "application/json",
                                    "data-search-type": "Documents",
                                    "response-200-type": "DocumentsResponse",
                                    "object-name": "Documents"
                                }
                            },
                            "Errors.default",
                            "Errors.experience"
                        ]
                    }
                }
            },
            "/location": {
                "/mapping": {
                    "is": [
                        "Security.jwt"
                    ],
                    "post": {
                        "description": "This operation will create a **LocationMapping** object. ",
                        "is": [
                            {
                                "Operations.create": {
                                    "media-type": "application/json",
                                    "data-add-type": "LocationMapping",
                                    "response-201-type": "LocationMappingResponse",
                                    "object-name": "LocationMapping"
                                }
                            },
                            "Errors.default",
                            "Errors.experience"
                        ]
                    },
                    "get": {
                        "description": "This operation will get a **LocationMapping** object. ",
                        "queryString": [
                            "Requests.pagination",
                            "county|state|item|sectionCategory"
                        ],
                        "is": [
                            {
                                "Operations.read": {
                                    "media-type": "application/json",
                                    "response-200-type": "LocationMappingResponse",
                                    "object-name": "Vendor Context"
                                }
                            },
                            "Errors.default",
                            "Errors.experience"
                        ]
                    },
                    "delete": {
                        "description": "Delete an existing LocationMapping",
                        "body": {
                            "application/json": {
                                "type": "array",
                                "items": {
                                    "type": "number",
                                    "example": 25
                                }
                            }
                        },
                        "responses": {
                            "200": {
                                "body": {
                                    "application/json": {
                                        "example": "!include resources/examples/responses/delete-override-response-200.raml"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "/filetransfer": {
                "is": [
                    "Security.clientIdEnforceable",
                    "Security.traceable"
                ],
                "description": "Upload File Asset to storage",
                "post": {
                    "displayName": "Upload a file",
                    "queryParameters": {
                        "itemID": {
                            "type": "string",
                            "required": true
                        },
                        "emailAddress": {
                            "type": "string",
                            "required": true
                        }
                    },
                    "headers": {
                        "fileName": {
                            "type": "string",
                            "required": true
                        },
                        "Content-Type": {
                            "type": "string",
                            "required": false
                        }
                    },
                    "is": [
                        {
                            "Operations.create": {
                                "media-type": "application/octet-stream",
                                "data-add-type": "FileTransfer",
                                "response-201-type": "FileTransferResponse",
                                "object-name": "FileTransfer"
                            }
                        },
                        "Errors.default",
                        "Errors.experience"
                    ]
                }
            }
        },
        "/county": {
            "/search": {
                "is": [
                    "Security.jwt"
                ],
                "get": {
                    "queryParameters": {
                        "countyId": {
                            "type": "array",
                            "maxItems": 25,
                            "items": {
                                "type": "string"
                            }
                        }
                    },
                    "description": "This operation will return **County** information",
                    "is": [
                        {
                            "Operations.read": {
                                "media-type": "application/json",
                                "response-200-type": "CountySearch",
                                "object-name": "CountySearch"
                            }
                        },
                        "Errors.default",
                        "Errors.experience"
                    ]
                }
            },
            "/{erpCode}/{countyId}": {
                "is": [
                    "Security.jwt"
                ],
                "get": {
                    "description": "This operation will return **County** information",
                    "is": [
                        {
                            "Operations.read": {
                                "media-type": "application/json",
                                "response-200-type": "CountyCountyId",
                                "object-name": "CountyCountyId"
                            }
                        },
                        "Errors.default",
                        "Errors.experience"
                    ]
                }
            }
        }
    };
    var lib = {
        "exchange_modules/c4e-standard-data-management-operations-library/1.0.0/c4e-standard-data-management-operations-library.raml": {
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
                },
                "update": {
                    "displayName": "Update <<object-name>> Object",
                    "description": "Updating new <<object-name>> object",
                    "body": {
                        "<<media-type>>": {
                            "type": "<<data-update-type>>"
                        }
                    },
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
                },
                "delete": {
                    "displayName": "Delete <<object-name>> Object",
                    "description": "Deleting <<object-name>> object",
                    "body": {
                        "<<media-type>>": {
                            "type": "<<data-delete-type>>"
                        }
                    },
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
                },
                "generic": {
                    "displayName": "<<object-name>> Object",
                    "description": "<<object-name>> object",
                    "body": {
                        "<<media-type>>": null
                    },
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
                                "<<media-type>>": null
                            }
                        }
                    }
                },
                "complexOperation": {
                    "displayName": "Complex Operation for <<object-name>> Object",
                    "description": "Complex Operation for <<object-name>> object",
                    "body": {
                        "<<media-type>>": {
                            "type": "<<data-complex-type>>"
                        }
                    },
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
                },
                "searchOperation": {
                    "displayName": "Search criteria for <<object-name>> Object",
                    "description": "Search criteria for <<object-name>> object",
                    "body": {
                        "<<media-type>>": {
                            "type": "<<data-search-type>>"
                        }
                    },
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
                },
                "noContentResponse": {
                    "displayName": "Update Request For <<object-name>>",
                    "description": "Update processing <<object-name>> request",
                    "body": {
                        "<<media-type>>": {
                            "type": "<<data-type>>"
                        }
                    },
                    "responses": {
                        "204": {
                            "headers": {
                                "x-correlation-id": {
                                    "type": "string"
                                }
                            }
                        }
                    }
                },
                "asyncRequest": {
                    "displayName": "Async Request For <<object-name>>",
                    "description": "Asyncronoush processing <<object-name>> request",
                    "body": {
                        "<<media-type>>": {
                            "type": "<<data-async-type>>"
                        }
                    },
                    "responses": {
                        "202": {
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
                                    "type": "<<response-202-type>>"
                                }
                            }
                        }
                    }
                },
                "queueScheduler": {
                    "displayName": "Request For <<object-name>>",
                    "description": "Request to <<object-name>> for scheduling",
                    "body": {
                        "<<media-type>>": {
                            "type": "<<data-queue-type>>"
                        }
                    },
                    "responses": {
                        "202": {
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
                                    "type": "<<response-202-type>>"
                                }
                            }
                        }
                    }
                },
                "upserting": {
                    "displayName": "Upserting For <<object-name>>",
                    "description": "Request to <<object-name>> for Insert or Update",
                    "body": {
                        "<<media-type>>": {
                            "type": "<<data-type>>"
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Upserting Existing Records response ",
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
                                    "type": "<<response-type>>"
                                }
                            }
                        },
                        "201": {
                            "description": "Upserting New Records response ",
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
                                    "type": "<<response-type>>"
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
                },
                "update": {
                    "post": {
                        "is": [
                            "update"
                        ]
                    }
                },
                "delete": {
                    "post": {
                        "is": [
                            "delete"
                        ]
                    }
                },
                "complexOperation": {
                    "post": {
                        "is": [
                            "complexOperation"
                        ]
                    }
                },
                "searchBy": {
                    "post": {
                        "is": [
                            "searchOperation"
                        ]
                    }
                },
                "asyncRequest": {
                    "post": {
                        "is": [
                            "asyncRequest"
                        ]
                    }
                },
                "queueScheduler": {
                    "post": {
                        "is": [
                            "queueScheduler"
                        ]
                    }
                },
                "noContentUpdate": {
                    "put": {
                        "is": [
                            "noContentResponse"
                        ]
                    }
                },
                "upsert": {
                    "put": {
                        "is": [
                            "upserting"
                        ]
                    }
                },
                "generic": {
                    "post": {
                        "is": [
                            "generic"
                        ]
                    }
                }
            }
        },
        "exchange_modules/c4e-standard-errors-library/1.0.0/c4e-standard-errors-library.raml": {
            "types": {
                "DetailedError": {
                    "displayName": "Response Detailed Error with a Collection of Standard Errors",
                    "description": "This is a detailed error object",
                    "type": "object",
                    "properties": {
                        "errorCode": {
                            "required": true,
                            "maxLength": 255,
                            "example": "001-DATA-ERROR",
                            "description": "Error code for client representation",
                            "type": "string"
                        },
                        "correlationId": {
                            "required": true,
                            "maxLength": 120,
                            "example": "YXS1231112234",
                            "description": "Correlation ID is part of the request header",
                            "type": "string"
                        },
                        "details": {
                            "required": false,
                            "description": "Error details",
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "code": {
                                        "required": false,
                                        "maxLength": 50,
                                        "description": "A human-readable, unique error code",
                                        "type": "string",
                                        "example": "VALIDATION_ERROR",
                                        "default": "VALIDATION_ERROR"
                                    },
                                    "description": {
                                        "description": "Error description",
                                        "required": false,
                                        "type": "string"
                                    },
                                    "details": {
                                        "description": "Error details",
                                        "required": false,
                                        "type": "string"
                                    },
                                    "errors": {
                                        "required": false,
                                        "description": "When an error occur, this section will have an information for the error for specific operation",
                                        "type": "array",
                                        "items": {
                                            "type": "StandardError"
                                        }
                                    }
                                }
                            }
                        },
                        "message": {
                            "maxLength": 255,
                            "description": "Used for localization",
                            "type": "string",
                            "example": "Error was encountered while processing a price update request",
                            "default": "Unknown Error"
                        },
                        "status": {
                            "maxLength": 255,
                            "description": "FAILED",
                            "type": "string",
                            "example": "FAILED",
                            "default": "FAILED"
                        }
                    }
                },
                "StandardError": {
                    "description": "This is a standard simple error object",
                    "displayName": "Standard Response Error Item",
                    "type": "object",
                    "properties": {
                        "errorCode": {
                            "required": false,
                            "example": "REQUIRED_FIELD_MISSING",
                            "description": "Status Code\n",
                            "type": "string"
                        },
                        "message": {
                            "required": false,
                            "example": "Missing or invalid name field",
                            "description": "Message description in english\n",
                            "type": "string"
                        },
                        "description": {
                            "required": false,
                            "type": "string"
                        },
                        "remarks": {
                            "required": false,
                            "type": "string"
                        }
                    }
                }
            },
            "traits": {
                "standard": {
                    "responses": {
                        "400": {
                            "headers": {
                                "x-correlation-id": {
                                    "type": "string"
                                },
                                "Content-Type": {
                                    "type": "string",
                                    "default": "application/json"
                                }
                            },
                            "body": {
                                "application/json": {
                                    "type": "<<error-standard-type>>",
                                    "example": "<<error-400-data-error-example>>"
                                }
                            }
                        },
                        "403": {
                            "headers": {
                                "x-correlation-id": {
                                    "type": "string"
                                },
                                "Content-Type": {
                                    "type": "string",
                                    "default": "application/json"
                                }
                            },
                            "body": {
                                "application/json": {
                                    "type": "<<error-standard-type>>",
                                    "example": "<<error-403-forbidden-example>>"
                                }
                            }
                        },
                        "500": {
                            "headers": {
                                "x-correlation-id": {
                                    "type": "string"
                                },
                                "Content-Type": {
                                    "type": "string",
                                    "default": "application/json"
                                }
                            },
                            "body": {
                                "application/json": {
                                    "type": "<<error-standard-type>>",
                                    "example": "<<error-500-process-error-example>>"
                                }
                            }
                        },
                        "503": {
                            "headers": {
                                "x-correlation-id": {
                                    "type": "string"
                                },
                                "Content-Type": {
                                    "type": "string",
                                    "default": "application/json"
                                }
                            },
                            "body": {
                                "application/json": {
                                    "type": "<<error-standard-type>>",
                                    "example": "<<error-503-service-unavailable-example>>"
                                }
                            }
                        },
                        "504": {
                            "headers": {
                                "x-correlation-id": {
                                    "type": "string"
                                },
                                "Content-Type": {
                                    "type": "string",
                                    "default": "application/json"
                                }
                            },
                            "body": {
                                "application/json": {
                                    "type": "<<error-standard-type>>",
                                    "example": "<<error-504-gateway-timeout-example>>"
                                }
                            }
                        }
                    }
                },
                "default": {
                    "responses": {
                        "400": {
                            "description": "The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).",
                            "body": {
                                "application/json": {
                                    "example": "{\n  \"code\": \"400\",\n  \"message\": \"BAD_REQUEST\",\n  \"description\": \"Bad Request\",\n  \"correlationId\": \"7f2db41f1ac43465881cf71c96fd5227\" \n}\n"
                                }
                            }
                        },
                        "403": {
                            "description": "There is a problem with the credentials that were provided.",
                            "body": {
                                "application/json": {
                                    "example": "{\n  \"code\": \"403\",\n  \"message\": \"ACCESS_DENIED\",\n  \"description\": \"problem with the credentials that were provided\",\n  \"correlationId\": \"7f2db41f1ac43465881cf71c96fd5227\" \n}  \n"
                                }
                            }
                        },
                        "404": {
                            "description": "The server cannot find the requested resource.",
                            "body": {
                                "application/json": {
                                    "example": "{\n  \"code\": \"404\",\n  \"message\": \"RESOURCE_NOT_FOUND\",\n  \"description\": \"The resource cannot be found\",\n  \"correlationId\": \"7f2db41f1ac43465881cf71c96fd5227\" \n}\n"
                                }
                            }
                        },
                        "405": {
                            "description": "A request was made of a resource using a request method not supported by that resource; for example, using GET on a form which requires data to be presented via POST, or using PUT on a read-only resource.",
                            "body": {
                                "application/json": {
                                    "example": "{\n  \"code\": \"405\",\n  \"message\": \"METHOD_NOT_ALLOWED\",\n  \"description\": \"Method not allowed\",\n  \"correlationId\": \"7f2db41f1ac43465881cf71c96fd5227\" \n}\n"
                                }
                            }
                        },
                        "500": {
                            "description": "An internal processing error occurred while processing the API request.",
                            "body": {
                                "application/json": {
                                    "example": "{\n  \"code\": \"500\",\n  \"message\": \"INTERNAL_SERVER_ERROR\",\n  \"description\": \"Internal Server Error\",\n  \"correlationId\": \"7f2db41f1ac43465881cf71c96fd5227\" \n}\n"
                                }
                            }
                        }
                    }
                },
                "experience": {
                    "responses": {
                        "597": {
                            "description": "Experience API timeout during dependent service invocation.",
                            "body": {
                                "application/json": {
                                    "example": "{\n  \"code\": \"597\",\n  \"message\": \"EXP_TIMEOUT\",\n  \"description\": \"Experience API Dependent Service Timeout\",\n  \"correlationId\": \"7f2db41f1ac43465881cf71c96fd5227\" \n}\n"
                                }
                            }
                        }
                    }
                },
                "process": {
                    "responses": {
                        "598": {
                            "description": "Process API timeout during dependent service invocation.",
                            "body": {
                                "application/json": {
                                    "example": "{\n  \"code\": \"598\",\n  \"message\": \"PROC_T:MEOUT\",\n  \"description\": \"Process API Dependent Service Timeout\",\n  \"correlationId\": \"7f2db41f1ac43465881cf71c96fd5227\" \n}\n"
                                }
                            }
                        }
                    }
                },
                "system": {
                    "responses": {
                        "599": {
                            "description": "System API timeout during dependent service invocation.",
                            "body": {
                                "application/json": {
                                    "example": "{\n  \"code\": \"599\",\n  \"message\": \"SYS_TIMEOUT\",\n  \"description\": \"System API Dependent Service Timeout\",\n  \"correlationId\": \"7f2db41f1ac43465881cf71c96fd5227\" \n}                 \n"
                                }
                            }
                        }
                    }
                }
            }
        },
        "exchange_modules/c4e-standard-requests-library/1.0.3/c4e-standard-request-librabry.raml": {
            "traits": {
                "pageable": {
                    "description": "pageable traits will be used for DB APIs",
                    "queryParameters": {
                        "skip?": {
                            "description": "Number of items in the queried collection that are to be skipped and not included in the result",
                            "type": "integer",
                            "example": 1
                        },
                        "top?": {
                            "description": "Number of items in the queried collection to be included in the result",
                            "type": "integer",
                            "default": 100,
                            "example": 10
                        },
                        "count?": {
                            "description": "Flag for returning the count of the matching resources included with the resources in the response",
                            "type": "boolean",
                            "example": true
                        }
                    }
                },
                "pagination": {
                    "description": "Pagination trait to be used by search APIs",
                    "queryParameters": {
                        "page?": {
                            "description": "page Number",
                            "type": "integer",
                            "example": 1
                        },
                        "pageSize?": {
                            "description": "Number of items in the page",
                            "type": "integer",
                            "default": 100,
                            "example": 10
                        },
                        "count?": {
                            "description": "Flag for returning the count of the matching resources included with the resources in the response",
                            "type": "boolean",
                            "example": true
                        }
                    }
                }
            },
            "types": {
                "pageable": {
                    "properties": {
                        "skip?": {
                            "description": "Number of items in the queried collection that are to be skipped and not included in the result",
                            "type": "integer",
                            "example": 1
                        },
                        "top?": {
                            "description": "Number of items in the queried collection to be included in the result",
                            "type": "integer",
                            "default": 100,
                            "example": 100
                        },
                        "count?": {
                            "description": "Flag for returning the count of the matching resources included with the resources in the response",
                            "type": "boolean",
                            "example": true
                        }
                    }
                },
                "pagination": {
                    "properties": {
                        "page?": {
                            "description": "page Number",
                            "type": "integer",
                            "example": 1
                        },
                        "pageSize?": {
                            "description": "Number of items in the page",
                            "type": "integer",
                            "default": 100,
                            "example": 100
                        },
                        "count?": {
                            "description": "Flag for returning the count of the matching resources included with the resources in the response",
                            "type": "boolean",
                            "example": true
                        }
                    }
                }
            }
        },
        "exchange_modules/c4e-standard-responses-library/1.0.0/c4e-standard-responses-library.raml": {
            "types": {
                "Default": {
                    "displayName": "StandardResponse.Default",
                    "description": "This is the default standard response",
                    "type": "object",
                    "properties": {
                        "correlationId": {
                            "type": "string",
                            "description": "correlation id used for log checking specific session execution.",
                            "example": "12345678",
                            "required": true
                        },
                        "code": {
                            "type": "number",
                            "required": true,
                            "example": 200,
                            "description": "\n**Example:**\n\n  - 200 - For HTTP response with 200\n  - 500 - For DB response from System API that has an error 500"
                        },
                        "status": {
                            "required": true,
                            "example": "SUCCESS",
                            "description": "Response status\n",
                            "enum": [
                                "SUCCESS",
                                "FAILED",
                                "INPROGRESS",
                                "COMPLETED",
                                "ERROR",
                                "PENDING",
                                "ACKNOWLEDGE",
                                "ACCEPTED"
                            ]
                        },
                        "message": {
                            "required": false,
                            "example": "Successfully processed an operation",
                            "description": "Message description in english\n",
                            "type": "string"
                        },
                        "details": {
                            "required": false,
                            "type": "string",
                            "example": "Free form description",
                            "description": "Additional information about the response or an instruction for fixing the error\n"
                        },
                        "requestTimestamp": {
                            "required": false,
                            "description": "Requested timestamp format yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
                            "type": "datetime",
                            "example": "2020-10-20T12:34:56.000Z",
                            "format": "rfc3339"
                        },
                        "responseTimestamp": {
                            "required": false,
                            "description": "Response timestamp format yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
                            "type": "datetime",
                            "example": "2020-10-20T12:34:57.000Z",
                            "format": "rfc3339"
                        }
                    }
                },
                "APIStatus": {
                    "displayName": "StandardResponse.APIStatus",
                    "description": "This is for API Status for Health Check",
                    "type": "object",
                    "properties": {
                        "code": {
                            "type": "number",
                            "required": true,
                            "example": 200,
                            "description": "200 - ready to accept request\n500 - encountered an unexpected condition that prevented it from fulfilling the request\n504 - API is having a connectivity issue \n503 - API is unavailable ",
                            "enum": [
                                200,
                                500,
                                504,
                                503
                            ]
                        },
                        "status": {
                            "required": false,
                            "example": "ACTIVE",
                            "description": "Response status if the application is ACTIVE or MAINTENANCE\n",
                            "enum": [
                                "ACTIVE",
                                "MAINTENANCE",
                                "CONTACT_SUPPORT"
                            ]
                        },
                        "message": {
                            "required": false,
                            "example": "Successfully completed the request",
                            "description": "Message description in english\n",
                            "type": "string"
                        },
                        "details": {
                            "required": false,
                            "type": "string",
                            "example": "Free form description",
                            "description": "Additional information about the response or an instruction for fixing the error\n"
                        },
                        "requestTimestamp": {
                            "required": false,
                            "description": "Requested timestamp",
                            "type": "datetime",
                            "example": "2010-10-20T12:34:56.000Z",
                            "format": "rfc3339"
                        },
                        "responseTimestamp": {
                            "required": false,
                            "description": "Response timestamp",
                            "type": "datetime",
                            "example": "2010-10-20T12:34:57.000Z",
                            "format": "rfc3339"
                        }
                    }
                }
            }
        },
        "exchange_modules/c4e-standard-security-traits/1.0.6/c4e-standard-security-traits.raml": {
            "traits": {
                "clientIdEnforceable": {
                    "description": "Used for Client ID Enforcement",
                    "headers": {
                        "client_id": {
                            "displayName": "Client ID",
                            "type": "string",
                            "required": false
                        },
                        "client_secret": {
                            "displayName": "Client Secret",
                            "type": "string",
                            "required": false
                        }
                    }
                },
                "jwt": {
                    "headers": {
                        "Authorization": {
                            "description": "Bearer",
                            "type": "string"
                        }
                    },
                    "responses": {
                        "400": {
                            "description": "Token was not provided."
                        },
                        "401": {
                            "description": "Bad or expired token. To fix, you should re-authenticate the user."
                        },
                        "403": {
                            "description": "The client id validation failed."
                        },
                        "503": {
                            "description": "Error communicating with JWKS server."
                        }
                    }
                },
                "traceable": {
                    "description": "For tracking / auditing purpose",
                    "headers": {
                        "source": {
                            "displayName": "Source / API Consumer (Provide Name of the App)",
                            "type": "string",
                            "description": "This field should identify the calling system/application",
                            "required": false,
                            "example": "pa10003"
                        },
                        "X-Correlation-Id": {
                            "displayName": "Correlation ID",
                            "type": "string",
                            "description": "This field is used for passing a traceable ID between API hops.  This field should ALWAYS be passed within all APIs.",
                            "required": false
                        }
                    }
                }
            },
            "securitySchemes": {
                "basicAuth": {
                    "displayName": "Basic Authentication (Login / SignIn)",
                    "description": "This API is secured by Basic Authentication",
                    "type": "Basic Authentication"
                },
                "oauthToken": {
                    "type": "OAuth 2.0",
                    "describedBy": {
                        "headers": {
                            "Authorization": {
                                "type": "string"
                            }
                        },
                        "responses": {
                            "400": {
                                "description": "Invalid token"
                            },
                            "401": {
                                "description": "Unauthorized or Connection error when connecting to the authorization server.\n"
                            },
                            "403": {
                                "description": "Forbidden, invalid client application credentials.\n"
                            }
                        }
                    },
                    "settings": {
                        "authorizationUri": "https://coreandmain.okta.com/oauth2/v1/authorize",
                        "accessTokenUri": "https://coreandmain.okta.com/oauth2/access_token",
                        "authorizationGrants": [
                            "authorization_code",
                            "client_credentials",
                            "implicit"
                        ]
                    }
                }
            }
        }
    };
}
