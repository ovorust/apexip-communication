const stripe = require('stripe')('sk_test_51IxCKXABvtJ4kGz27uhcukCG3zqbK1uipQw6CEXuGnvzC7GPkJDfy7DSi0RPTp8LiZmOYqoIQ3RTotkJ25LggCX8002csKVQdC');
const axios = require('axios');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { format } = require('date-fns');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;


async function createInvoice() {

    const Name = 'ADMIN - APEX IP GROUP (EMPRESA)'
    const StreetAddress = 'Rua Belmira Isabel Martins, 42'
    const StreetAddressNumber = '42'
    const StreetAddressLine2 = 'Centro Executivo Expedicionário'
    const Neighborhood = 'Estreito'
    const Zipcode = null
    const CNPJ = '17210627000170'
    const Email = 'admin@apexip.com'

    const userPhones = await axios.get(`https://api2.ploomes.com/Contacts?$filter=Name eq '${Name}'&$expand=Phones&$orderby=TypeId desc`, {
        headers: {
          'User-Key': process.env.PLOOMES_USER_KEY
        }
      });
    
      if (userPhones.data.value.length > 0 && userPhones.data.value[0].Phones && userPhones.data.value[0].Phones.length > 0) {
        userPhoneNumber = userPhones.data.value[0].Phones[0].SearchPhoneNumber.toString();
      } else {
        console.log('A lista de Phones está vazia ou o caminho está incorreto.');
      }
  
      const asaasCustomers = await axios.get(`https://api.asaas.com/v3/customers?name=${Name}`, {
        headers: {
          accept: 'application/json',
          access_token: process.env.ASAAS_ACCESS_KEY
        }
      });
  
      const existingCustomer = asaasCustomers.data.data.find(customer => customer.name === Name);
  
      if (existingCustomer) {
        const customerIdAsaas = existingCustomer.id;
  
        // Atualizar cliente na Asaas
        const url = `https://api.asaas.com/v3/customers/${customerIdAsaas}`;
        const options = {
          method: 'PUT',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            access_token: process.env.ASAAS_ACCESS_KEY
          },
          body: JSON.stringify({
            name: Name,
            cpfCnpj: CNPJ || CPF,
            email: Email,
            mobilePhone: userPhoneNumber,
            address: StreetAddress,
            addressNumber: StreetAddressNumber,
            province: Neighborhood,
            complement: StreetAddressLine2,
            postalCode: String(Zipcode),
            })
        };
        
        fetch(url, options)
          .then(res => console.log('[/updateclient] Cliente atualizado na Asaas com sucesso!'))
          .catch(err => console.error('[/updateclient] Erro ao atualizar cliente Asaas: ' + err));
        
        console.log('Cliente criado')
  
      } else {
        console.log('[/updateclient] Cliente não encontrado na Asaas');
      }
}
createInvoice();