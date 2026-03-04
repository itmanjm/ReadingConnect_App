import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

let ttsClient: TextToSpeechClient;

try {
  const credentials = functions.config().google?.application_credentials;
  if (credentials) {
    ttsClient = new TextToSpeechClient({ credentials: JSON.parse(credentials) });
  } else {
    ttsClient = new TextToSpeechClient();
  }
} catch {
  ttsClient = new TextToSpeechClient();
}

export const generateTTS = functions.https.onCall(
  async (data: any, context: any) => {
    const { text, texts } = data;
    
    if (!text && !texts) {
      throw new functions.https.HttpsError('invalid-argument', 'Text required');
    }

    try {
      if (texts && Array.isArray(texts)) {
        const audioUrls: Record<string, string> = {};
        
        for (const txt of texts) {
          const request = {
            input: { text: txt },
            voice: {
              languageCode: 'en-US',
              name: 'en-US-Wavenet-D',
              ssmlGender: 'NEUTRAL' as const,
            },
            audioConfig: {
              audioEncoding: 'MP3' as const,
              pitch: 0,
              speakingRate: 0.85,
            },
          };

          const [response] = await ttsClient.synthesizeSpeech(request);
          
          if (response.audioContent) {
            const audioBuffer = Buffer.from(response.audioContent as string, 'base64');
            const fileName = `tts/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mp3`;
            const file = admin.storage().bucket().file(fileName);
            
            await file.save(audioBuffer, {
              metadata: { contentType: 'audio/mp3' },
            });
            
            const [url] = await file.getSignedUrl({
              action: 'read',
              expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
            });
            
            audioUrls[txt] = url;
          }
        }
        
        return { audioUrls };
      } else {
        const request = {
          input: { text },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Wavenet-D',
            ssmlGender: 'NEUTRAL' as const,
          },
          audioConfig: {
            audioEncoding: 'MP3' as const,
            pitch: 0,
            speakingRate: 0.85,
          },
        };

        const [response] = await ttsClient.synthesizeSpeech(request);
        
        if (!response.audioContent) {
          throw new Error('No audio generated');
        }

        const audioBuffer = Buffer.from(response.audioContent as string, 'base64');
        const fileName = `tts/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mp3`;
        const file = admin.storage().bucket().file(fileName);
        
        await file.save(audioBuffer, {
          metadata: { contentType: 'audio/mp3' },
        });
        
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
        
        return { 
          audioUrl: url,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
      }
    } catch (error) {
      console.error('TTS Error:', error);
      throw new functions.https.HttpsError('internal', 'TTS generation failed');
    }
  }
);
