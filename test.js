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

  const Name = 'Teste 1404'
  const emailContacts = 'afonso@apexip.com'
  const CPF = '03932600037'
  const CNPJ = undefined
  const userPhoneNumber = '54996982868'

  // Enviar e-mail
  const url = 'https://api.asaas.com/v3/customers';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
    },
    data: {
      name: Name,
      email: emailContacts || '',
      cpfCnpj: CNPJ || CPF,
      mobilePhone: userPhoneNumber
    }
  };

  try {
    const response = await axios(url, options);
    console.log('[/newclient] Cliente cadastrado com sucesso na Asaas');
    
    console.log(response.data.id)

    // Agora que o cliente foi criado com sucesso, vamos buscar o ID do cliente
    const notificacoesGet = await axios.get(`https://api.asaas.com/v3/customers/${response.data.id}/notifications`, {
      headers: {
        'Accept': 'application/json',
        'access_token': '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
      }
    });

    const paymentDueDateWarnings = notificacoesGet.data.data.filter(notification => notification.event === 'PAYMENT_DUEDATE_WARNING');
    const paymentOverdue = notificacoesGet.data.data.filter(notification => notification.event === 'PAYMENT_OVERDUE');
    const paymentCreated = notificacoesGet.data.data.filter(notification => notification.event === 'PAYMENT_CREATED');

    const url_notifications = 'https://api.asaas.com/v3/notifications/batch';
    const options_notifications = {
      method: 'PUT',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        access_token: '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAzNDY2MjU6OiRhYWNoXzIwMmJhNmVhLTJlODQtNGRkOS1hMGRkLWMzNWViMGNjZTAzZg=='
      },
      body: JSON.stringify({
        customer: response.data.id,
        notifications: [
          {
            id: paymentDueDateWarnings[0].id,
            enabled: true,
            emailEnabledForProvider: true,
            smsEnabledForProvider: false,
            emailEnabledForCustomer: true,
            smsEnabledForCustomer: true,
            phoneCallEnabledForCustomer: false,
            whatsappEnabledForCustomer: false,
            scheduleOffset: 5
          },
          {
            id: paymentOverdue[0].id,
            enabled: true,
            emailEnabledForProvider: true,
            smsEnabledForProvider: false,
            emailEnabledForCustomer: true,
            smsEnabledForCustomer: true,
            phoneCallEnabledForCustomer: false,
            whatsappEnabledForCustomer: false,
          },
          {
            id: paymentCreated[0].id,
            enabled: true,
            emailEnabledForProvider: true,
            smsEnabledForProvider: false,
            emailEnabledForCustomer: true,
            smsEnabledForCustomer: true,
            phoneCallEnabledForCustomer: false,
            whatsappEnabledForCustomer: false,
          },
        ]
      })
    };

    fetch(url_notifications, options_notifications)
      .then(res => res.json())
      .then(json => console.log(json))
      .catch(err => console.error('error:' + err));

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
  }
}

createInvoice();