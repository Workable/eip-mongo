import { Store as StoreInterface } from 'eip';
import Aggregation from './models/aggregation';
import * as mongoose from 'mongoose';

declare type schema = { headers: any, body: any[] }

export default class Store extends StoreInterface {
  private mongoOptions = {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true
  };

  constructor(public expireAt: number = 60 * 60) {
    super();
  }

  getExpireAt() {
    return Date.now() + this.expireAt * 1000;
  }

  async append(correlationId: string, headers: any, body: any) {
    const headersSet = this.getHeadersSet(headers);
    const aggregation = await Aggregation.findOneAndUpdate({ correlationId }, {
      $set: headersSet,
      $setOnInsert: {
        expireAt: this.getExpireAt()
      },
      $push: { body: body }
    }, this.mongoOptions);
    return aggregation.toObject();
  }

  async getById(correlationId: string) {
    const aggregation = await Aggregation.findOne({ correlationId });
    return aggregation && aggregation.toObject();
  }

  async setStatus(correlationId: string, status: string) {
    const $set = {
      'headers.status': status
    };
    const $inc = {
      'headers.aggregationNum': 1
    };

    if (status === Store.STATUS.TIMEOUT) {
      $inc['headers.timeoutNum'] = 1;
    }
    const aggregation = await Aggregation.findOneAndUpdate({ correlationId, 'headers.status': { $ne: Store.STATUS.COMPLETED } }, {
      $set,
      $inc
    }, { ...this.mongoOptions, upsert: false });
    return aggregation && aggregation.toObject();
  }

  private getHeadersSet(headers) {
    return Object.keys(headers)
      .reduce((set, key) => {
        set[`headers.${key}`] = headers[key];
        return set;
      }, {});
  }
}

