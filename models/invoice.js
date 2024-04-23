const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: Number,
    unique: true,
    required: true
  },
  invoiceName: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending'],
    default: 'pending'
  }
});

// invoiceSchema.plugin(autoIncrement.plugin, {
//     model: 'Invoice',
//     field: 'invoiceNumber',
//     startAt: 1
// });
const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
