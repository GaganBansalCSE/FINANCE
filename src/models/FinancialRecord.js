/**
 * FinancialRecord model.
 *
 * Represents a single financial entry (income or expense).
 * Supports soft deletion via the `isDeleted` flag so records
 * can be recovered and audit trails are preserved.
 */

const mongoose = require('mongoose');

const financialRecordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },

    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Type is required (income or expense)'],
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [100, 'Category must be at most 100 characters'],
    },

    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes must be at most 500 characters'],
      default: '',
    },

    paymentMethod: {
      type: String,
      enum: ['Credit Card', 'Debit Card', 'UPI', 'NEFT', 'CASH'],
      default: 'Debit Card',
    },

    // Reference to the admin/analyst user who created this record
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Soft delete flag – deleted records are hidden from normal queries
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Only surface non-deleted records by default
financialRecordSchema.index({ isDeleted: 1, date: -1 });
financialRecordSchema.index({ category: 1, type: 1 });

module.exports = mongoose.model('FinancialRecord', financialRecordSchema);
