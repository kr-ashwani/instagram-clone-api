const User = require('../../models/User');
const handleErrors = require('../utils/handleErrors');
const includesObjectId = require('../utils/includesObjectId');

const followUserController = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).exec();
    const selfUser = await User.findOne({ email: req.userInfo.email }).exec();

    if (!(user && selfUser))
      return res.status(403).json('user is not registered.');

    if (user.email === selfUser.email)
      return res.status(403).json('You can follow others but not yourselves.');

    if (includesObjectId(selfUser.following, user._id))
      return res.status(403).json(`You already follow ${username}.`);

    await User.findOneAndUpdate(
      { email: req.userInfo.email },
      { $push: { following: user._id } }
    ).exec();

    await User.findOneAndUpdate(
      { username },
      { $push: { followers: selfUser._id } }
    ).exec();

    return res.status(200).json(`You followed ${username}.`);
  } catch (err) {
    const message = handleErrors(err);
    res.status(400).json({ message });
  }
};

const unFollowUserController = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).exec();
    const selfUser = await User.findOne({ email: req.userInfo.email }).exec();

    if (!(user && selfUser))
      return res.status(403).json('user is not registered.');

    if (user.email === selfUser.email)
      return res.status(403).json('You can follow or unfollow yourselves.');

    if (!includesObjectId(selfUser.following, user._id))
      return res.status(403).json(`You donot follow ${username}.`);

    await User.findOneAndUpdate(
      { email: req.userInfo.email },
      { $pull: { following: user._id } }
    ).exec();

    await User.findOneAndUpdate(
      { username },
      { $pull: { followers: selfUser._id } }
    ).exec();

    return res.status(200).json(`You unfollowed ${username}.`);
  } catch (err) {
    const message = handleErrors(err);
    res.status(400).json({ message });
  }
};

module.exports = { followUserController, unFollowUserController };
