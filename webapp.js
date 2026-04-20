var http = require('http');
var url = require('url');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var connectionString = "mongodb+srv://dbuser1:db123@cluster0.dzwfkfe.mongodb.net/?appName=Cluster0";


var port = process.env.PORT || 8080;


var server = http.createServer(function(req, res) {
    var urlObj = url.parse(req.url, true);

    res.writeHead(200, {'Content-Type': 'text/html'});

    if (req.url == '/') {
        res.end(
            "<form method='get' action='/process'>" +
            "Enter search: <input type='text' name='search'><br><br>" +
            "<input type='radio' name='type' value='company'> Company Name<br>" +
            "<input type='radio' name='type' value='ticker'> Ticker Symbol<br><br>" +
            "<input type='submit'>" +
            "</form>"
        );
    }

    else if (urlObj.pathname == '/process') {
    var search = urlObj.query.search;
    var type = urlObj.query.type;

    MongoClient.connect(connectionString, function(err, account) {
        if (err) {
            console.log("Connection err: " + err);
            return;
        }

        var dbObj = account.db("Stock");
        var collection = dbObj.collection('PublicCompanies');

        var theQuery;
        if (type == 'company') {
            theQuery = { companyName: new RegExp(search, 'i') };
            //to help do partial search!
        } else {
            theQuery = { ticker:  new RegExp(search, 'i') };
        }

        collection.find(theQuery).toArray(function(err, items) {
            if (err) {
                console.log("Error: " + err);
            } else {
                var output = "<h2>Results for: " + search + "</h2>";
                for (i = 0; i < items.length; i++) {
                    console.log(items[i].companyName + " | " + items[i].ticker + " | $" + items[i].latestPrice);
                    output += items[i].companyName + " | " + items[i].ticker + " | $" + items[i].latestPrice + "<br>";
                }
                if (items.length == 0) {
                    output += "No results found.";
                }
                account.close();
                res.end(output);
            }
        }); 

    });
}

    else {
        res.end("Page not found");
    }
});
server.listen(port);
console.log("Server running at http://localhost:" + port);