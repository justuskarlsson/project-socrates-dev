import { firebaseAdminInitialized } from "./init_firebase";
import admin from "firebase-admin";
import { openai } from "./server";

export const db = firebaseAdminInitialized ? admin.firestore() : null;

export async function getEmbedding(input: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input
  });
  return response.data[0].embedding;
}

export async function addEmbeddings(){
  if (!db) {
    console.warn("[db] Firebase Admin not initialized — cannot add embeddings server-side.");
    return;
  }
  console.log("ADD EMBEDDINGS")
  const embeddingsDb = db.collection("embeddings");
  const messagesDb = db.collection("messages");
  const messagesSnapshot = await messagesDb.get();
  const embeddingsSnapshot = await embeddingsDb.get();
  const messageEmbeddings: Record<string, any> = {};
  embeddingsSnapshot.docs.map((embedding: any) => {
    messageEmbeddings[embedding.data().messageId] = embedding;
  })
  messagesSnapshot.docs.map(async (message) => {
    if (!(message.id in messageEmbeddings)) {
      const messageId = message.id as string;
      const content = message.data().content as string;
      const user = message.data().user as string;
      const embedding: number[] = await getEmbedding(content);
      console.log(messageId, embedding[0], embedding.length);
      await embeddingsDb.add({
        messageId,
        embedding,
        user,
        timestamp: new Date(),
      });
    }
  })
}
