var cheerio = require("cheerio");
var axios = require("axios");
var express = require("express");
var mongoose = require("mongoose");


var app = express();
var db = require("./models");

var PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/scrapeDB", { useNewUrlParser: true });

app.get("/scrape", function(req, res) {
    axios.get("https://www.ign.com/").then(function(response) {
        var $ = cheerio.load(response.data);

        $("").each(function(j, element) {
            var result = {};

            result.title = $(this).children("a").text();
            result.link = $(this).childrne("a").attr("href");

            db.Article.create(result).then(function(dbArticle) {
                console.log(dbArticle);
            }).catch(function(err) {
                console.log(err);
            });
        });

        res.send("Scrape Complete");
    });
});

app.get("/articles", function(req, res) {
    db.Article.find({}, function(err, data) {
        res.json(data);
    });
});

app.get("/articles/:id", function(req, res) {
    db.Article.find({_id: mongojs.ObjectId(req.params.id)}).populate("note").then(function(dbArticle){
        res.json(dbArticle);
    }).catch(function(err){{
        res.json(err);
    }});
});

app.post("/articles/:id", function(req, res){
    db.Note.create(req.body).then(function(dbNote){
        return db.Article.findOneAndUpdate({_id: req.params.id }, {new: true});
    }).then(function(dbArticle){
        res.json(dbArticle);
    }).catch(function(err){
        res.json(err);
    });
});

app.listen(PORT, function(){
    console.log("App running on port " + PORT + "!");
});