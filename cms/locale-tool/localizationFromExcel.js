const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");

const enJSON = require("../src/i18n/en/common.json");
const viJSON = require("../src/i18n/vi/common.json");
const jaJSON = require("../src/i18n/ja/common.json");


const enExcelJSON = require("../src/i18n/en/common.json");
const viExcelJSON = require("../src/i18n/vi/common.json");
const jaExcelJSON = require("../src/i18n/ja/common.json");

const sheetName = "LocalizeFeCDP";

// Take from URL of spreadsheet
const spreadsheetId = "1nSOACYyDHljflUSOqBXpi63Z0996EtI8EJE6ZhqIokg";

const langKeys = ["key", "en", "vi", "ja"];

const auth = new google.auth.GoogleAuth({
  keyFile: "./locale-tool/credentials.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const _getLocaleKeys = () => {
  const getUniqueKeys = (obj) => Object.keys(obj);

  const enKeys = getUniqueKeys(enJSON);
  const viKeys = getUniqueKeys(viJSON);

  // Merge all keys into a single array and remove duplicates
  return _.union(
    enKeys,
    viKeys,
  );
};

module.exports.convertLocalizeFromExcel = async function convertLocalizeFromExcel() {
  // Create  client instance for auth
  const client = await auth.getClient();
  // Instance of Google Sheets API
  const googleSheets = google.sheets({ version: "v4", auth: client });

  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: sheetName,
  });

  const lang = getRows.data.values[0];
  const data = getRows.data.values.slice(1);
  const localization = {};

  // Iterate over the data array
  data.forEach((row) => {
    const key = row[0]; // Get the key from index 0
    if (row.length < lang.length) {
      // eslint-disable-next-line
      row = _.concat(row, _.fill(Array(lang.length - row.length), ""));
    }
    row.forEach((value, index) => {
      if (index > 0) {
        const language = lang[index]; // Get the language key from the keys array
        if (!localization[language]) {
          localization[language] = {}; // Create an object for the language if it doesn't exist
        }
        localization[language][key] = value; // Assign the value to the corresponding language key and key
      }
    });
  });

  _.forOwn(localization, (objectData, country) => {
    const filePath = path.join(
      __dirname,
      "..",
      `src/i18n/${country}`,
      `common.json`
    );
    console.log(filePath);

    // Convert object data to JSON string
    const jsonString = JSON.stringify(objectData, null, 2);

    // Write the JSON string to the corresponding JSON file
    // eslint-disable-next-line
    fs.writeFile(filePath, jsonString, (err) => {
      if (err) {
        // eslint-disable-next-line
        console.log(`Error writing JSON file for ${country}: ${err}`);
      } else {
        // eslint-disable-next-line
        console.log(`JSON file for ${country} has been successfully updated.`);
      }
    });
  });
};

module.exports.writeLocalizeToExcelFromJson = async function convertLocalizeFromExcel() {
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const localeKeys = _getLocaleKeys();

  const data = [
    langKeys,
    ..._.map(localeKeys, (key) => {
      const arr = [key];
      arr.push(_.get(enJSON, `${key}`) || key);
      arr.push(_.get(viJSON, `${key}`) || key);
      return arr;
    }),
  ];

  try {
    googleSheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range: sheetName,
      valueInputOption: "RAW",
      resource: {
        values: data,
      },
    });

    // eslint-disable-next-line
    console.log(
      `JSON data for ${sheetName} has been successfully written to the spreadsheet.`
    );
  } catch (err) {
    // eslint-disable-next-line
    console.log("Error writing data to Excel:", err);
  }
};

module.exports.validate = function validate() {
  const localeKeys = _getLocaleKeys();

  const data1 = [
    langKeys,
    ..._.map(localeKeys, (key) => {
      const arr = [key];
      arr.push(_.get(enExcelJSON, `${key}`, ""));
      arr.push(_.get(viExcelJSON, `${key}`, ""));
    }),
  ].sort();

  const data2 = [
    langKeys,
    ..._.map(localeKeys, (key) => {
      const arr = [key];
      arr.push(_.get(enJSON, `${key}`, ""));
      arr.push(_.get(viJSON, `${key}`, ""));
      return arr;
    }),
  ].sort();

  

  /* eslint-disable*/
  if (_.isEqual(data1, data2)) {
    console.log("Excel JSON data is matched with original JSON data");
  } else {
    console.log(
      "ERROR: Excel JSON data is not matched with original JSON data"
    );
    console.log(
      "Excel JSON data different from original JSON data:",
      _.differenceWith(data1, data2, _.isEqual)
    );
    console.log(
      "Original JSON data different from Excel JSON data:",
      _.differenceWith(data2, data1, _.isEqual)
    );
  }
  /* eslint-disable*/
};
