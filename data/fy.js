const co = require("co")
const Promise = require("bluebird")
const request = Promise.promisifyAll(require("request"))
const md5 = require("md5");

const yd = "http://fanyi.youdao.com/translate_o?smartresult=dict&smartresult=rule&sessionFrom="

function Fanyi(word)
{
    return co(function*()
    {
        if (!word) return word
        let headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
            "Referer": "http://fanyi.youdao.com/",
        }
        let sign = md5("fanyideskweb" + word + "1506129723011" + "rY0D^0'nM0}g5Mm1z%1G4")
        let form = {
            i: word,
            from: "AUTO",
            to: "AUTO",
            client: "fanyideskweb",
            salt: "1506129723011",
            sign,
            version: "2.1",
        }
        let res = yield request.postAsync(yd, { form, headers })
        let data = JSON.parse(res.body)
        var s = ""
        if (!data.errorCode)
        {
            for ( let row of data.translateResult )
            {
                for ( let item of row )
                {
                    s += item.tgt
                }
                s += "\n"
            }
        }
        return s
    })
}

module.exports = Fanyi