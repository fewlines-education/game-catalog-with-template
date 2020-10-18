import { Collection, ObjectId } from "mongodb";

export type UserInput = {
  sub: string;
  email: string;
  cart?: {
    products: {
      slug: string;
      image: string;
      quantity: number;
      address?: {
        name: string;
        street: string;
        city: string;
        postal_code: string;
      };
      payment?: {
        method: "paypal" | "card";
      };
    }[];
  };
};

export type User = UserInput & {
  _id: ObjectId;
};

export default class UserModel {
  private collection: Collection;
  constructor(collection: Collection) {
    this.collection = collection;
  }

  findById(id: string): Promise<User | null> {
    return this.collection.findOne({
      _id: id,
    });
  }

  findBySubg(sub: string): Promise<User | null> {
    return this.collection.findOne({
      sub: sub,
    });
  }

  async findOrCreate(payload: UserInput): Promise<void> {
    const user = await this.collection.findOne({ sub: payload.sub });
    if (!user) {
      const dbResponse = await this.collection.insertOne(payload);
      const { ops } = dbResponse;
      return ops[0];
    } else {
      return user;
    }
  }

  async updateOne(id: ObjectId, payload: Partial<UserInput>): Promise<void> {
    this.collection.updateOne({ _id: id }, payload);
  }

  async remove(id: ObjectId): Promise<void> {
    await this.collection.deleteOne({ _id: id });
  }
}
