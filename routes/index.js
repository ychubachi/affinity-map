/*
 * GET home page.
 */

// OpenID
var openid = require('openid');
var url = require('url');
var querystring = require('querystring');

var extensions = [new openid.UserInterface(), 
                  new openid.SimpleRegistration(
                      {
                        "nickname" : true, 
                        "email" : true, 
                        "fullname" : true,
                        "dob" : true, 
                        "gender" : true, 
                        "postcode" : true,
                        "country" : true, 
                        "language" : true, 
                        "timezone" : true
                      }),
                  new openid.AttributeExchange(
                      {
                        "http://axschema.org/contact/email": "required",
                        "http://axschema.org/namePerson/friendly": "required",
                        "http://axschema.org/namePerson": "required"
                      })];

var relyingParty = new openid.RelyingParty(
    'http://kirin.chubachi.net:1234/verify',	// Verification URL (yours)
    null, 		// Realm (optional, specifies realm for OpenID authentication)
    false, 		// Use stateless verification
    false, 		// Strict mode
    extensions);	// List of extensions to enable and include

// Routes
exports.index = function(req, res){
  if(!req.session.user) {
    res.redirect('/login');
    return;
  }

  res.render('index', { title: 'Affinity Map', user_name: req.session.user.email});
};

exports.login = function(req, res) {
  res.render('login', { title: 'Login' });
};

// 認証開始．openidのidentifierを受け取り，認証用URLに遷移させる．
// mixiの場合，base64デコードでエラーが出る
exports.authenticate = function(req, res) {
  // User supplied identifier
  var parsedUrl = url.parse(req.url);
  var query = querystring.parse(parsedUrl.query);
  var identifier = query.openid_identifier;

  // Resolve identifier, associate, and build authentication URL
  relyingParty.authenticate(identifier, false, function(error, authUrl) {
    if(error) {
      res.writeHead(200);
      res.end('Authentication failed: ' + error);
    } else if (!authUrl) {
      res.writeHead(200);
      res.end('Authentication failed');
    } else {
      res.writeHead(302, { Location: authUrl }); // 認証画面にリダイレクトする
      res.end();
    }
  });
};

// 認証URLから遷移してくる画面
exports.verify = function(req, res) {
  // Verify identity assertion
  // NOTE: Passing just the URL is also possible
  relyingParty.verifyAssertion(req, function(error, result) {
    if(error || !result.authenticated) {
      console.log(error);
      res.render('error', {
	title: 'authenticate error',
	error: error
      });
      return;
    }
    // 認証成功
    var parsedUrl = url.parse(req.url, true);
    var query = parsedUrl.query;
    var claimed_id = query['openid.claimed_id'];
    var email = result.email;

    req.session.user = {
      claimed_id: claimed_id,
      email: email
    };
    res.redirect('/');
  });
};
