const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

// console.log(process.env);

//CONNECTING THE HOSTED DATABASE
const DB = process.env.DATABASE_HOSTED.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('db connected successfully');
  });

//CONNECTING TO THE LOCAL DATABASE
// mongoose
//   .connect(process.env.DATABASE_LOCAL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//   })
//   .then((con) => {
//     console.log(con.connections);
//     console.log('db connected successfully LOCALLY');
//   });

//STARTING THE SERVER
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log('app running at port 8000');
});
