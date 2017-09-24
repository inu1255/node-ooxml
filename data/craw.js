const cheerio = require("cheerio")
const co = require("co")
const Promise = require("bluebird")
const request = Promise.promisifyAll(require("request"))
const fs = require("fs")

function readJson(filePath)
{
    try {
        var s = fs.readFileSync(filePath, "utf8");
        return JSON.parse(s);
    } catch ( e ) {
        if (e.errno == -2)
        {
            console.log(filePath, "不存在")
            process.exit(0)
        }
        console.log(filePath, e)
    }
    return {}
}

function writeJson(filePath, data, space)
{
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, space), "utf8")
    } catch ( e ) {
        console.log(filePath, e)
    }
}

var cache = {}

function ReadTable(table, $)
{
    return co(function*()
    {
        let label = {}
        let desc = table.children("p").text()
        if (desc)
            label.desc = desc
        let uri = table.find(">p>a").attr("href")
        if (uri)
        {
            let data = yield FetchLabel(uri)
            Object.assign(label, data)
        }
        let attributes = table.find(">.attributes")
        if (attributes.length)
        {
            label.attrs = {}
            for ( let tr of attributes.find(">tbody>tr").toArray() )
            {
                let td = $(tr).find(">td")
                let k = td.eq(0).text()
                label.attrs[k] = yield ReadTable(td.eq(1), $)
            }
        }
        let elements = table.find(">.elements")
        if (elements.length)
        {
            label.elems = {}
            for ( let tr of elements.find(">tbody>tr").toArray() )
            {
                let td = $(tr).find(">td")
                let k = td.eq(0).text()
                label.elems[k] = yield ReadTable(td.eq(1), $)
            }
        }
        return label
    })
}

function FetchLabel(uri)
{
    return co(function*()
    {
        if (cache[uri])
        {
            return {}
        }
        let label = {}
        cache[uri] = label
        let url = "http://www.officeopenxml.com/" + uri
        label.url = url
        console.log("read", url)
        let res = yield request.getAsync(url)
        let $ = cheerio.load(res.body)
        let data = yield ReadTable($("#mainContent"), $)
        Object.assign(label, data)
        return label
    })
}

co(function*()
{
    let label = {}
    label.document = yield FetchLabel("WPdocument.php")
    writeJson("data/docx.json", label, 4)
})
