import * as mongoose from 'mongoose';

const Schema = mongoose.Schema;

const headersSchema = new Schema(
  {
    aggregationNum: { type: Number, default: 0 },
    timeoutNum: { type: Number, default: 0 },
    status: { type: String, default: 'INITIAL' }
  },
  {
    _id: false,
    strict: false
  }
);

const AggregationSchema = new Schema(
  {
    correlationId: { type: String, unique: true },
    headers: { type: headersSchema, default: {} },
    body: [Schema.Types.Mixed],
    expireAt: { type: Date, expires: 0 }
  },
  {
    timestamps: {},
    strict: false
  }
);

export default mongoose.model('Aggregation', AggregationSchema);
