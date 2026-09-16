const { db } = require('../lfdDb'); // Note: I must make sure lfdDb exports db directly

const runTransaction = async (callback) => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        await new Promise((res, rej) => db.run('BEGIN TRANSACTION', err => err ? rej(err) : res()));
        const result = await callback();
        await new Promise((res, rej) => db.run('COMMIT', err => err ? rej(err) : res()));
        resolve(result);
      } catch (error) {
        await new Promise((res, rej) => db.run('ROLLBACK', err => err ? rej(err) : res()));
        reject(error);
      }
    });
  });
};

module.exports = { runTransaction };
