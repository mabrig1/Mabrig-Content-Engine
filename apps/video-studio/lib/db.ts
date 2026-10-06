import { MongoClient, type Db, type Collection, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB_NAME?.trim() || 'mabrig_ai_video';

declare global {
  // eslint-disable-next-line no-var
  var __mabrigMongoClientPromise: Promise<MongoClient> | undefined;
}

function clientPromise() {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured.');
  }
  if (!globalThis.__mabrigMongoClientPromise) {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 6000,
      maxPoolSize: 10,
    });
    globalThis.__mabrigMongoClientPromise = client.connect();
  }
  return globalThis.__mabrigMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(dbName);
}

export type UserRole = 'member' | 'premium' | 'admin';

export type SubscriptionRecord = {
  status: 'inactive' | 'active' | 'trialing' | 'past_due' | 'canceled';
  plan: 'member' | 'premium' | 'admin';
  provider?: 'paystack' | 'flutterwave' | 'stripe' | 'manual';
  providerCustomerId?: string;
  providerSubscriptionId?: string;
  currentPeriodEnd?: Date;
  updatedAt: Date;
};

export type UserRecord = {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  subscription: SubscriptionRecord;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectRecord = {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  kind: 'workflow' | 'film-blueprint' | 'agent-run';
  payload: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export async function usersCollection(): Promise<Collection<UserRecord>> {
  const db = await getDb();
  const collection = db.collection<UserRecord>('users');
  await collection.createIndex({ email: 1 }, { unique: true });
  return collection;
}

export async function projectsCollection(): Promise<Collection<ProjectRecord>> {
  const db = await getDb();
  const collection = db.collection<ProjectRecord>('projects');
  await collection.createIndex({ userId: 1, updatedAt: -1 });
  return collection;
}

export async function genericCollection(name: string) {
  const db = await getDb();
  return db.collection(name);
}
