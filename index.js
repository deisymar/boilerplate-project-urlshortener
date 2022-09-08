require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const urlparser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env['URI_BD'], { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const urlSchema = new Schema({url: 'string'});
/*const urlSchema = new mongoose.Schema({urlOriginal:{type: String, required: true },
short: Number});*/
const Url = mongoose.model('Url',urlSchema);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  //console.log(req.body);
  const urlBody = req.body.url;

  const someDns = dns.lookup(urlparser.parse(urlBody).hostname, (error, data) => {
    //console.log("dns: ", data);
    if(!data){
      res.json({error: "invalid url"});
    }else {
      const urlString = new Url({url: urlBody});
      // Url.create({url: req.body.url}, (err, data) => {
      urlString.save((err, docs) => {
         res.json({
           original_url: docs.url, 
           short_url: docs.id
        });
      });
    }
    //console.log("dnsError:", error);
    //console.log("address", data);
  });
  //console.log("someDns: ", someDns);
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const short_url = req.params.short_url;
  Url.findById(short_url, (err, docs) => {
    if(!docs) {
      res.json({error: "invalid url"});
    }else {
      res.redirect(docs.url);
    }
  })              
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
