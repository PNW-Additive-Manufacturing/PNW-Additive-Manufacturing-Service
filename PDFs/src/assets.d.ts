declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.ttf' {
  const value: Uint8Array;
  export default value;
}