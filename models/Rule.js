const mongoose = require('mongoose');

const RuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  funnelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Funnel' },
  action: {
    type: String,
    enum: ['disable', 'increase_ranking', 'decrease_ranking', 'sort_ascending', 'sort_descending'],
    required: true
  },
  sortParameter: {
    type: String,
    enum: ['clicks', 'conversions', 'revenue'],
    required: function() {
      return this.action === 'sort_ascending' || this.action === 'sort_descending';
    }
  },
  rankingValue: {
    type: Number,
    required: function() {
      return this.action === 'increase_ranking' || this.action === 'decrease_ranking';
    }
  },
  funnelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Funnel'
  },
  conditions: [{
    parameter: {
      type: String,
      enum: ['clicks', 'conversions', 'revenue'],
      required: true
    },
    operator: {
      type: String,
      enum: ['<', '>', '=', 'between'],
      required: true
    },
    value1: {
      type: Number,
      required: true
    },
    value2: {
      type: Number,
      required: function() {
        return this.operator === 'between';
      }
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Rule', RuleSchema);