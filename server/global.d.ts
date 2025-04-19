declare module '@alicloud/sts-sdk' {
  export interface AssumeRoleRequestParams {
    roleArn: string;
    roleSessionName: string;
    durationSeconds: number;
    policy?: string;
  }
  
  export class AssumeRoleRequest {
    constructor(params: AssumeRoleRequestParams);
  }
  
  export interface Credentials {
    accessKeyId: string;
    accessKeySecret: string;
    securityToken: string;
    expiration: string;
  }
  
  export interface AssumeRoleResponse {
    body?: {
      credentials?: Credentials;
      requestId?: string;
      assumedRoleUser?: {
        arn?: string;
        assumedRoleId?: string;
      };
    };
  }
  
  export interface STS20150401Config {
    accessKeyId: string;
    accessKeySecret: string;
    endpoint: string;
    [key: string]: any;
  }
  
  export default class STS20150401 {
    constructor(config: STS20150401Config);
    assumeRoleWithOptions(request: AssumeRoleRequest, runtime: any): Promise<AssumeRoleResponse>;
    assumeRole(request: AssumeRoleRequest): Promise<AssumeRoleResponse>;
  }
}

declare module '@alicloud/openapi-client' {
  export class Config {
    constructor(config: {
      accessKeyId: string;
      accessKeySecret: string;
      endpoint: string;
      [key: string]: any;
    });
  }
}

declare module '@alicloud/tea-util' {
  export class RuntimeOptions {
    constructor(options?: any);
  }
}

// 声明alibabacloud-nls模块以解决TypeScript编译错误
declare module 'alibabacloud-nls'; 