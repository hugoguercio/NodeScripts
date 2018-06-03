var pg = require('pg')
var gs = require('github-scraper');
var url = '' //Project name

/*  CONNECT TO DATABASE */
var config ={
  user: 'postgres',
  database: 'github',
  password: 'postgres',
  port: 5432,
  max: 10, //max connections to database
  idleTimeoutMillis: 30000, //idle before closing
}
var pool = new pg.Pool(config);

var conString = "pg://postgres:postgres@localhost:5432/github";
var clientUp = new pg.Client(conString);
clientUp.connect();


pool.connect()
  .then(client => {
    return client.query('select concat(o.login,\'/\',r.name) conca, r.commits_count from t_repository r inner join t_organization o on r.owner_id = o.id where r.commits_count is null')//< $1', [8])
      .then(res => {
        
        for (var i in res.rows){
          gs(url+res.rows[i].conca, update);
        }        
        client.release();
      })
      .catch(e => {
        client.release()
        console.log(err.stack)
      })
  })


function update (err, data){
	try {	 
		clientUp.query("UPDATE public.t_repository "+
		"SET forks_count = $1, "+
		" stargazers_count = $2, "+
		" watchers_count = $3, "+
		" commits_count = $4, "+
		" branches_count = $5, "+
		" releases_count = $6 "+
		"where name ='"+data.url.replace("https://github.com/eclipse/", '').replace("https://github.com/GNOME/", '')+"'",
		[data.forks, data.stars, data.watchers, data.commits, data.branches, data.releases]);
	} catch (err) {
	  console.error(err);
	}
}