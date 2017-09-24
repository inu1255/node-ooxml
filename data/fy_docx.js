const fy = require("./fy");
const co = require("co");
const fs = require("fs");

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

function dfs(data, fn)
{
    if (!data) return
    if (data instanceof Array)
    {
        for (var key = 0; key < data.length; key++)
        {
            dfs(data[key], fn)
        }
        return
    }
    parent = fn(data)
    if (typeof data === "object")
    {
        for (let key in data)
        {
            dfs(data[key], fn)
        }
    }
}

co(function*()
{
    let data = readJson("data/docx.json")
    let p = []
    dfs(data, (item) => {
        p.push(item)
    })
    for ( let item of p )
    {
        if (item.desc)
        {
            item.desc_cn = yield fy(item.desc)
        }
    }
    writeJson("data/docx.cn.json", data, 4)
})

