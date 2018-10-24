const rp = require('request-promise');
const $ = require('cheerio');
const base_url = 'http://';
const project_name = ''
const branch = 'trunk'
const start_path = '/browse/~br=' + branch + '/' + project_name + '/' + branch
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

loadDir(start_path);

function loadDir(path){
	console.log(path)

	var options = {
		uri: base_url+path,
		jar: cookiejar 
	};

	rp(options)
	.then(function(html){

		//iterate files
		if($('.browse-tree:not(.browse-empty, .browse-directory)', html).length){
	  		$('.browse-tree:not(.browse-empty, .browse-directory)', html).each(function (i, elem) {
	  			revision = $(elem).find('.table-row-node-revision>span').attr('data-csid')
	  			getFileRaw($(elem).find('.table-row-node-name>a').attr('href'),revision);
	  		});
	  	}

	  	//iterate directories
	  	if($('.browse-directory:not(.browse-empty)>.table-row-node-name>a', html).length){
	  		$('.browse-directory:not(.browse-empty)>.table-row-node-name>a', html).each(function (i, elem) {
	  			loadDir($(elem).attr('href'));
	  		});
	  	}
	  })
	.catch(function(err){
	    console.log(err)
	});
}

function getFileRaw(path,revision){
	console.log(path)

	var options = {
		uri: base_url+path.replace('~br='+branch,'~raw,r='+revision),
		jar: cookiejar 
	};

	rp(options)
	.then(function(html){return html;})
	.catch(function(err){
		console.log(options.uri)
	});	
}
