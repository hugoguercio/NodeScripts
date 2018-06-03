//'use strict';
/*  VARIABLES   */
var https = require('https');
var tryjson = require('tryjson');
var pg = require('pg');
var url = require('url');

var page = 1;


/*  CONNECT TO DATABASE */
var conString = "pg://postgres:postgres@localhost:5432/github";
var client = new pg.Client(conString);
client.connect();

/*  FUNCTIONS   */
function isEmptyObject(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}



/*  API CALL PARAMETERS */
var options = {
    host: 'api.github.com',
    path: '/users/gnome/repos?page='+page+'&per_page=1',
    headers: {'User-Agent': 'request'}
};

/*  HTTP REQUEST */
https.get(options, function (res) {
        
    var json = '';
    res.on('data', function (chunk) {
        json += chunk;
    });

    //quando terminar de pegar os chunks tenta fazer o parse
    res.on('end', function () {
        if (res.statusCode === 200) {
            var data = tryjson.parse(json);

            console.log(data ? data.html_url : 'Error parsing JSON!');

            console.log('abaixo chamada da função');
            console.log(isEmptyObject(data));

            
            console.log('For each repo ins the repositories list...');
            for(var i in data) {
                console.log("Saving Repo "+i+": "+ data[i].name);
                client.query("INSERT INTO public.t_repository ("+
                "json, id, name, login, owner_id, private, description, fork, created_at, updated_at, pushed_at, size, stargazers_count, watchers_count, language, has_issues, has_projects, has_downloads, has_wiki, has_pages, forks_count, open_issues_count, forks, open_issues, watchers)"+
                " VALUES ($1,    $2,     $3,     $4,     $5,     $6,     $7,     $8,     $9,     $10,    $11,    $12,    $13,    $14,    $15,    $16,    $17,    $18,    $19,    $20,    $21,    $22,    $23,    $24, $25)",
                 [data[i], data[i].id,  data[i].name,   data[i].login,  data[i].owner.id,   data[i].private,    data[i].description,    data[i].fork,   data[i].created_at,     data[i].updated_at,     data[i].pushed_at,  data[i].size,   data[i].stargazers_count,   data[i].watchers_count,     data[i].language,   data[i].has_issues,     data[i].has_projects,   data[i].has_downloads,  data[i].has_wiki,   data[i].has_pages,  data[i].forks_count,    data[i].open_issues_count,  data[i].forks,  data[i].open_issues,    data[i].watchers]);
                    
            }


        } else {
            console.log('Status:'+res.statusCode);
        }
    });

}).on('error', function (err) {
      console.log('Error:', err);
});