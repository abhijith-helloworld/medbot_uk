const server = process.env.NEXT_PUBLIC_SERVER;

const demoBaseUrl = process.env.NEXT_PUBLIC_API_URL;
const liveBaseUrl = process.env.NEXT_PUBLIC_API_URL; // same for now

export const appConfig = {
  baseUrl: server === "live" ? liveBaseUrl : demoBaseUrl,

  // webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_API_URL,

  ws: {
    help: process.env.NEXT_PUBLIC_WS_HELP_URL!,
    notification: process.env.NEXT_PUBLIC_WS_NOTIF_URL!,
  },
};
