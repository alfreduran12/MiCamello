// Uso: node scripts/hash-password.js TU_CONTRASEÑA
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.error('Uso: node scripts/hash-password.js TU_CONTRASEÑA');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('\nCopia esta línea en tu .env:\n');
  console.log(`AUTH_PASSWORD_HASH=${hash}\n`);
});
