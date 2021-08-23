require("dotenv").config();
const axios = require("axios");
const qs = require("querystring");
const crypto = require("crypto");
const fs = require("fs");

function concatenate(requestData) {
  let str = "";
  if (requestData.countryCode) str = str.concat(requestData.countryCode);
  if (requestData.accountId) str = str.concat(requestData.accountId);
  return str;
}

function sign(message) {
  const sign = crypto.createSign("SHA256");

  sign.write(message);
  sign.end();

  const key = fs.readFileSync("privatekey.pem");
  signature_b64 = sign.sign(key, "base64");
  return signature_b64;
}

async function generateJengaBearerToken() {
  let creds = {
    username: process.env.JENGA_USERNAME,
    password: process.env.JENGA_PASSWORD,
  };
  let token;
  try {
    token = await axios({
      url: "https://uat.jengahq.io/identity/v2/token",
      method: "POST",
      headers: {
        common: {
          Authorization: "Basic " + process.env.JENGA_API_KEY,
        },
      },
      data: qs.stringify(creds),
    });
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      // console.log(error.response.status);
      // console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log("Error", error.message);
    }
  }

  if (token) {
    return token.data.access_token;
  }
}

var balanceRequest = {
  countryCode: "KE",
  accountId: process.env.JENGA_ACCOUNT_ID.toString(),
};

const auth = {
  token: "",
  async getToken() {
    if (!this.token) {
      let token = await generateJengaBearerToken();
      this.token = token;
    }
    return this.token;
  },
};

exports.queryAccountBalance = async function () {
  // this works just well
  let bearer = await auth.getToken();
  let balance;
  try {
    balance = await axios({
      url:
        "https://uat.jengahq.io/account-test/v2/accounts/ministatement/KE/" +
        process.env.JENGA_ACCOUNT_ID,
      headers: {
        common: {
          Authorization: "Bearer " + bearer,
          signature: sign(concatenate(balanceRequest)),
        },
      },
    });
  } catch (error) {
    if (error.response) {
      return Promise.reject({ type: "ResponseError", error: error.toJSON() });
    } else if (error.request) {
      return Promise.reject({ type: "RequestError", error: error.toJSON() });
    } else {
      return Promise.reject({ type: "UnknownError", error: error.message });
    }
  }

  return balance;
};
