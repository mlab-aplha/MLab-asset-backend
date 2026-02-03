declare module '*.json' {
  const value: any;
  export default value;
}

declare var __dirname: string;
declare var process: {
  env: {
    PORT?: string;
    [key: string]: string | undefined;
  };
};
