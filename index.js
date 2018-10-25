const rp = require('request-promise');
const $ = require('cheerio');
const fs = require('fs');
const del = require('del');

const base_url = '';
const project_name = ''
const branch = ''
const start_path = `/browse/~br=${branch}/${project_name}/${branch}`
const session_key = ''
const session_value = ''
const session_domain = ''
const output_dir = './output';

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

if (!fs.existsSync(output_dir)){
	fs.mkdirSync(output_dir);
}else{
	del.sync([`${output_dir}/*`])
}

var project_dir = `${output_dir}/${project_name}`;
fs.mkdirSync(project_dir);
var branch_dir = `${project_dir}/${branch}`;
fs.mkdirSync(branch_dir);

loadDir(start_path);

function loadDir(path){
	var options = {
		uri: base_url+path,
		jar: cookiejar 
	};

	rp(options)
	.then(function(html){

		//iterate files
		if($('.browse-tree:not(.browse-empty, .browse-directory)', html).length){
			$('.browse-tree:not(.browse-empty, .browse-directory)', html).each(function (i, elem) {
				var revision = $(elem).find('.table-row-node-revision>span').attr('data-csid');
				var urlPath = $(elem).find('.table-row-node-name>a').attr('href');

				getFileRaw(urlPath,revision);
			});
		}

	  	//iterate directories
	  	if($('.browse-directory:not(.browse-empty)>.table-row-node-name>a', html).length){
	  		$('.browse-directory:not(.browse-empty)>.table-row-node-name>a', html).each(function (i, elem) {
	  			var urlPath = $(elem).attr('href');
	  			
	  			var dirPath = output_dir + urlPath.substring(urlPath.indexOf("/",9));
	  			fs.mkdirSync(dirPath);

	  			loadDir(urlPath);
	  			console.log('D: ' + dirPath)
	  		});
	  	}
	  })
	.catch(function(err){
		throw err;
	});
}

function getFileRaw(path,revision){
	var options = {
		uri: base_url+path.replace(`~br=${branch}`,`~raw,r=${revision}`),
		jar: cookiejar,
		method: "GET",
		encoding: null
	};

	rp(options)
	.then(function(body,data){
		var filePath = output_dir + path.substring(path.indexOf("/",9));

		console.log(options.uri)


		fs.writeFile(filePath, body, function(err) {
			if(err) {
				throw err;
			}
			console.log('F: ' + filePath)
		}); 
	})
	.catch(function(err){
		throw err;
	});	
}
