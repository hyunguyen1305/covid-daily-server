const cheerio = require("cheerio");
const fetch = require("node-fetch");
const moment = require("moment");
const { isoCountries } = require("../utils/countryList");
const cheerioTableparser = require("cheerio-tableparser");

exports.getDataNews = (req, res, next) => {
  fetch("https://www.worldometers.info/coronavirus/")
    .then((res) => {
      return res.text();
    })
    .then((res) => {
      let $ = cheerio.load(res);
      const dataNews = extractDataNews($);
      const dataTable = extractDataTable($);
      const data = {
        dataNews,
        dataTable,
      };
      return data;
    })
    .then((data) => res.json(data));
};

function getNationCode(name) {
  const nationCode = isoCountries[name];
  return nationCode;
}

const extractDataTable = ($) => {
  cheerioTableparser($);
  const data = $("#main_table_countries_today").parsetable(true, true, true);
  const nation = data[1].slice(8, data[1].length - 8);
  const totalCases = data[2].slice(8, data[2].length - 8);
  const newCase = data[3].slice(8, data[3].length - 8);
  const totalDeaths = data[4].slice(8, data[1].length - 8);
  const newDeath = data[5].slice(8, data[1].length - 8);
  const totalRecovered = data[5].slice(8, data[1].length - 8);
  let mydata = [];
  nation.map((ele, index) => {
    let nationCode = null;
    nationCode = getNationCode(ele);
    mydata.push({
      nationName: ele,
      nationCode,
      newCase: parseInt(newCase[index].replace(/,/g, "")),
      totalCases: parseInt(totalCases[index].replace(/,/g, "")),
      totalDeaths: parseInt(totalDeaths[index].replace(/,/g, "")),
      newDeath: parseInt(newDeath[index].replace(/,/g, "")),
      totalRecovered: parseInt(totalRecovered[index].replace(/,/g, "")),
    });
  });
  return mydata;
};

const extractDataNews = ($) => {
  let news7Day = [];
  for (let i = 0; i < 7; i++) {
    let newPost = [];
    var date = moment().subtract(i, "days").format("YYYY-MM-DD");
    $(`#newsdate${date}`)
      .find(".news_post")
      .each((_, ele) => {
        newPost.push($(ele));
      });
    const dataNews = newPost.map((ele) => extract(ele));
    news7Day.push({
      date: date,
      dataNews,
    });
  }
  return news7Day;
};
const extract = ($) => {
  let sourceTemp = [];
  let listText = $.find(".news_li")
    .text()
    .replace(/source|[[\]]/g, "")
    .trim();
  $.find(".source").each((_, ele) => {
    let cheerLoad = cheerio.load(ele);
    sourceTemp.push(cheerLoad("a").attr("href"));
  });
  const regex = /[\d|,|\+]+/g;

  const listNumber = listText.match(regex);
  let cases = {
    newCases: null,
    deathCases: null,
  };
  if (listNumber) {
    listNumber.map((ele) => {
      const i_new_test = listText.indexOf(`${ele} new case`);
      const d_new_test = listText.indexOf(`${ele} new death`);
      if (i_new_test >= 0) {
        cases = {
          ...cases,
          newCases: ele,
        };
      }
      if (d_new_test >= 0) {
        cases = {
          ...cases,
          deathCases: ele,
        };
      }
      return cases;
    });
  }
  let nation = {
    name: null,
    nationCode: null,
  };
  const listCT = Object.keys(isoCountries);
  listCT.map((ele) => {
    if (listText.includes(ele)) {
      nation = {
        name: ele,
        nationCode: isoCountries[ele],
      };
    }
    return nation;
  });
  // console.log(nation);

  return {
    listText,
    newCases: cases.newCases,
    deathCase: cases.deathCases,
    nation: nation.name,
    nationCode: nation.nationCode,
    sourceList: sourceTemp,
  };
};
