// HANDLERS

exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      users: 'this route is not implemented yet',
    },
  });
};

exports.getUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      users: 'this route is not implemented yet',
    },
  });
};

//POST A User ROUTE
exports.createUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      users: 'this route is not implemented yet',
    },
  });
};

//PATCHINT A User
exports.updateUser = (req, res) => {
  res.send('patch request goes here');
};

//DELETE A User
exports.deleteUser = (req, res) => {
  res.send('delete request goes here');
};
