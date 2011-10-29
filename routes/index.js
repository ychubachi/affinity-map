/*
 * GET home page.
 */

exports.index = function(req, res){
  if(!req.session.user) {
    console.log('need login');
    res.redirect('/login');
    return;
  }
  res.render('index', { title: 'Express' });
};

exports.login = function(req, res) {
  res.render('login', { title: 'Login' });
};

