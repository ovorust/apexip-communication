const stripe = require('stripe')('sk_test_51IxCKXABvtJ4kGz27uhcukCG3zqbK1uipQw6CEXuGnvzC7GPkJDfy7DSi0RPTp8LiZmOYqoIQ3RTotkJ25LggCX8002csKVQdC');
const axios = require('axios');

async function createInvoice() {

  let descricao = "Teste 2026";

  // Verifica se a descrição possui "Parcela" no nome
  if (descricao.includes("Parcela")) {
    // Extrai o texto após a pontuação usando uma expressão regular
    const match = descricao.match(/\. (.+)/);
    
    // Se houver uma correspondência na expressão regular
    if (match) {
      // Captura o texto após a pontuação
      descricao = match[1];
    }
  }
  
  console.log(descricao); // Saída: "Teste 2026"
}

createInvoice();
