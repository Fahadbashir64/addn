import express, { response } from "express";
const app = express();
import cors from "cors";
import fetch from "node-fetch";
import mongoose from "mongoose";
import Buyer from "./models/Buyer.js";
import Product from "./models/Product.js";
import Country from "./models/Country.js";
import Currency from "./models/Currency.js";
import Transaction from "./models/Transaction.js";
import Order from "./models/Order.js";
import Discount from "./models/Discount.js";
import CurrencyRate from "./models/CurrencyRate.js";
import Promo from "./models/Promo.js";
import Bitjem from "./models/BitjemCard.js";
import Brand from "./models/Brand.js";
import CC from "currency-converter-lt";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import axios from 'axios';
import CryptoUser from "./models/CryptoUser.js";
//
import fs from 'fs/promises';
import { error } from "console";

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
  Discount.findOne({ name: req.body.code }).then((res2) => {
    if (res2) {
      if (res2.type === 'Fixed Cost' && req.body.currency !== 'USD') {
        const fromCurrency = 'USD';
        const toCurrency = req.body.currency;
        const amount = res2.rate;
      
        convertCurrency(fromCurrency, toCurrency, amount, (convertedAmount) => {
          let discount = Math.floor((convertedAmount / req.body.total) * 100);
          res.status(200).send({ discount: discount, type: res2.type });
        });
      } else if (res2.type === 'Fixed Cost' && req.body.currency === 'USD') {
        let discount = Math.floor((res2.rate / req.body.total) * 100);
        res.status(200).send({ discount: discount, rate: res2.rate, type: res2.type });
      } else {
        res.status(200).send({ discount: res2.rate, type: res2.type });
      }
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
  const pageSize = 100;
  const pageIndex = 0;

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

app.get("/getExchangeRates", (req, res) => {
  const username = 'NEXOZ-LLC-SANDBOX';
  const password = '7e68311d-4008-4913-888e-de15491b4db5';

  const authHeaderValue = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  fetch("https://api.bamboocardportal.com/api/integration/v1.0/exchange-rates", {
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

app.post("/convertRate", (req, res) => {
  let currencyConverter = new CC({
    from: req.body.from,
    to: req.body.to,
    amount: req.body.amount,
  });
  currencyConverter.convert().then((response) => {
    res.send({ cur: response });
  });
});

// app.post("/convert", (req, res) => {
//   CurrencyRate.findOne({
//     currencyCode: req.body.to,
//   }).then((res1) => {
//     let amount;
//     if (req.body.from == 'USD') {
//       amount = req.body.amount / res1.value;
//       res.send({ cur: amount });
//     } else {
//       CurrencyRate.findOne({
//         currencyCode: req.body.from,
//       }).then((res2) => {
//         amount = (res2.value/res1.value) * req.body.amount;
//         res.send({ cur: amount });
//       });
//     }
//   });
// });

function convertCurrency(fromCurrency, toCurrency, amount, callback) {
  CurrencyRate.findOne({ currencyCode: toCurrency }).then((toCurrencyRate) => {
    if (fromCurrency === 'USD') {
      const convertedAmount = amount / toCurrencyRate.value;
      callback(convertedAmount);
    } else {
      CurrencyRate.findOne({ currencyCode: fromCurrency }).then((fromCurrencyRate) => {
        const convertedAmount = (fromCurrencyRate.value / toCurrencyRate.value) * amount;
        callback(convertedAmount);
      });
    }
  });
}

// Modify your API route to use the function
app.post("/convert", (req, res) => {
  const fromCurrency = req.body.from;
  const toCurrency = req.body.to;
  const amount = req.body.amount;

  convertCurrency(fromCurrency, toCurrency, amount, (convertedAmount) => {
    res.send({ cur: convertedAmount });
  });
});

const baseUrl = 'https://staging-api.bitjem-services.com';
let authToken = null;

// Create a function to obtain or refresh the token
function getToken() {
  let email = 'Ceo@ozchest.com';
  try {
    if (authToken) {
      // Check if the token exists and is still valid (within 24 hours)
      const tokenExpirationDate = new Date(authToken.expiresAt);
      if (tokenExpirationDate > new Date()) {
        return Promise.resolve(authToken.token);
      }
    }

    return CryptoUser.findOne({
      email: email,
    }).then((user) => {
      if (user) {
        const loginData = {
          emailAddress: email,
          password: user.password,
        };

        return fetch(`${baseUrl}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        }).then((loginResponse) => {
          if (!loginResponse.ok) {
            throw new Error('Login Failed');
          }

          return loginResponse.json();
        }).then((loginResponseData) => {
          // Store the token and its expiration time
          authToken = {
            token: loginResponseData.authToken,
            expiresAt: new Date(Date.now() + 23 * 60 * 60 * 1000), // 24 hours in milliseconds
          };

          return Promise.resolve(authToken.token);
        });
      } else {
        console.log("User does not exist");
        return;
      }
    });
  } catch (error) {
    return Promise.reject(new Error('Login Failed: ' + error.message));
  }
}


// Create a gift card using the stored token
async function createGiftCard(authToken, data) {
  try {
    if (!authToken) {
      // If the token doesn't exist, obtain one
      authToken = { token: await getToken() };
    }

    const giftCardData = {
      currency: data.code,
      value: data.amount,
    };

    // Define the headers with the stored token and Content-Type
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };

    const giftCardResponse = await fetch(`${baseUrl}/api/GiftCards`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(giftCardData),
    });

    if (!giftCardResponse.ok) {
      throw new Error('Create Gift Card Failed');
    }

    const giftCardResponseData = await giftCardResponse.json();

    console.log('Gift Card Created Successfully');
    return giftCardResponseData;
  } catch (error) {
    console.error('Create Gift Card Failed: ' + error.message);
  }
}

async function orderBitJem(product, email, key) {
  try {
    const authToken = await getToken();

    if (authToken) {
      const response = await createGiftCard(authToken, product);

      const total = await new Promise((resolve, reject) => {
        convertCurrency(product.currency, 'EUR', product.amount, (convertedTotal) => {
          resolve(convertedTotal);
        });
      });

      let result2 = await Buyer.findOne({ key: key });

      if (result2) {

        console.log('Success checkout');

        const frommail = "ozchest.com@gmail.com";
        const password = "qxppqcfgtdfismel";
        const tomail = email;

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: frommail,
            pass: password,
          },
        });

        const mailOptions = {
          from: frommail,
          to: tomail,
          subject: "Gift Card From Ozchest",
          text: `
            Code: ${response.code}
            Crypto Value: ${response.cryptoValue}
            Currency: ${response.currency}
            Pin: ${response.pin}`,
        };

        const mailResult = await transporter.sendMail(mailOptions);

        if (mailResult) {
          const bitjemOrder = new Bitjem({
            _id: new mongoose.Types.ObjectId(),
            cardId: response.id,
            code: response.code,
            pin: response.pin,
            date: getCurrentDate(),
            status: 'complete',
            currency: response.currency,
            cryptoValue: response.cryptoValue,
            orderBy: email,
          });

          await bitjemOrder.save();

          console.log("Mail success");
          // Return the deducted total for this product
          return Number(total);
        }
      }
    }
  } catch (error) {
    console.error('Order failed:', error.message);
    throw error;
  }
}

app.post("/order", async (req, res) => {
  if (Array.isArray(req.body.bitjemProducts) && req.body.bitjemProducts.length > 0) {
    try {
      const promises = req.body.bitjemProducts.map(product => {
        return orderBitJem(product, req.body.email, req.body.user);
      });

      const deductedAmounts = await Promise.all(promises);

      // Sum up the deducted amounts
      const totalDeducted = deductedAmounts.reduce((acc, amount) => acc + amount, 0);

      // Update the user's balance in the database with the total deducted amount
      const result2 = await Buyer.findOneAndUpdate(
        { key: req.body.user },
        { $inc: { balance: -totalDeducted } },
        { new: true }
      );

      if (result2) {
        const order = new Order({
          _id: new mongoose.Types.ObjectId(),
          user: req.body.email,
          price: totalDeducted,
          brand: 'Bitjem',
          date: getCurrentDate(),
          status: 'complete',
        });

        await order.save();

        const transaction = new Transaction({
          _id: new mongoose.Types.ObjectId(),
          user: req.body.email,
          type: 'Order',
          balanceBefore: Number(result2.balance),
          balanceAfter: Number(result2.balance - totalDeducted),
          status: 'Complete',
          date: getCurrentDate(),
          totalAmount: Number(totalDeducted),
        });

        await transaction.save();
      }
      res.status(200).send('Success');
    } catch (error) {
      res.status(400).send(error.message);
    }
  } else {
    const username = 'NEXOZ-LLC-SANDBOX';
    const password = '7e68311d-4008-4913-888e-de15491b4db5';
    const authHeaderValue = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    fetch("https://api.bamboocardportal.com/api/integration/v1.0/accounts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeaderValue,
        },
      }).then((response) => response.json())
      .then((accounts) => {
        if (accounts) {
        const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const data = {
          RequestId: uniqueId,
          AccountId: accounts[0]?.id,
          Products: req.body.products
        };
        
        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        };
        fetch('https://api.bamboocardportal.com/api/integration/v1.0/orders/checkout', requestOptions).then((res3) => res3.json())
        .then((data1) => {
          if (data1) {
            Buyer.findOne({ key: req.body.user }).then((result2) => {
              if(result2) {
              Buyer.findOneAndUpdate(
                { key: req.body.user },
                { balance: result2.balance - req.body.total }
              ).then((result) => {
                if (result) {
                  console.log('succes checkout');
                  const frommail = "ozchest.com@gmail.com";
                  const password = "qxppqcfgtdfismel";
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
                    text: JSON.stringify(data1.body),
                  };
                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.log("mail failed");
                      res.status(400).send("Error sending mail");
                    } else {
                      console.log("mail success");
                      res.send(data1);
                    }
                  });
                  const order = new Order({
                    _id: new mongoose.Types.ObjectId(),
                    user: req.body.email,
                    price: req.body.total,
                    brand: req.body.products[0]?.brand,
                    date: getCurrentDate(),
                    status: 'complete'
                  });
                  order.save()
                  .then((result3) => {
                    const transaction = new Transaction({
                      _id: new mongoose.Types.ObjectId(),
                      user: req.body.email,
                      type: 'Order',
                      balanceBefore: Number(result2.balance),
                      balanceAfter: Number(result.balance),
                      status: 'Complete',
                      date: getCurrentDate(),
                      totalAmount: Number(req.body.total)
                    });
                    transaction.save()
                    .then((result4) => {
                        res.status(200).send({balance: Number(result.balance)});
                    })
                    .catch((saveError) => {
                      console.error("Error saving transaction:", saveError);
                      res.status(400).send("Error saving transaction");
                    });  
                  })
                  .catch((saveError) => {
                    console.error("Error saving order:", saveError);
                    res.status(400).send("Error saving order");
                  }); 
                }
              });
            }
            });
          }
        });
        } 
      }).catch(error => {
        console.log(error)
        res.status(400).send("Error");
      })
  }
});

async function checkCardExistence(card) {
  try {
    const res2 = await Bitjem.findOne({
      cardId: card.id,
      code: card.code
    });

    return res2 || null;
  } catch (error) {
    throw error;
  }
}

app.post("/verifyBitjemOrder", async (req, res) => {
  const { cards } = req.body;

  const response = await Promise.all(cards.map(async card => {
    try {
      const exists = await checkCardExistence(card);

      if (exists) {
        return { id: card.id, success: true };
      } else {
        return { id: card.id, success: false, errorMessage: 'CARD NOT FOUND' };
      }
    } catch (error) {
      return { id: card.id, success: false, errorMessage: 'INTERNAL SERVER ERROR' };
    }
  }));

  res.status(200).json({ cards: response });
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
            const transaction = new Transaction({
              _id: new mongoose.Types.ObjectId(),
              user: req.body.order_id,
              type: 'Topup',
              balanceBefore: Number(res2.balance),
              balanceAfter: Number(result.balance),
              status: 'Complete',
              date: getCurrentDate(),
              totalAmount: Number(req.body.payment_amount)
            });
            transaction.save()
            .then((result) => {
            })
            .catch((saveError) => {
              console.error("Error saving transaction:", saveError);
              res.status(400).send("Error saving transaction");
            });  
          });
        }
      });
    });
  }
  res.json({ status: 200 });
});

function getCurrentDate() {
  const currentDate = new Date();

  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const year = currentDate.getFullYear();

  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
}

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

app.post("/getStock", (req, res) => {
  Product.findOne({
    productId: req.body.productId,
  }).then((res2) => {
    res.send(res2);
  });
});

function updateStock() {
  const username = 'NEXOZ-LLC-SANDBOX';
  const password = '7e68311d-4008-4913-888e-de15491b4db5';
  const pageSize = 100;
  const pageIndex = 0;

  const authHeaderValue = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  fetch("https://api.bamboocardportal.com/api/integration/v1.0/catalog", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeaderValue,
      }
    })
  .then(response => response.json())
  .then(data => {
    if (Array.isArray(data.brands)) {
      // Iterate through each object in the data
      data.brands.forEach(object => {
        if (object.products && Array.isArray(object.products)) {
          object.products.forEach(product => {
            Product.findOneAndUpdate(
              { productId: product.id },
              { count: product.count,
                price: product.price,
                dateModified: new Date()},
            ).then((result) => {
              // res.status(200).send();
            }).catch((error) => {
                // res.status(400).send(error);
            });
          });
        }
      });

      // Update the data in MongoDB
      for (const brand of data.brands) {
        Brand.updateOne({ internalId: brand.internalId }, { $set: brand }, { upsert: true });
      }
    } else {
      console.log('Data does not contain products array.');
    }
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
}

async function createStock() {
  console.log('12');

  const filePath = 'brands.json'; // Replace 'data.json' with your JSON file path
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(data);
      if (Array.isArray(jsonData)) {
        // Iterate through each object in the JSON data
        let currentDate = new Date();
        console.log('date',currentDate);
        jsonData.forEach(object => {
          if (object.products && Array.isArray(object.products)) {
            object.products.forEach(product => {
              const temp = new Product({
                _id: new mongoose.Types.ObjectId(),
                productId: product.id,
                count: product.count,
                price: product.price,
                minFaceValue: product.minFaceValue,
                maxFaceValue: product.maxFaceValue,
                DateModified: currentDate
              });

              temp
                .save()
                .then((result) => {
                  // res.status(200).json({ msg: "successfully submitted" });
                })
                .catch((err) => {
                  console.log(err);
                  // res.status(500).json({ msg: "error occurred" });
                });
            });
          }
        });
      } else {
        console.log('Data does not contain products array.');
      }
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
    }
}

async function createCurrencyRates() {
  console.log('12');

  const filePath = 'currency.json'; // Replace 'data.json' with your JSON file path
    try {
      const data = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(data);
        jsonData.rates.forEach(object => {
          const temp = new CurrencyRate({
            _id: new mongoose.Types.ObjectId(),
            currencyCode: object.currencyCode,
            value: object.value,
            dateModified: new Date()
          });

          temp
            .save()
            .then((result) => {
              // res.status(200).json({ msg: "successfully submitted" });
            })
            .catch((err) => {
              console.log(err);
              // res.status(500).json({ msg: "error occurred" });
            });
        });
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
    }
}

function updateCurrencyRates() {
  const username = 'NEXOZ-LLC-SANDBOX';
  const password = '7e68311d-4008-4913-888e-de15491b4db5';

  const authHeaderValue = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  fetch("https://api.bamboocardportal.com/api/integration/v1.0/exchange-rates", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeaderValue,
      }
    })
  .then(response => response.json())
  .then(data => {
    if (data) {
      data.rates?.forEach(currency => {
        CurrencyRate.findOneAndUpdate(
          { currencyCode: currency.currencyCode },
          { value: currency.value,
            dateModified: new Date()},
        ).then((result) => {
          // res.status(200).send();
        }).catch((error) => {
            // res.status(400).send(error);
        });
      });
    }
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
}

app.post("/convertCrypto", async (req, res) => {
  try {
    let cryptoSymbol = req.body.currency;
    const amount = Number(req.body.amount);

    if (!cryptoSymbol || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid cryptoSymbol or amount' });
    }

    let cryptoToUsdRate;

    // Handle USDT as a special case
    if (cryptoSymbol.toLowerCase() === 'usdt') {
      cryptoToUsdRate = 1.0;
    } else {
      if (cryptoSymbol.toLowerCase() === 'btc') {
        cryptoSymbol = 'bitcoin';
      }
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: cryptoSymbol,
          vs_currencies: 'usd',
        },
      });

      const cryptoData = response.data[cryptoSymbol];
      if (!cryptoData || !cryptoData.usd) {
        return res.status(404).json({ error: 'Cryptocurrency not found or exchange rate not available' });
      }

      cryptoToUsdRate = cryptoData.usd;
    }

    const amountInUSD = amount * cryptoToUsdRate;

    CurrencyRate.findOne({
      currencyCode: req.body.to,
    }).then((res1) => {
      let amount;
      amount = amountInUSD / res1.value;
      res.send({ cur: amount });
    });
  } catch (error) {
    console.error('Error fetching conversion rate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const interval = 3600000;

const intervalId = setInterval(updateCurrencyRates, interval);

const interval2 = 3600000;

const intervalId2 = setInterval(updateStock, interval2);

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
