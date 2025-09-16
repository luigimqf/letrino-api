import nodemailer from 'nodemailer';
import os from 'os';
import process from 'process';
import dotenv from 'dotenv';
import 'dotenv/config';

dotenv.config();

function crashInfo(err: unknown) {
  return {
    timestamp: new Date().toISOString(),
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : '',
    pid: process.pid,
    node: process.version,
    uptimeSec: Math.floor(process.uptime()),
    mem: process.memoryUsage(),
    host: os.hostname(),
  };
}

const smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmailAlert(subject: string, body: unknown) {
  const from = process.env.EMAIL_USER;
  const to = process.env.EMAIL_USER;

  if (!from || !to) {
    console.warn(
      '⚠️ ALERT_FROM ou ALERT_TO não configurados, e-mail não será enviado.'
    );
    return;
  }

  const textBody =
    typeof body === 'string' ? body : JSON.stringify(body, null, 2);

  await smtpTransport.sendMail({
    from,
    to,
    subject,
    text: textBody,
  });
}

async function notifyAndExit(err: unknown, source: string) {
  if (process.env.NODE_ENV === 'development') return;
  try {
    const info = crashInfo(err);
    const subject = `[ALERT] ${process.env.APP_NAME || 'my-app'} crashed (${source})`;

    await Promise.race([
      sendEmailAlert(subject, info),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Alert timeout')), 5000)
      ),
    ]);

    console.log('📧 Alerta enviado com sucesso (ou timeout).');
  } catch (sendErr) {
    console.error('❌ Falha ao enviar alerta:', sendErr);
  } finally {
    setTimeout(() => process.exit(1), 1000);
  }
}

process.on('uncaughtException', err => {
  console.error('💥 uncaughtException:', err);
  void notifyAndExit(err, 'uncaughtException');
});

process.on('unhandledRejection', reason => {
  console.error('💥 unhandledRejection:', reason);
  if (reason instanceof Error) throw reason;
  throw new Error(`Unhandled Rejection: ${JSON.stringify(reason)}`);
});

export {};
