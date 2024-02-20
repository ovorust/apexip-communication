const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configurar o transporter do Nodemailer com suas configurações de SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465 ,
    auth: {
        user: "teste@apexipartners.com",
        pass: "Apex@123",
    },
});

exports.sendEmailNotification = functions.database.ref('https://ploomes-webhook-default-rtdb.firebaseio.com/clientes.json')
    .onWrite((change, context) => {
        // Verifica se há dados novos
        const afterData = change.after.val();
        
        if (!afterData) {
            return null; // Se não houver dados, não faz nada
        }

        const email = afterData.New.Email; // Supondo que a estrutura de dados inclua o email
        const subject = 'Atualização de Usuário';
        const body = 'Informações sobre seu usuário foram alteradas. Se você recebeu esse e-mail sem nosso aviso ou solicitação sua, favor entrar em contato imediatamente.';

        const mailOptions = {
            from: '"Apex Propriedade Intelectual" <teste@apexipartners.com>',
            to: email,
            subject: subject,
            text: body,
            html: `<p>${body}</p>`,
        };

        return transporter.sendMail(mailOptions)
            .then(() => console.log('E-mail enviado para:', email))
            .catch((error) => console.error('Erro ao enviar e-mail:', error));
    });
