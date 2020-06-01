// import UserController from '../controller/Users';

const express = require('express');

const router = express.Router();

/* GET users listing. */
router.post('/', (req, res) => {
  res.json({ data: 'validated' });
});

// router.put('/', (req, res) => {
//   const { email, phone, password } = req.body;
//   return UserController.createUserWithDefaultPassword()
//     .then(result => res.status(200).json(result))
//     .catch(error => res.status(400).json({ error }));
// });


module.exports = router;
