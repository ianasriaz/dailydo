import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from "@aws-sdk/client-transcribe";
import crypto from "crypto";

const S3_BUCKET = "dailydo-audio-855735869000";
const REGION = "us-east-1";

const s3 = new S3Client({ region: REGION });
const transcribe = new TranscribeClient({ region: REGION });

/**
 * Transcribe audio buffer using AWS Transcribe
 */
export async function transcribeAudioBuffer(buffer, mediaFormat = "mp4") {
  const jobId = `dailydo-voice-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const s3Key = `voice-uploads/${jobId}.${mediaFormat}`;

  const fmt = (mediaFormat || "m4a").toLowerCase().replace(".", "");
  const validFormats = ["mp3", "mp4", "wav", "flac", "ogg", "amr", "webm", "m4a"];
  const finalFormat = validFormats.includes(fmt) ? fmt : "m4a";

  let contentType = "audio/mp4";
  if (finalFormat === "wav") contentType = "audio/wav";
  else if (finalFormat === "mp3") contentType = "audio/mpeg";
  else if (finalFormat === "webm") contentType = "audio/webm";

  try {
    console.log(`[AWS Transcribe] Uploading audio to s3://${S3_BUCKET}/${s3Key}...`);
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType
    }));

    const mediaUri = `s3://${S3_BUCKET}/${s3Key}`;
    console.log(`[AWS Transcribe] Starting transcription job: ${jobId} (format: ${finalFormat})...`);

    await transcribe.send(new StartTranscriptionJobCommand({
      TranscriptionJobName: jobId,
      LanguageCode: "en-US",
      MediaFormat: finalFormat,
      Media: { MediaFileUri: mediaUri }
    }));

    // Poll for completion (max 20 seconds, checking every 1.5s)
    let transcriptText = "";
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 1500));
      const res = await transcribe.send(new GetTranscriptionJobCommand({
        TranscriptionJobName: jobId
      }));

      const status = res.TranscriptionJob?.TranscriptionJobStatus;
      console.log(`[AWS Transcribe] Job status: ${status} (attempt ${i + 1})`);

      if (status === "COMPLETED") {
        const transcriptUri = res.TranscriptionJob?.Transcript?.TranscriptFileUri;
        if (transcriptUri) {
          const transRes = await fetch(transcriptUri);
          const transJson = await transRes.json();
          transcriptText = transJson.results?.transcripts?.[0]?.transcript || "";
        }
        break;
      } else if (status === "FAILED") {
        throw new Error(res.TranscriptionJob?.FailureReason || "AWS Transcribe job failed");
      }
    }

    // Cleanup audio from S3 in background
    s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: s3Key })).catch(() => {});

    return transcriptText;
  } catch (err) {
    console.warn("[AWS Transcribe] Error during transcription:", err.message);
    throw err;
  }
}
