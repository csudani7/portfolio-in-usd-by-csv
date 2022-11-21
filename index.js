"use strict";
/* global import */
global.fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config();
const fs = require("fs");
const { parse } = require("csv-parse");
const cc = require("cryptocompare");

/* local import */
const CSV_TXN_FILE = "./data/transactions.csv";

// set api key
cc.setApiKey(process.env.API_KEY);

// to get prices in USD based on timestamp
const fetchPriceAsPerTimeStamp = async (rowData, convertedDate) => {
  try {
    const { USD } = await cc.priceHistorical(
      rowData[2],
      ["USD"],
      new Date(convertedDate)
    );
    if (!USD) {
      // if not get expected price of USD
      return {};
    }
    return {
      transaction_type: rowData[1],
      crypto_type: rowData[2],
      amount: +rowData[3],
      invested_usd_price: +rowData[3] * USD,
    };
  } catch (error) {
    console.error(error);
    throw Error("Fetch currency price is failed", error);
  }
};

function getPortfolio(currentValue, investedValue) {
  const portfolio =
    currentValue > investedValue
      ? `\x1b[32m + ${currentValue - investedValue} USD`
      : `\x1b[31m - ${currentValue - investedValue} USD`;
  console.log(
    "####################################################################################################"
  );
  console.log(
    `Invested: ${investedValue} USD | `,
    `Current: ${currentValue} USD | `,
    `P&L: ${portfolio}\x1b[0m`
  );
  console.log(
    "####################################################################################################"
  );
}

// to get summary of portfolio
function portfolioSummary(derivedValue) {
  Promise.all(
    Object.keys(derivedValue).map(async (crypto_type) => {
      try {
        const { USD } = await cc.priceHistorical(
          crypto_type,
          ["USD"],
          new Date() // as per today rate for count portfolio
        );
        if (!USD) {
          // if not get expected price of USD
          return {};
        }
        return { crypto_type: crypto_type, current_usd_price: USD };
      } catch (error) {
        console.error(error);
        throw Error("Get portfolio summary failed", error);
      }
    })
  ).then((response) => {
    response.forEach((item) => {
      derivedValue[item.crypto_type].current_usd_price =
        item.current_usd_price * derivedValue[item.crypto_type].quantity;
    });
    console.table(derivedValue);
    let sumOfInvestedUsd = 0,
      sumOfCurrentUsd = 0;
    for (const key in derivedValue) {
      sumOfInvestedUsd += derivedValue[key].invested_usd_price;
      sumOfCurrentUsd += derivedValue[key].current_usd_price;
    }
    getPortfolio(sumOfCurrentUsd, sumOfInvestedUsd);
  });
}

function app() {
  let arr = [];
  fs.createReadStream(CSV_TXN_FILE)
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", (response) => {
      arr.push(
        fetchPriceAsPerTimeStamp(
          response,
          new Date(0).setUTCSeconds(+response[0]) // convert in date
        )
      );
    })
    .on("end", () => {
      Promise.all(arr).then((response) => {
        let derivedValue = response.reduce((acc, curr) => {
          if (acc[curr.crypto_type]) {
            acc[curr.crypto_type].quantity +=
              curr.transaction_type === "DEPOSIT" ? curr.amount : -curr.amount;
            acc[curr.crypto_type].invested_usd_price +=
              curr.transaction_type === "DEPOSIT"
                ? curr.invested_usd_price
                : -curr.invested_usd_price;
            return acc;
          } else {
            acc[curr.crypto_type] = {
              quantity:
                curr.transaction_type === "DEPOSIT"
                  ? curr.amount
                  : -curr.amount,
              invested_usd_price:
                curr.transaction_type === "DEPOSIT"
                  ? curr.invested_usd_price
                  : -curr.invested_usd_price,
            };
            return acc;
          }
        }, {});
        portfolioSummary(derivedValue);
      });
    })
    .on("error", (error) => {
      console.error(error);
      throw Error("File parsing has issue!!");
    });
}

// initiated application
app();
