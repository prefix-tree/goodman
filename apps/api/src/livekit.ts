import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

const livekitUrl = process.env.LIVEKIT_URL ?? "";
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

const livekitHost = livekitUrl.replace("wss://", "https://");

export const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

export async function createParticipantToken(opts: {
  roomName: string;
  participantIdentity: string;
  participantName: string;
  metadata?: string;
}): Promise<string> {
  const token = new AccessToken(apiKey, apiSecret, {
    identity: opts.participantIdentity,
    name: opts.participantName,
    metadata: opts.metadata,
    ttl: "10m",
  });
  token.addGrant({
    room: opts.roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
  return await token.toJwt();
}
