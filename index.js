// index.js
const venom = require('venom-bot');

const easypaisaNumber = '03041888850';
const jazzcashNumber = '03041888850';
const accountName = 'Abdul Sami';

const userSessions = {};

venom
  .create({
    session: 'ticket-bot-session',
    multidevice: true,
    headless: true,
    browserArgs: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox'],
  })
  .then((client) => start(client))
  .catch((error) => {
    console.error('❌ Failed to launch:', error);
  });

function start(client) {
  console.log('✅ WhatsApp Bot is Live!');

  client.onMessage(async (message) => {
    const text = message.body?.trim().toLowerCase();
    const from = message.from;

    // If user is in the middle of a session
    if (userSessions[from]) {
      await handleSessionMessage(client, message);
      return;
    }

    // Main menu
    if (text === 'hi' || text === 'hello' || text === 'menu') {
      await client.sendText(
        from,
        `👇 Apna option select karein:

1. 🛠 Open Ticket
2. 💸 Add Balance`
      );
    } else if (text === '1' || text.includes('ticket')) {
      userSessions[from] = { step: 'selectTicketType' };
      await client.sendText(
        from,
        `Select Ticket Type:

1. Refill
2. Cancel
3. SpeedUp
4. Fake Complete
5. Other`
      );
    } else if (text === '2' || text.includes('balance')) {
      userSessions[from] = { step: 'awaitingPaymentInfo' };
      await client.sendText(
        from,
        `Easypaisa: ${easypaisaNumber} (Name: ${accountName})
JazzCash: ${jazzcashNumber} (Name: ${accountName})

Once the payment is confirmed, the funds will be added to your account shortly. 

📝 Please also share your username and payment screenshot for verification.`
      );
    } else {
      await client.sendText(
        from,
        `👋 Welcome! Type 'menu' to get started.`
      );
    }
  });
}

async function handleSessionMessage(client, message) {
  const from = message.from;
  const session = userSessions[from];
  const text = message.body.trim();

  if (session.step === 'selectTicketType') {
    const types = {
      '1': 'Refill',
      '2': 'Cancel',
      '3': 'SpeedUp',
      '4': 'Fake Complete',
      '5': 'Other',
    };
    const choice = types[text];

    if (!choice) {
      await client.sendText(from, '⚠️ Invalid option. Please send 1 to 5.');
      return;
    }

    session.ticketType = choice;
    session.step = choice === 'Other' ? 'awaitingOtherMessage' : 'awaitingOrderId';

    if (choice === 'Other') {
      await client.sendText(from, '📝 Please type your message.');
    } else {
      await client.sendText(from, `📦 Please send your Order ID for ${choice}`);
    }
  } else if (session.step === 'awaitingOrderId') {
    await client.sendText(
      from,
      `✅ Ticket Created: ${session.ticketType.toUpperCase()} request for Order ID: ${text}
Admin has been notified!`
    );
    delete userSessions[from];
  } else if (session.step === 'awaitingOtherMessage') {
    await client.sendText(
      from,
      `✅ Ticket Created:
"${text}"
Admin has been notified!`
    );
    delete userSessions[from];
  } else if (session.step === 'awaitingPaymentInfo') {
    await client.sendText(
      from,
      `✅ Admin ne aapka payment request dekh liya hai. Funds jald hi aapke account mein add kiye jaenge!`
    );
    delete userSessions[from];
  }
}
