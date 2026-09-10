const validator = require('validator');
const ContactMessage = require('../models/ContactMessage');
const { sendContactNotification } = require('../services/emailService');

const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message, _hp_field } = req.body;

    // Honeypot anti-spam check: if bot fills this hidden input, return fake success
    if (_hp_field && _hp_field.trim() !== '') {
      return res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon.'
      });
    }

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are all required.'
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const contact = await ContactMessage.create({
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 150),
      subject: subject.trim().slice(0, 200),
      message: message.trim().slice(0, 5000),
      ip: req.ip || '',
      userAgent: req.headers['user-agent'] || ''
    });

    // Send email notification to portfolio owner via nodemailer asynchronously
    sendContactNotification({
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      createdAt: contact.createdAt
    }).catch((err) => {
      console.error('[Email Notification Error]:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
      data: {
        id: contact._id,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// --- Admin Inbox Management ---

const getAllMessages = async (req, res, next) => {
  try {
    const { status, search, page, limit } = req.query;
    const query = {};

    if (status === 'unread') {
      query.isRead = false;
      query.isArchived = false;
    } else if (status === 'read') {
      query.isRead = true;
      query.isArchived = false;
    } else if (status === 'archived') {
      query.isArchived = true;
    } else {
      query.isArchived = false;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);

    const total = await ContactMessage.countDocuments(query);
    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const unreadCount = await ContactMessage.countDocuments({ isRead: false, isArchived: false });

    res.status(200).json({
      success: true,
      data: messages,
      unreadCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

const markReadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    message.isRead = isRead !== undefined ? Boolean(isRead) : true;
    await message.save();

    res.status(200).json({ success: true, message: 'Message updated.', data: message });
  } catch (error) {
    next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await ContactMessage.updateMany({ isRead: false }, { $set: { isRead: true } });
    res.status(200).json({ success: true, message: 'All messages marked as read.' });
  } catch (error) {
    next(error);
  }
};

const toggleArchive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    message.isArchived = !message.isArchived;
    await message.save();

    res.status(200).json({
      success: true,
      message: message.isArchived ? 'Message archived.' : 'Message unarchived.',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    res.status(200).json({ success: true, message: 'Message deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContact,
  getAllMessages,
  markReadStatus,
  markAllRead,
  toggleArchive,
  deleteMessage
};
