const stripe = require('stripe')('sk_test_51IxCKXABvtJ4kGz27uhcukCG3zqbK1uipQw6CEXuGnvzC7GPkJDfy7DSi0RPTp8LiZmOYqoIQ3RTotkJ25LggCX8002csKVQdC');

async function createInvoice() {

  const nome_cliente = 'Cliente Teste'

  try {
    const customers = await stripe.customers.search({
      query: `name:\'${nome_cliente}\'`,
    });

    
    const customer_id = customers.data[0].id;

    await stripe.invoiceItems.create({
      customer: customer_id,
      amount: 100, // O valor deve ser especificado em centavos (R$1,00)
      currency: 'brl', // Definindo a moeda para Real Brasileiro
      description: 'Descrição Teste do Invoice',
    });

    const invoice = await stripe.invoices.create({
      customer: customer_id,
    });

    console.log(invoice)
  } catch (error) {
    console.error(error);
  }
}

createInvoice();
