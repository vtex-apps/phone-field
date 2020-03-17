declare module '*.svg' {
  const url: string

  export default url
}

declare module '*.css' {
  const styles: { [name: string]: string }
  export default styles
}
