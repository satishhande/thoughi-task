const express = require('express');
const  data =  require('./data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();
const PORT = 3000;

app.get('/records', (req, res) => {
    res.json(data)
})

app.get('/api/managed-records', async (req, res) => {
    const response = await fetch('http://localhost:3000/records');
    const data = await response.json();
    const pageCount = Math.ceil(data.length / 10);
    let page = parseInt(req.query.page);
    if (!page) { page = 1;}
    if (page > pageCount) {
        page = pageCount
    }
    let finalData = data.slice(page * 10 - 10, page * 10);
    let nextPage = page == pageCount ? null : page + 1;
    let previousPage = page == 1 ? null : page - 1;
    let closedCount = {};
    let openCount = {};
    let ids = [];
    finalData.forEach((element, index)=> {
        ids.push(element.id);
        if(element.disposition == 'closed'){
            closedCount['closedCount'] = closedCount['closedCount'] == undefined ? 1 : closedCount['closedCount'] + 1;
            closedCount[element.color] = closedCount[element.color] == undefined ? 1 : closedCount[element.color] + 1;
        }else if(element.disposition == 'open'){
            openCount['openCount'] = openCount['openCount'] == undefined ? 1 : openCount['openCount'] + 1;
            openCount[element.color] = openCount[element.color] == undefined ? 1 : openCount[element.color] + 1;
        }
    })
    res.json({
        "NextPage": nextPage,
        "PreviousPage": previousPage,
        "page": page,
        "pageCount": pageCount,
        "ids": ids,
        "ClosedCount": closedCount,
        "OpenCount": openCount,
        "data": finalData
    });
})

app.listen(PORT, function(err){
	if (err) console.log(err);
	console.log("Server listening on PORT", PORT);
});

