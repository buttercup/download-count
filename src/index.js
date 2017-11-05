const { createServer } = require("http");
const { resolve } = require("path");
const badge = require("gh-badges");
const fetch = require("node-fetch");
const path = require("path");
const shortNumber = require("short-number");

const whitelist = [".dmg", ".zip", ".appimage", ".rpm", ".exe", ".deb"];
const baseConfig = {
  template: "flat"
};

function extractDownloadCount(json) {
  return json.reduce(
    (total, release) =>
      total +
      release.assets
        .filter(asset =>
          whitelist.includes(path.extname(asset.name).toLowerCase())
        )
        .reduce(
          (releaseTotal, asset) => releaseTotal + asset.download_count,
          0
        ),
    0
  );
}

function getDownloadCount() {
  return fetch(
    "https://api.github.com/repos/buttercup/buttercup-desktop/releases"
  )
    .then(res => res.json())
    .then(extractDownloadCount)
    .then(shortNumber);
}

function handleError(err, res) {
  res.statusCode = 500;
  return res.end("Server Error", err);
}

function showSvg(res, config) {
  badge(Object.assign({}, baseConfig, config), (svg, err) => {
    if (err) {
      return handleError(err, res);
    }
    res.setHeader("content-type", "image/svg+xml;charset=utf-8");
    res.end(svg);
  });
}

const app = createServer((req, res) => {
  badge.loadFont(resolve(__dirname, "../assets/Verdana.ttf"), err => {
    getDownloadCount()
      .then(count => {
        showSvg(res, {
          text: ["downloads", count],
          colorscheme: "brightgreen"
        });
      })
      .catch(err =>
        showSvg(res, {
          text: ["downloads", "unavailable"],
          colorscheme: "red"
        })
      );
  });
});

app.listen(3000);
