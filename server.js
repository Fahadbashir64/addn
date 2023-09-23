import express from "express";
const app = express();
import cors from "cors";
import fetch from "node-fetch";
import mongoose from "mongoose";
import Buyer from "./models/Buyer.js";
import Product from "./models/Product.js";
import Country from "./models/Country.js";
import Currency from "./models/Currency.js";
import Promo from "./models/Promo.js";
import CC from "currency-converter-lt";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

//
// import fs from 'fs/promises';

// const filePath = 'brands.json';

// // Read file asynchronously
// async function createCountryData() {
//   try {
//     // Read the JSON file asynchronously
//     const jsonData = await fs.readFile(filePath, 'utf8');

//     // Parse the JSON data
//     const data = JSON.parse(jsonData);
//     const brands = ['amazon', 'ebay', 'eneba', 'razer', 'bol.com', 'gamestop', 'uber', 'just', 'deliveroo', 'dominos', 'itunes', 'netflix', 'google', 'spotify', 'twitch', 'cashlib', 'astropay', 'mint', 'pcs', 'transcash', 'flexepin', 'american', 'obucks', 'red', 'ea', 'origin', 'pubg', 'playstation', 'xbox', 'nintendo', 'jagex', 'riot', 'deezer', 'hulu', 'minecraft', 'roblox', 'mobile', 'fortnite', 'bitsa', 'skype', 'vanilla'];
//     brands.forEach((brand) => {
//       var country = [];
//       data.forEach((element) => {
//         const indexOfSpace = element.name.indexOf(" ");
//         if (indexOfSpace !== -1) {
//           var name = element.name.substring(0, indexOfSpace);
//         } else {
//           var name = element.name;
//         }
//         name = name.toLowerCase();
//         if (
//           brand === name
//         ) {
//           country.push(element.countryCode);
//         }
//       });
//       console.log('cont', country);
//       const countryy = new Country1({
//         _id: new mongoose.Types.ObjectId(),
//         brand: brand,
//         names: country,
//       });
  
//       countryy
//         .save()
//         .then((result) => {
//           console.log(result);
//         })
//         .catch((err) => {
//           console.log(err);
//         });
//     })

//   } catch (error) {
//     console.error('Error reading or parsing JSON file:', error.message);
//   }
// }

//db connection

const connection_url =
  "mongodb+srv://fahadbashir1:123456fb@cluster0.ro2av.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose
  .connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to Database");
  })
  .catch((error) => {
    console.log("Cannot connect to DB : ", error);
  });

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 60 * 5,
    },
  })
);

const __filename = fileURLToPath(import.meta.url);
// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public/build")));
//routes

app.post("/createpromo", (req, res) => {
  Promo.findOne({
    code: req.body.code,
  }).then((res2) => {
    if (res2) {
      return res.status(400).send("Code already exists");
    }
    const promo = new Promo({
      _id: new mongoose.Types.ObjectId(),
      code: req.body.code,
      discount: req.body.discount,
    });
    promo
      .save()
      .then((result) => {
        res.status(200).json({ msg: "successfully submitted" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ msg: "error occured" });
      });
  });
});

app.post("/getpromo", (req, res) => {
  Promo.findOne({ code: req.body.code }).then((res2) => {
    if (res2) {
      res.status(200).send(res2);
    } else {
      res.status(400).send("code does not exist");
    }
  });
});

app.post("/generate", (req, res) => {
  Buyer.findOne({
    email: req.body.email,
  }).then((user) => {
    if (user) {
      return res.status(400).send("User already exists");
    }
    const buyer = new Buyer({
      _id: new mongoose.Types.ObjectId(),
      key: req.body.buyer.key,
      email: req.body.email,
      name: req.body.name,
      address: req.body.address,
      zip: req.body.zip,
      balance: 0,
    });
    buyer
      .save()
      .then((result) => {
        res.status(200).json({ msg: "successfully submitted" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ msg: "error occured" });
      });
  });
});

app.get("/getCatalog", (req, res) => {
  const username = 'NEXOZ-LLC-SANDBOX';
  const password = '7e68311d-4008-4913-888e-de15491b4db5';

  const authHeaderValue = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  fetch("https://api.bamboocardportal.com/api/integration/v1.0/catalog", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeaderValue,
      }
    })
      .then((response) => response.json())
      .then((data1) => {
        res.send(data1);
      })
      .catch((error) => {
        console.log(error);
        res.send(error);
      });
});

app.post("/connect", (req, res) => {
  Buyer.findOne({
    key: req.body.buyer.key,
  }).then((BuyerExist) => {
    if (BuyerExist) {
      const token = jwt.sign({ userId: BuyerExist._id }, "talhakhan", {
        expiresIn: "1h",
      });
      res.status(200).send({ BuyerExist, token });
    } else {
      res.status(400).send("User does not exist");
    }
  });
});

