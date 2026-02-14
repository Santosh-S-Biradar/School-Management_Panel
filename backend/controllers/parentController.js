const parentModel = require('../models/parentModel');
const attendanceModel = require('../models/attendanceModel');
const markModel = require('../models/markModel');
const feeModel = require('../models/feeModel');
const notificationModel = require('../models/notificationModel');

const dashboard = async (req, res, next) => {
  try {
    const parent = await parentModel.getParentByUserId(req.user.id);
    const children = parent ? await parentModel.getParentChildren(parent.id) : [];
    res.json({ parent, children });
  } catch (err) {
    next(err);
  }
};

const children = async (req, res, next) => {
  try {
    const parent = await parentModel.getParentByUserId(req.user.id);
    res.json(await parentModel.getParentChildren(parent.id));
  } catch (err) {
    next(err);
  }
};

const profile = async (req, res, next) => {
  try {
    const parent = await parentModel.getParentByUserId(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent profile not found' });
    }

    const children = await parentModel.getParentChildren(parent.id);
    res.json({ ...parent, children });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const parent = await parentModel.getParentByUserId(req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent profile not found' });
    }

    const userPayload = {
      name: req.body.name,
      phone: req.body.phone
    };
    Object.keys(userPayload).forEach((key) => userPayload[key] === undefined && delete userPayload[key]);
    if (Object.keys(userPayload).length) {
      await parentModel.updateParentUser(req.user.id, userPayload);
    }

    if (req.body.occupation !== undefined) {
      await parentModel.updateParent(parent.id, { occupation: req.body.occupation });
    }

    if (!Object.keys(userPayload).length && req.body.occupation === undefined) {
      return res.status(400).json({ message: 'No profile fields to update' });
    }

    res.json({ message: 'Profile updated' });
  } catch (err) {
    next(err);
  }
};
const attendance = async (req, res, next) => {
  try {
    res.json(await attendanceModel.getAttendanceByStudent(req.params.studentId));
  } catch (err) {
    next(err);
  }
};

const performance = async (req, res, next) => {
  try {
    res.json(await markModel.getMarksByStudent(req.params.studentId));
  } catch (err) {
    next(err);
  }
};

const fees = async (req, res, next) => {
  try {
    res.json(await feeModel.listFees(req.params.studentId));
  } catch (err) {
    next(err);
  }
};

const notifications = async (req, res, next) => {
  try {
    res.json(await notificationModel.listNotificationsForUser(req.user.id, req.user.role));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  dashboard,
  profile,
  updateProfile,
  children,
  attendance,
  performance,
  fees,
  notifications
};


