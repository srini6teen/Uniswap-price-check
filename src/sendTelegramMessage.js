const https = require("https");

export const sendMessage = (message) => {
  var path = `https://api.telegram.org/bot1146206178:AAGTt_a-h6OP39mxhv6noI8BLUOQxg129Pg/sendMessage?chat_id=-1001458881209&text=${message}`;

  https
    .get(path, (res) => {
      //console.log("statusCode:", res.statusCode);
      //console.log("headers:", res.headers);

      res.on("data", (d) => {
        //process.stdout.write(d);
      });
    })
    .on("error", (e) => {
      //console.error(e);
    });
};
