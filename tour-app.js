/*jshint esversion: 6 */

let express = require('express');
let fortune = require('./lib/fortune.js');
const formidable = require('formidable');
const credentials = require('./credentials.js');

let app = express();

app.use(require('cookie-parser')(credentials.cookieSecret));

let handlebars = require('express3-handlebars').create({
  defaultLayout:'main',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next){
  res.locals.showTests = app.get('env') !== 'production' &&
      req.query.test === '1';
  next();
});

app.disable('x-powered-by');

app.get('/', function(req, res){
  res.render('home');
});

app.get('/about', function(req, res){
    res.render('about', {
      fortune: fortune.getFortune(),
      pageTestScript: '/qa/tests-about.js'
    });
});

app.get('/tours/hood-river', function(req, res){
 res.render('tours/hood-river');
});

app.get('/tours/oregon-coast', function(req, res){
  res.render('tours/oregon-coast');
});

app.get('/tours/request-group-rate', function(req, res){
 res.render('tours/request-group-rate');
});

app.get('/headers', (req, res) => {
  res.set('Content-type', 'text/plain');
  let s = '';
  for(let name in req.headers) s += name + ': ' + req.headers[name] + '\n';
  res.send(s);
})

app.use(require('body-parser')());

app.get('/newsletter', function(req, res){
  res.render('newsletter', {csrf: 'CSRF token goes here'})
});

app.post('/process', function(req, res) {
  console.log('Form (from querystring): ' + req.query.form);
  console.log('CSRF token (from hidden form field): ' + req.body._csrf);
  console.log('Name (from visible form field): ' + req.body.name);
  console.log('Email (from visible form field): ' + req.body.email);
  res.redirect(303, '/thank-you');
});

app.get('/contest/vacation-photo',function(req,res){
  const now = new Date();
  res.render('contest/vacation-photo',{
    year: now.getFullYear(), month: now.getMonth()
  });
});

app.post('/contest/vacation-photo/:year/:month', function(req, res){
  const form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files){
    if(err) return res.redirect(303, '/error');
    console.log('received fields:');
    console.log(fields);
    console.log('received files:');
    console.log(files);
    res.redirect(303, '/thank-you');
  });
});

// custom 404 page
app.use(function(req, res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') +
    '; press Ctrl-C to terminate.');
});
