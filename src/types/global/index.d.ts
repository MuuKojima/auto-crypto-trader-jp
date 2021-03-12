declare namespace NodeJS {
  interface ProcessEnv {
    readonly SERVICE_ENV:
      | 'test'
      | 'local'
      | 'development'
      | 'staging'
      | 'production';
    readonly ALGORITHM_ID: 'three-times-up-and-down';
    readonly SERVICE_ID: 'bitflyer';
  }
}
