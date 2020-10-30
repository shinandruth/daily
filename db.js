const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./daily.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the daily database.');
});

db.run('CREATE TABLE metrics (roomId TEXT, timestamp INTEGER,'
  + 'videoRecvBitsPerSecond REAL, videoSendBitsPerSecond REAL'
  + 'videoRecvPacketLoss REAL, videoSendPacketLoss REAL)', function (err) {
    if (err) {
      return console.log(err.message);
    }
  });

// let sql = 'INSERT INTO langs (name) VALUES (1);';
let sql = `SELECT * FROM langs`

// db.each("SELECT * FROM langs", function(err, row) {
//   console.log("User id : "+row.name, row.dt);
// })

// output the INSERT statement
// console.log(sql);

// db.run(sql,  function(err) {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log(`Rows inserted ${this.changes}`);
// });


// db.serialize(() => {
//   db.each(`SELECT * FROM `, (err, row) => {
//     if (err) {
//       console.error(err.message);
//     }
//     console.log(row.id + "\t" + row.name);
//   });
// });



db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Close the database connection.');
});