app.post("/getcurrencies", (req, res) => {
  Country.findOne({ brand: req.body.brand }).then((res1) => {
    Currency.findOne({ brand: req.body.brand, country: res1.names[0] }).then(
      (res2) => {
        const data = {
          countries: res1.names,
          curr: res2,
        };
        res.status(200).send(data);
      }
    );
  });
});

app.post("/pricelist", (req, res) => {
  Currency.findOne({ brand: req.body.brand, country: req.body.country }).then(
    (res2) => {
      res.status(200).send(res2);
    }
  );
});

app.post("/sku", (req, res) => {
  Product.findOne({
    brand: req.body.brand,
    countries: req.body.country,
    currencyCode: req.body.code,
    "faceValue.amount": req.body.price,
  }).then((res2) => {
    res.send(res2);
  });
});

app.post("/stocks", (req, res) => {
  Product.findOne({
    brand: req.body.brand,
    countries: req.body.country,
    currencyCode: req.body.code,
    "faceValue.amount": req.body.price,
  }).then((res2) => {
    fetch("https://api.prepaidforge.com/v1/1.0/findStocks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PrepaidForge-Api-Token": req.body.apitoken,
      },

      body: JSON.stringify({
        types: ["TEXT", "SCAN"],
        skus: [res2.sku],
      }),
    })
      .then((response) => response.json())
      .then((data1) => {
        var temp = [];
        data1.forEach((element) => {
          if (element.quantity != 0) temp.push(element);
        });
        temp = temp.sort(function (a, b) {
          return a.purchasePrice - b.purchasePrice;
        });
        res.send(temp[0]);
      })
      .catch((error) => {
        console.log(error);
        res.send(error);
      });
  });
});

app.post("/convert", (req, res) => {
  let currencyConverter = new CC({
    from: req.body.from,
    to: req.body.to,
    amount: req.body.amount,
  });
  currencyConverter.convert().then((response) => {
    res.send({ cur: response });
  });
});

app.post("/order", (req, res) => {
  if (req.body.brand === "Crypto Voucher") {
    fetch("https://dev-api.cryptovoucher.io/merchant/voucher/partner", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        login: "echiefsofficial",
        password: "smotherunsteadydisruptunbittenstrickencurvyhazilydebug",
        amount: req.body.price,
        currency: "EUR",
        orderId: "3714cc3a-c25f-47e6-83fc-2da76fe27f340",
      }),
    }).then((data1) => {
      if (data1) {
        Buyer.findOne({ key: req.body.user }).then((result2) => {
          Buyer.findOneAndUpdate(
            { key: req.body.user },
            { balance: result2.balance - req.body.total }
          ).then((result) => {
            if (result) {
              const frommail = "ozchest1@gmail.com";
              const password = "ozchest@123";
              const tomail = req.body.email;
              var transporter = nodemailer.createTransport({
                service: "gmail",

                auth: {
                  user: frommail,
                  pass: password,
                },
              });
              var mailOptions = {
                from: frommail,
                to: tomail,
                subject: "Gift Card From Ozchest",
                text: `${req.body.product}  Link: ${data1.code}`,
              };
              console.log(mailOptions.text);
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log("mail failed");
                } else {
                  console.log("mail success");
                  res.send(data1);
                }
              });
            }
          });
        });
      }
    });
  } else {
    fetch("https://api.prepaidforge.com/v1/1.0/createApiOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PrepaidForge-Api-Token": req.body.apitoken,
      },

      body: JSON.stringify({
        sku: req.body.product,
        price: req.body.price,
        codeType: req.body.type,
      }),
    }).then((data1) => {
      if (data1) {
        Buyer.findOne({ key: req.body.user }).then((result2) => {
          Buyer.findOneAndUpdate(
            { key: req.body.user },
            { balance: result2.balance - req.body.total }
          ).then((result) => {
            if (result) {
              const frommail = "ozchest1@gmail.com";
              const password = "ozchest@123";
              const tomail = req.body.email;
              var transporter = nodemailer.createTransport({
                service: "gmail",

                auth: {
                  user: frommail,
                  pass: password,
                },
              });
              var link;
              if (req.body.type === "TEXT") link = data1.code;
              else if (req.body.type === "SCAN")
                link = data1.image.downloadLink;
              var mailOptions = {
                from: frommail,
                to: tomail,
                subject: "Gift Card From Ozchest",
                text: `${req.body.product}  Link: ${link}`,
              };
              console.log(mailOptions.text);
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log("mail failed");
                } else {
                  console.log("mail success");
                  res.send(data1);
                }
              });
            }
          });
        });
      }
    });
  }
});

app.post("/balance", (req, res) => {
  Buyer.findOne({
    key: req.body.user,
  }).then((res2) => {
    if (res2) {
      console.log(res2.balance);
      res.send({ balance: res2.balance });
    }
  });
});

