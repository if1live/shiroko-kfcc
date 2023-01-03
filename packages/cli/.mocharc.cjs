module.exports = {
  loader: "ts-node/esm",
  extensions: ["ts", "tsx"],
  spec: ["test/**/*.test.*"],
  "watch-files": ["src"],
  reporter: "dot",
};
