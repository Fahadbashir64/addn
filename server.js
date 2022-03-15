import express from "express";
const app = express();
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
app.use(cors());

/*app.get("/", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  console.log("hello1");
  fetch("https://api.prepaidforge.com/v1/1.0/findAllProducts", {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS,DELETE,PUT",
    },
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      // Do some stuff ...
      console.log("dell");
      console.log(data);
      res.send(data);
    })
    .catch((err) => console.log(err));
});
*/
var token;

app.get("/", (req, res) => {
  console.log(token);
  fetch("https://api.prepaidforge.com/v1/1.0/signInWithApi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PrepaidForge-Api-Token": `${token}`,
    },
    body: JSON.stringify({
      // your expected POST request payload goes here
      email: "Worldofprodiverse@gmail.com",
      password: "Bravo1?@1",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      // enter you logic when the fetch is successful
      // var stocks = groupBy("skus", data);
      console.log(data);
      res.send(data);
    })
    .catch((error) => {
      // enter your logic for when there is an error (ex. error toast)
      console.log(error);
    });
});
/*app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/build/index.html"));
});
app.use(express.static(path.join(__dirname, "/public/build")));*/

function groupBy(key, array) {
  var result = [];
  for (var i = 0; i < array.length; i++) {
    var added = false;
    for (var j = 0; j < result.length; j++) {
      if (result[j][key] == array[i][key]) {
        result[j].items.push(array[i]);
        added = true;
        break;
      }
    }
    if (!added) {
      var entry = { items: [] };
      entry[key] = array[i][key];
      entry.items.push(array[i]);
      result.push(entry);
    }
  }
  return result;
}

app.get("/", (req, res) => {
  console.log(token);
  fetch("https://api.prepaidforge.com/v1/1.0/findStocks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PrepaidForge-Api-Token": `${token}`,
    },
    data: { types: ["TEXT", "SCAN"], skus: ["Netflix-25-Eur"] },
    /*body: JSON.stringify({
      // your expected POST request payload goes here
      email: "Worldofprodiverse@gmail.com",
      password: "Bravo1?@1",
    }),*/
  })
    .then((res) => res.json())
    .then((data) => {
      // enter you logic when the fetch is successful
      // var stocks = groupBy("skus", data);
      console.log(data);
      res.send(data);
    })
    .catch((error) => {
      // enter your logic for when there is an error (ex. error toast)
      console.log(error);
    });
});
const PORT = 8000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

//app.listen(5000, () => console.log("Listening on port 5000"));
