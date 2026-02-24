export namespace api {
	
	export class ApiResponse__int_ {
	    success: boolean;
	    message: string;
	    error?: string;
	    data?: number;
	
	    static createFrom(source: any = {}) {
	        return new ApiResponse__int_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.error = source["error"];
	        this.data = source["data"];
	    }
	}
	export class ApiResponse___posto_app_models_Collection_ {
	    success: boolean;
	    message: string;
	    error?: string;
	    data: models.Collection[];
	
	    static createFrom(source: any = {}) {
	        return new ApiResponse___posto_app_models_Collection_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], models.Collection);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ApiResponse___posto_app_repositories_CollectionJoinFileType_ {
	    success: boolean;
	    message: string;
	    error?: string;
	    data: repositories.CollectionJoinFileType[];
	
	    static createFrom(source: any = {}) {
	        return new ApiResponse___posto_app_repositories_CollectionJoinFileType_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], repositories.CollectionJoinFileType);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ApiResponse___posto_app_repositories_CollectionJoinType_ {
	    success: boolean;
	    message: string;
	    error?: string;
	    data: repositories.CollectionJoinType[];
	
	    static createFrom(source: any = {}) {
	        return new ApiResponse___posto_app_repositories_CollectionJoinType_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], repositories.CollectionJoinType);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ApiResponse_bool_ {
	    success: boolean;
	    message: string;
	    error?: string;
	    data: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ApiResponse_bool_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.error = source["error"];
	        this.data = source["data"];
	    }
	}
	export class ApiResponse_int_ {
	    success: boolean;
	    message: string;
	    error?: string;
	    data: number;
	
	    static createFrom(source: any = {}) {
	        return new ApiResponse_int_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.error = source["error"];
	        this.data = source["data"];
	    }
	}
	export class HttpResponse {
	    status_code: number;
	    content_type: string;
	    body: string;
	    is_binary: boolean;
	
	    static createFrom(source: any = {}) {
	        return new HttpResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.status_code = source["status_code"];
	        this.content_type = source["content_type"];
	        this.body = source["body"];
	        this.is_binary = source["is_binary"];
	    }
	}
	export class ApiResponse_posto_app_api_HttpResponse_ {
	    success: boolean;
	    message: string;
	    error?: string;
	    data: HttpResponse;
	
	    static createFrom(source: any = {}) {
	        return new ApiResponse_posto_app_api_HttpResponse_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], HttpResponse);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ApiResponse_posto_app_repositories_FileRequestData_ {
	    success: boolean;
	    message: string;
	    error?: string;
	    data: repositories.FileRequestData;
	
	    static createFrom(source: any = {}) {
	        return new ApiResponse_posto_app_repositories_FileRequestData_(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.error = source["error"];
	        this.data = this.convertValues(source["data"], repositories.FileRequestData);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace models {
	
	export class Collection {
	    pk_collection_id: number;
	    name: string;
	    // Go type: time
	    created_at: any;
	    // Go type: time
	    updated_at: any;
	
	    static createFrom(source: any = {}) {
	        return new Collection(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pk_collection_id = source["pk_collection_id"];
	        this.name = source["name"];
	        this.created_at = this.convertValues(source["created_at"], null);
	        this.updated_at = this.convertValues(source["updated_at"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace repositories {
	
	export class CollectionJoinFileType {
	    collection_id: number;
	    collection_name: string;
	    file_id?: number;
	    file_name?: string;
	    is_folder?: boolean;
	    parent_id?: number;
	
	    static createFrom(source: any = {}) {
	        return new CollectionJoinFileType(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.collection_id = source["collection_id"];
	        this.collection_name = source["collection_name"];
	        this.file_id = source["file_id"];
	        this.file_name = source["file_name"];
	        this.is_folder = source["is_folder"];
	        this.parent_id = source["parent_id"];
	    }
	}
	export class FileJoinType {
	    file_id?: number;
	    name: string;
	    is_folder: number;
	    parent_id?: number;
	    collection_id?: number;
	    files: FileJoinType[];
	    visited: boolean;
	
	    static createFrom(source: any = {}) {
	        return new FileJoinType(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.file_id = source["file_id"];
	        this.name = source["name"];
	        this.is_folder = source["is_folder"];
	        this.parent_id = source["parent_id"];
	        this.collection_id = source["collection_id"];
	        this.files = this.convertValues(source["files"], FileJoinType);
	        this.visited = source["visited"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CollectionJoinType {
	    collection_id?: number;
	    name: string;
	    files: FileJoinType[];
	
	    static createFrom(source: any = {}) {
	        return new CollectionJoinType(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.collection_id = source["collection_id"];
	        this.name = source["name"];
	        this.files = this.convertValues(source["files"], FileJoinType);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class FileCreationParam {
	    CollectionId: number;
	    ParentId?: number;
	    IsFolder: boolean;
	    Name: string;
	
	    static createFrom(source: any = {}) {
	        return new FileCreationParam(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.CollectionId = source["CollectionId"];
	        this.ParentId = source["ParentId"];
	        this.IsFolder = source["IsFolder"];
	        this.Name = source["Name"];
	    }
	}
	
	export class FileRequestData {
	    name?: string;
	    method?: string;
	    url?: string;
	    headers?: string;
	    body?: string;
	
	    static createFrom(source: any = {}) {
	        return new FileRequestData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.method = source["method"];
	        this.url = source["url"];
	        this.headers = source["headers"];
	        this.body = source["body"];
	    }
	}

}

