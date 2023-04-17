const axios = require("axios");
require("dotenv").config();
const express = require("express");
const nodeWebCam = require("node-webcam");
const DELAY_IN_MS = 5000;

function renderBox({ width, height, x, y, confidence }) {
  return `<div style="position: absolute; left:${x - width * 0.5}px; top:${
    y - height * 0.5
  }px; width: ${width}px; height: ${height}px; border: 1px solid red; color: white; font-weight: bold;">${confidence}</div>`;
}

async function main() {
  // Create a new Express app
  const app = express();
  const nest = new Nest({
    nestId: process.env.NEST_ID,
    refreshToken: process.env.REFRESH_TOKEN,
    apiKey: process.env.NEST_API_KEY,
    clientId: process.env.CLIENT_ID
  });
  await nest.init();
  // Define routes
  app.get("/", (req, res) => {
    res.send(`<html>
                <body style="margin: 0; padding: 0;">
                ${global.lastData.predictions
                  .filter((d) => d.confidence > 0.7)
                  .map(renderBox)}
                <img src="${global.lastimage}" />
                </body>
              </html>`);
  });
  // specifying parameters for the pictures to be taken
  const options = {
    width: 1280,
    height: 720,
    quality: 60,
    saveShots: false,
    output: "jpeg",
    device: false,
    callbackReturn: "base64"
  };

  // create instance using the above options
  const webcam = nodeWebCam.create(options);

  const picAndWait = () =>
    webcam.capture("test_picture", function (err, data) {
      axios({
        method: "POST",
        url: "https://detect.roboflow.com/deer-detection-mvfx0/1",
        params: {
          api_key: process.env.API_KEY
        },
        data,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
        .then(function (response) {
          console.log(response.data);
          setTimeout(picAndWait, DELAY_IN_MS);
          global.lastData = response.data;
          global.lastimage = data;
        })
        .catch(function (error) {
          console.log(error.response.data.message);
        });
    });
  picAndWait();

  // Start the server
  const port = 3001;
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}
main();
