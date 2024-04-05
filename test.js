const stripe = require('stripe')('sk_test_51IxCKXABvtJ4kGz27uhcukCG3zqbK1uipQw6CEXuGnvzC7GPkJDfy7DSi0RPTp8LiZmOYqoIQ3RTotkJ25LggCX8002csKVQdC');
const axios = require('axios');

async function createInvoice() {

  const Name = 'Teste 1749'

  const getContacts = await axios.get(`https://api2.ploomes.com/Contacts?$filter=Name+eq+'${Name}'&$select=Email`, {
      headers: {
        'User-Key': '4F0633BC71A6B3DC5A52750761C967274AE1F8753C2344CCEB854B60B7564C8780EAFCB0E3BB7AEFA00482ED5A02C4512973B9376262FD4E6C3CA6CC5969AC7E'
      }
    });

    const emailContacts = getContacts.data.value[0].Email

    console.log(emailContacts)
  
}

createInvoice();
