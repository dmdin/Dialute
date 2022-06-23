import 'reflect-metadata';
import type { Db } from './types';
import { Collection, MongoClient, ServerApiVersion } from 'mongodb';

export interface MongoInit {
  uri: string;
  dbName: string;
  collectionName: string;
}

// const getCollection = (target: Object, propertyKey: string, descriptor: PropertyDescriptor) =>  {
//   console.log('decorator:', target)
//
//   const childMethod = descriptor.value;
//   console.log('out this', this)
//
//   descriptor.value = (...args: any) => {
//
//     // await (this as Mongo).client.connect()
//     // @ts-ignore
//     console.log('connect this', this.uri)
//     console.log('descriptor this', descriptor.this)
//     console.log('connect target', target)
//     const res = childMethod.apply(this, args);
//     // await (this as Mongo).client.close()
//     console.log('disconnect')
//     return res;
//   }
//
//   return descriptor;
// }

export class Mongo implements MongoInit, Db {
  uri: string;
  dbName: string;
  collectionName: string;

  client: MongoClient;

  constructor(params: MongoInit) {
    Object.assign(this, params);

    // const uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.qij1g.mongodb.net/?retryWrites=true&w=majority`;
    this.client = new MongoClient(this.uri, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });
  }

  async getCollection(): Promise<Collection> {
    const { client, dbName, collectionName } = this;
    await client.connect();
    return this.client.db(dbName).collection(collectionName);
  }

  async closeClient() {
    const { client } = this;
    await client.close();
  }

  async getById(id: string): Promise<any> {
    let res = {};

    try {
      const collection = await this.getCollection();
      res = await collection.findOne({ _id: id });
      await this.closeClient();
    } catch (e) {
      console.log('Error happened during DB request:', e);
    }

    return res;
  }

  async setById(id: string, data: any): Promise<any> {
    try {
      const collection = await this.getCollection();
      await collection.updateOne({ _id: id }, { $set: data }, { upsert: true });
      return true;

    } catch (e) {
      console.log('Error happened during DB request:', e);
    }
    return true;
  }
}
