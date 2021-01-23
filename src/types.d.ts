export declare interface NavigationItem {
  label: string;
  id: string;
}

export declare interface MethodItem extends NavigationItem {
  method: string;
}

export declare interface EndpointItem extends NavigationItem {
  path: string;
  renderPath: boolean;
  indent: number;
  methods: MethodItem[];
}

export declare interface SecurityItem extends NavigationItem {}

export declare interface TypeItem extends NavigationItem {}

export declare interface DocumentationItem extends NavigationItem {
  /**
   * When set the documentation item refers to an external document
   */
  isExternal: boolean;
  /**
   * Only set when `isExternal` equals `true`.
   * An URL for the external documentation.
   */
  url?: string;
}

export declare interface TargetModel {
  documentation?: DocumentationItem[];
  types?: TypeItem[];
  securitySchemes?: SecurityItem[];
  endpoints?: EndpointItem[];
  _typeIds?: string[];
  _basePaths?: string[];
}
