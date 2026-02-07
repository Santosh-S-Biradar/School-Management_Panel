const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../config/db');
const { signToken } = require('../utils/token');
const { sendEmail } = require('../utils/email');
const userModel = require('../models/userModel');

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await userModel.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (role && user.role_name !== role) {
      return res.status(403).json({ message: 'Role mismatch' });
    }
    if (user.status !== 'active') return res.status(403).json({ message: 'Account inactive' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user.id, role: user.role_name, name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role_name } });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role_name });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.findByEmail(email);
    if (!user) return res.status(200).json({ message: 'If account exists, reset link sent' });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query('INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [
      user.id,
      tokenHash,
      expiresAt
    ]);

    const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: `<p>Click to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    });

    res.json({ message: 'If account exists, reset link sent' });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, email, password } = req.body;
    const user = await userModel.findByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const rows = await query(
      `SELECT * FROM password_resets
       WHERE user_id = ? AND token_hash = ? AND used_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [user.id, tokenHash]
    );

    if (!rows[0]) return res.status(400).json({ message: 'Invalid or expired token' });

    const passwordHash = await bcrypt.hash(password, 10);
    await userModel.updatePassword(user.id, passwordHash);
    await query('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [rows[0].id]);

    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, me, forgotPassword, resetPassword };
