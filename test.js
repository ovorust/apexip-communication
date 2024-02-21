const axios = require('axios');

const url = 'https://graph.facebook.com/v13.0/106155522373099/messages';
const token = 'EAAWQRaKIOOUBO7ndpxImsP1ZBfggR5gB6WxVVwpZBwB9Mm7vx2PBbt9JCLnjthOzqVUsOvkLxCK9nBinz1h4ZBGOxNFAZAbaB9pIZCsYG9p6NEyXTxnUf9MbSZBPNT5ui4SAdSk1MGkuBBXGzgLGg9n1bPbwm4ivRNPZC2de74sqppA03N1GCXAZCXfIp1ZC4dqhdxYZD'; // Substitua por seu token de acesso real
const whatsappNumber = '5554996982868';

const messageData = {
  messaging_product: "whatsapp",
  to: whatsappNumber,
  type: "template",
  template: {
    name: "hello_world",
    language: {
      code: "en_US"
    }
  }
};

axios.post(url, messageData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then((response) => {
  console.log('Success:', response.data);
})
.catch((error) => {
  console.error('Error:', error.response ? error.response.data : error.message);
});