app.post("/ipn", (req, res) => {
  const hmac = crypto.createHmac("sha512", "5hOWEbra7oU79ejwSpcLcEvq5cYHIC7E");
  hmac.update(JSON.stringify(req.body, Object.keys(req.body).sort()));
  const signature = hmac.digest("hex");
  if (
    req.body.payment_status === "finished" &&
    signature === req.headers["x-nowpayments-sig"]
  ) {
    let currencyConverter = new CC({
      from: req.body.price_currency,
      to: "eur",
      amount: req.body.price_amount,
    });
    currencyConverter.convert().then((response) => {
      console.log(response);
      Buyer.findOne({
        key: req.body.order_id,
      }).then((res2) => {
        if (res2) {
          Buyer.findOneAndUpdate(
            { key: req.body.order_id },
            { balance: Number(response) + Number(res2.balance) }
          ).then((result) => {
            console.log("updated");
          });
        }
      });
    });
  }
  res.json({ status: 200 });
});

app.get("/apitoken", (req, res) => {
  fetch("https://api.prepaidforge.com/v1/1.0/signInWithApi", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "Worldofprodiverse@gmail.com",
      password: "Bravo1?@1",
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data.apiToken);
      res.send(data);
    })
    .catch((error) => {
      res.send(error);
    });
});

/*
app.get("/saveitems", (req, res) => {
  fetch("https://api.prepaidforge.com/v1/1.0/findAllProducts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      Product.insertMany(data);
      res.send(data);
    })
    .catch((error) => {
      res.send(error);
    });
});
*/
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "public/index.html"));
});

app.post("/savecountry", (req, res) => {
  var country = [];
  Product.find().then((res1) => {
    if (res1) {
      res1.forEach((element) => {
        if (
          element.brand === req.body.brand &&
          country.indexOf(element.countries[0]) === -1
        ) {
          country.push(element.countries[0]);
        }
      });
      const countryy = new Country({
        _id: new mongoose.Types.ObjectId(),
        brand: req.body.brand,
        names: country,
      });

      countryy
        .save()
        .then((result) => {
          console.log(result);
          res.status(200).json({ msg: "successfully submitted" });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ msg: "error occured" });
        });
    }
  });
});

app.post("/savecurrency", (req, res) => {
  Country.findOne({ brand: req.body.brand }).then((res1) => {
    res1.names.forEach((element) => {
      var curr = [];
      Product.find({ brand: req.body.brand, countries: element }).then(
        (res2) => {
          res2.forEach((element2) => {
            if (curr.indexOf(element2.faceValue.price) === -1)
              curr.push(element2.faceValue.amount);
          });
          curr = curr.sort(function (a, b) {
            return a - b;
          });
          const temp = new Currency({
            _id: new mongoose.Types.ObjectId(),
            brand: req.body.brand,
            country: element,
            code: res2[0].faceValue.currency,
            price: curr,
          });

          temp
            .save()
            .then((result) => {
              console.log(result);
              // res.status(200).json({ msg: "successfully submitted" });
            })
            .catch((err) => {
              console.log(err);
              //res.status(500).json({ msg: "error occured" });
            });
        }
      );
    });
    //res.status(200).send(res1.names);
  });
});

function populateDB() {
  /* Country.findOne({ brand: req.body.brand }).then((res1) => {
      res1.names.forEach((element) => {
        var curr = [];
        Product.find({ brand: req.body.brand, countries: element }).then(
          (res2) => {
            res2.forEach((element2) => {
              if (curr.indexOf(element2.faceValue.price) === -1)
                curr.push(element2.faceValue.amount);
            });
            curr = curr.sort(function (a, b) {
              return a - b;
            });
            const temp = new Currency({
              _id: new mongoose.Types.ObjectId(),
              brand: req.body.brand,
              country: element,
              code: res2[0].faceValue.currency,
              price: curr,
            });

            temp
              .save()
              .then((result) => {
                console.log(result);
                // res.status(200).json({ msg: "successfully submitted" });
              })
              .catch((err) => {
                console.log(err);
                //res.status(500).json({ msg: "error occured" });
              });
          }
        );
      });
      //res.status(200).send(res1.names);
    });
     var country = [];
    Product.find().then((res1) => {
      if (res1) {
        res1.forEach((element) => {
          if (
            element.brand === req.body.brand &&
            country.indexOf(element.countries[0]) === -1
          )
            country.push(element.countries[0]);
        });
      }
      const countryy = new Country({
        _id: new mongoose.Types.ObjectId(),
        brand: req.body.brand,
        names: country,
      });

      countryy
        .save()
        .then((result) => {
          console.log(result);
          res.status(200).json({ msg: "successfully submitted" });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ msg: "error occured" });
        });
      // res.status(200).send(country);
    });*/
  /*console.log("found");
    console.log(req.body);
    Product.findOne({
      brand: req.body.brand,
      amount: req.body.amount,
      currency: req.body.currency,
    }).then((BuyerExist) => {
      if (BuyerExist) {
        console.log("found");
        console.log(BuyerExist.countries);
        console.log(BuyerExist);
        res.status(200).send(BuyerExist.countries);
      } else {
        console.log("buyer not exist");
      }
    });*/
}

const PORT = 8000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
