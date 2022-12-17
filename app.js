const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'the home page of an app' });
});

//STARTING THE SERVER
app.listen(8000, () => {
  console.log('app running at port 8000');
});
