const https = require("https");

export const sendPushNotification = async (expoPushToken, name, price) => {
  console.log("push called");
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "CryptoPrice",
    body: `${name} Target Price Reached`,
    data: { data: `${name} : ${price}` },
    _displayInForeground: true,
  };

  var path = "https://exp.host/--/api/v2/push/send";
  var postMessage = JSON.stringify(message);

  var options = {
    hostname: "exp.host",
    port: 443,
    path: "/--/api/v2/push/send",
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
      "Content-Length": postMessage.length,
    },
  };

  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);

    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.write(postMessage);
  req.end();

  //   https.request(options, (res) => {
  //     res
  //       .on("data", (d) => {
  //         process.stdout.write(d);
  //       })
  //       .on("error", (e) => {
  //         console.error(e);
  //       });
  //   });

  //   await fetch("https://exp.host/--/api/v2/push/send", {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Accept-encoding": "gzip, deflate",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(message),
  //   });
};
