export default {
  "name": "@markdown-editor/main",
  "version": "0.1.0",
  "env": "",
  "moduleDir": "src",
  "main": "@markdown-editor/main",
  "modules": {
    "@markdown-editor/main": {
      "path": "main"
    },
    "@markdown-editor/global": {
      "path": "global"
    },
    "@markdown-editor/store": {
      "path": "store"
    }
  },
  "aiAPIUrl": "https://api.openai.com/v1/completions",
  "aiAPIKey": ""
}
