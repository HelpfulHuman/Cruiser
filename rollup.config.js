import typescript from "rollup-plugin-typescript";

export default [
  {
    input: "src/store.ts",
    output: [
      { file: "dist/store.js", format: "cjs" },
      { file: "dist/store.es.js", format: "es" },
    ],
    plugins: [
      typescript(),
    ],
  }
];