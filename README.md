# Portfolio managment by Chintan Sudani

## Project Description

This project is about get portfolio from transaction csv file.

## Table of Contents

- [Installation](#installation)
- [Outcome](#outcome)
- [Assumption](#assumption)
- [Usages](#usages)

## Installation

Step 1) Clone this project (https://github.com/csudani7/propine-assignment-by-chintan-sudani)
Step 2) Install node_modules using `npm install`
Step 3) Create .env file as per .env.example and paste your cryptocompare API key
Step 4) Run project using `npm run start`

## Outcome

- check `portfolio.png` to know outcome of project

Outcome Entity:
- quantity : How much Quantity you have?
- invested_usd_price : How much you invested as per USD?
- current_usd_price : How much you earned/loss as per current USD Price?

Note: Above list is derived based on token

## Assumption

1) Cryptocompare have API Limit so, transaction data is trucated by first 50 transaction
2) Cryptocompare API params doesn't have date range, hence we can not reduce compilation time
3) Used csv-parse to parse CSV file
4) Used green/red Color to show portfolio value based on P&L

## Usages

1) API
  - endpoint: `/pricehistorical?fsym=${fsym}&tsyms=${tsyms}&ts=${time}`
    - fysm : Used Crypto (required)
    - tsyms : Conversion currency (required)
    - ts : required time to fetch price (required)