require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express();
const mongo = require('mongodb');
const mongoose = require('mongoose');
const uri = process.env['DB_URI'];
const validUrl = require('valid-url');
const shortId = require('shortid');
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use('/public', express.static(`${process.cwd()}/public`));
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log("Connected to db"));
const SCHEMA = mongoose.Schema;
const URLSCHEMA = new SCHEMA ({
  originalUrl: String,
  shortUrl: String
});
const URL = mongoose.model("URL", URLSCHEMA);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
console.log(req.body.url);
let url = req.body.url;
const shortUrl = shortId.generate();
try {
if(!validUrl.isHttpUri(url) && !validUrl.isHttpsUri(url)) {
  res.json({ error: 'invalid url' });
}
else {
  let exist = await URL.findOne({originalUrl: url})

  if (exist) {
    res.json({
      original_url: url,
      short_url: exist.shortUrl
    })}
  else {
    newUrl = new URL ({
      originalUrl: url,
      shortUrl: shortUrl
    })
    await newUrl.save()
    res.json({
      original_url: url,
      short_url: newUrl.shortUrl
    }) 
  }}}
  catch(err) {
    console.error(err);
  }
})
app.get ('/api/shorturl/:shortUrl?', async (req, res)=> {
  try {
    console.log(req.params.shortUrl);
    url = await URL.findOne({shortUrl: req.params.shortUrl});
    if (url) {
      return res.redirect(url.originalUrl);
    }}
    catch(err){
      console.error(err);
    }}) 



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
