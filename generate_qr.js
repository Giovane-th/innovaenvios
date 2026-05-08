const QRCode = require('qrcode');
const fs = require('fs');

// URL do dev server Expo
const expoUrl = 'exp://8081-ipihk77ihtc4zyl2ust8r-7ac4631c.us2.manus.computer';

console.log('📱 Gerando QR Code para Expo Go...');
console.log('URL:', expoUrl);

QRCode.toFile('qr-code-expo.png', expoUrl, {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  quality: 0.95,
  margin: 1,
  width: 300,
}, function (err) {
  if (err) {
    console.error('❌ Erro ao gerar QR code:', err);
    process.exit(1);
  }
  console.log('✅ QR Code gerado: qr-code-expo.png');
  console.log('📲 Abra o Expo Go no celular e escaneie este QR code!');
});
