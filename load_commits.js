var pg = require('pg')
var gs = require('github-scraper');
var loadCommits = require('./loadCommits.js');


/*  CONNECT TO DATABASE */
var config ={
  user: 'postgres',
  database: 'github',
  password: 'postgre',
  port: 5432,
  max: 10, //max connections to database
  idleTimeoutMillis: 30000, //idle before closing
}
var pool = new pg.Pool(config);

pool.connect()
  .then(client => {
    return client.query('select concat(o.login,\'/\',r.name) conca, r.commits_count from t_repository r inner join t_organization o on r.owner_id = o.id where r."Serial" in (170)')//< $1', [8])
      .then(res => {        
        for (var i in res.rows){
          for (var x = 1; x < (res.rows[i].commits_count/100 )+1; x++){                        
            loadCommits(x,res.rows[i].conca);
          }
        }        
        client.release();
      })
      .catch(e => {
        client.release()
        console.log(err.stack)
      })
  })
