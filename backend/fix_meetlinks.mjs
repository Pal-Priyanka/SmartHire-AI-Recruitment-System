import mongoose from 'mongoose';
await mongoose.connect('mongodb://127.0.0.1:27017/smarthire');
const col = mongoose.connection.db.collection('interviews');
const result = await col.updateMany(
    { $or: [{ meetLink: null }, { meetLink: '' }, { meetLink: { $exists: false } }] },
    { $set: { meetLink: 'https://meet.google.com/smarthire-interview' } }
);
console.log('Updated', result.modifiedCount, 'interviews with default meeting link');
process.exit(0);
