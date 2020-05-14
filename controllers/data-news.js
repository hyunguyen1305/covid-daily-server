const cheerio = require("cheerio");
const fetch = require("node-fetch");
const moment = require("moment");
const {
    isoCountries
} = require('../utils/countryList')



exports.getDataNews = (req, res, next) => {
    fetch("https://www.worldometers.info/coronavirus/")
        .then((res) => {
            return res.text();
        })
        .then((res) => {
            let $ = cheerio.load(res);
            return (dataNews = extractDataNews($));
        })
        .then((data) => res.json(data));
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
        countryCode: null,
    };
    const listCT = Object.keys(isoCountries);
    listCT.map((ele) => {
        if (listText.includes(ele)) {
            nation = {
                name: ele,
                countryCode: isoCountries[ele],
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
        countryCode: nation.countryCode,
        sourceList: sourceTemp,
    };
};