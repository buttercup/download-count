const { createServer } = require("http");
const { resolve } = require("path");
const badge = require("gh-badges");

const format = {
  text: ["downloads", "60000K"],
  colorscheme: "brightgreen",
  template: "flat"
};

const app = createServer((req, res) => {
  res.setHeader("content-type", "image/svg+xml;charset=utf-8");
  badge.loadFont(resolve(__dirname, "../assets/Verdana.ttf"), err => {
    badge(format, (svg, err) => {
      res.end(svg);
    });
  });
});

app.listen(3000);
