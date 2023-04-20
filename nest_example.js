const Nest = require("nest-cam");
const fs = require("fs");
require("dotenv").config();
const nest = new Nest({
  nestId: process.env.NEST_ID,
  refreshToken: process.env.REFRESH_TOKEN,
  apiKey: process.env.NEST_API_KEY,
  clientId: process.env.CLIENT_ID
});

nest.init().then(() => {
  /*   nest.subscribe((eventStream) => {
    console.log(
      "There was some motion or sound caught on the camera!",
      eventStream
    );
  }); */
  // ...or
  nest.getLatestSnapshot().then((image) => {
    image.pipe(fs.createWriteStream("nestImage.jpg"));
    const contents = fs.readFileSync("nestImage.jpg", { encoding: "base64" });
    console.log(contents);
  });
  // ... or
  /*   nest.subscribeSnapshot(
    (image) => {
      image.pipe(fs.createWriteStream("nestImage.jpg"));
    },
    (error) => {
      console.log("Oh no there was an error!");
    }
  ); */
});
