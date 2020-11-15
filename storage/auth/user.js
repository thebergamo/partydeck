const mongoose = require('mongoose');
const compare = require('./compare-hash');
const createHash = require('./create-hash');
const generateJwt = require('./generate-jwt');

const Schema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Anonymous',
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

Schema.methods.basicLogin = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) throw new Error();
  await compare(password, user.password);
  const token = await generateJwt(user._id);
  return token;
};

Schema.methods.register = async function (email, pw, name = undefined) {
  const password = await createHash(pw);
  const user = await this.create({ email, password, name });
  const token = await generateJwt(user._id);
  return token;
};

const model = mongoose.model('User', Schema);

module.exports = model;