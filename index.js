const rp = require('request-promise');
const base_url = '';
const project_name = ''
const branch = ''
const target_url = base_url + '/browse/' + project_name + '/' + branch + '/'
const session_key = ''
const session_value = ''
const session_domain = ''

var tough = require('tough-cookie');

let cookie = new tough.Cookie({
    key: session_key,
    value: session_value,
    domain: session_domain,
    httpOnly: true,
    maxAge: 31536000
});

var cookiejar = rp.jar();
cookiejar.setCookie(cookie, base_url);

var options = {
    uri: target_url,
    jar: cookiejar 
};

rp(options)
  .then(function(html){
    //success!
    console.log(html);
  })
  .catch(function(err){
    //handle error
  });