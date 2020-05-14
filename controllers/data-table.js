const fetch = require("node-fetch");
const cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");


const {
    isoCountries
} = require("../utils/countryList");

function getNationCode(name) {
    const nationCode = isoCountries[name];
    return nationCode;
}

const getTotalData = async () => {
    let mydata = await fetch("https://en.wikipedia.org/wiki/COVID-19_pandemic")
        .then((res) => res.text())
        .then((res) => {
            let $ = cheerio.load(res);
            cheerioTableparser($);
            var data = $("#thetable").parsetable(true, true, true);
            const nation = data[1].slice(2, data[1].length - 2);
            const totalCasesList = data[2].slice(2, data[2].length - 2);
            const totalDeathList = data[3].slice(2, data[3].length - 2);
            const totalRecoveredList = data[4].slice(2, data[4].length - 2);
            let mydata = [];
            nation.map((ele, index) => {
                const regex = / *\[[^\]]*]/g;
                const nation = ele.replace(regex, "");
                const nationCode = getNationCode(nation);
                mydata.push({
                    nationName: nation,
                    nationCode,
                    totalCasesList: parseInt(totalCasesList[index].replace(/,/g, "")),
                    totalDeathList: parseInt(totalDeathList[index].replace(/,/g, "")),
                    totalRecoveredList: parseInt(totalRecoveredList[index].replace(/,/g, "")),
                });
            });
            return mydata;
        });
    return mydata;
};

const get7DaysUpdateData_Death = async () => {
    let mydata = await fetch(
            "https://en.wikipedia.org/wiki/COVID-19_pandemic_deaths"
        )
        .then((res) => res.text())
        .then((res) => {
            let $ = cheerio.load(res);
            cheerioTableparser($);
            var data = $(".mw-parser-output")
                .find("#May_2020")
                .parent()
                .next()
                .next()
                .parsetable(true, true, true);

            const nation = data[0].slice(6, data[0].length);
            const day1 = data[data.length - 1].slice(6, data[1].length);
            const day2 = data[data.length - 2].slice(6, data[2].length);
            const day3 = data[data.length - 3].slice(6, data[3].length);
            const day4 = data[data.length - 4].slice(6, data[4].length);
            const day5 = data[data.length - 5].slice(6, data[5].length);
            const day6 = data[data.length - 6].slice(6, data[6].length);
            const day7 = data[data.length - 7].slice(6, data[7].length);

            let mydata = [];
            nation.map((ele, index) => {
                const nationCode = getNationCode(ele);
                mydata.push({
                    nationName: ele,
                    nationCode,
                    deathCases: parseInt(day1[index].replace(/,/g, "")) -
                        parseInt(day2[index].replace(/,/g, "")),
                    death1: parseInt(day1[index].replace(/,/g, "")),
                    death2: parseInt(day2[index].replace(/,/g, "")),
                    death3: parseInt(day3[index].replace(/,/g, "")),
                    death4: parseInt(day4[index].replace(/,/g, "")),
                    death5: parseInt(day5[index].replace(/,/g, "")),
                    death6: parseInt(day6[index].replace(/,/g, "")),
                    death7: parseInt(day7[index].replace(/,/g, "")),
                });
            });
            return mydata;
        });
    return mydata;
};
const get7DaysUpdateData_New = async () => {
    const mydata = await fetch(
            "https://en.wikipedia.org/wiki/COVID-19_pandemic_cases"
        )
        .then((res) => res.text())
        .then((res) => {
            let $ = cheerio.load(res);
            cheerioTableparser($);
            var data = $(".mw-parser-output")
                .find("#May_2020")
                .parent()
                .next()
                .next()
                .parsetable(true, true, true);

            const nation = data[0].slice(6, data[0].length);
            const day1 = data[data.length - 1].slice(6, data[1].length);
            const day2 = data[data.length - 2].slice(6, data[2].length);
            const day3 = data[data.length - 3].slice(6, data[3].length);
            const day4 = data[data.length - 4].slice(6, data[4].length);
            const day5 = data[data.length - 5].slice(6, data[5].length);
            const day6 = data[data.length - 6].slice(6, data[6].length);
            const day7 = data[data.length - 7].slice(6, data[7].length);

            let mydata = [];
            nation.map((ele, index) => {
                const nationCode = getNationCode(ele);
                mydata.push({
                    nationName: ele,
                    nationCode,
                    newCases: parseInt(day1[index].replace(/,/g, "")) -
                        parseInt(day2[index].replace(/,/g, "")),
                    new1: parseInt(day1[index].replace(/,/g, "")),
                    new2: parseInt(day2[index].replace(/,/g, "")),
                    new3: parseInt(day3[index].replace(/,/g, "")),
                    new4: parseInt(day4[index].replace(/,/g, "")),
                    new5: parseInt(day5[index].replace(/,/g, "")),
                    new6: parseInt(day6[index].replace(/,/g, "")),
                    new7: parseInt(day7[index].replace(/,/g, "")),
                });
            });
            return mydata;
        });
    // console.log(mydata)
    return mydata;
};

exports.getDataTable = async (req, res, next) => {
    const total = await getTotalData();
    const death7 = await get7DaysUpdateData_Death();
    const new7 = await get7DaysUpdateData_New();
    let abcd = [];
    total.map((total) => {
        let list = total;
        let get7Day = new7.map((new7) => {
            let combine = new7;
            death7.map((death) => {
                if (death.nationCode === new7.nationCode) {
                    combine = {
                        ...combine,
                        ...death,
                    };
                }
            });
            return combine;
        });
        get7Day.map((ele) => {
            if (total.nationCode === ele.nationCode) {
                list = {
                    ...list,
                    ...ele,
                };
            }
        });
        abcd.push(list);
    });
    res.json(abcd)
};