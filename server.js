const mongoose = require('mongoose');
const dotenv = require('dotenv');

const unhandledError = (message, err) => {
  console.log(err.name, err.message);
  console.log(`${message} (_　_)。゜zｚＺ Shutting down...`);
  process.exit(1);
};

process.on('unhandledRejection', (err) => {
  unhandledError('unhandled rejection', err);
});

process.on('uncaughtException', (err) => {
  unhandledError('uncaught exception', err);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

////// Connection with local db
// mongoose
//   .connect(process.env.DATABASE_LOCAL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//   })
//   .then(() => console.log('db connection sucessful'));

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('db connection sucessful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app running on port:${port}...`);
});
