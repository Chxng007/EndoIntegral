import { supabase } from "./supabase";
export async function uploadFile(bucket, file, onProgress = () => {}) {
  if (file.size > 100 * 1024 * 1024)
    throw new Error("El archivo supera el límite de 100 MB.");
  const allowed = [
    "application/pdf",
    "audio/mpeg",
    "audio/mp4",
    "audio/x-m4a",
    "audio/wav",
    "video/mp4",
    "video/webm",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  if (!allowed.includes(file.type))
    throw new Error("Usa PDF, MP3, M4A, WAV, MP4, WebM, JPG, PNG o WebP.");
  const ext = file.name
    .split(".")
    .pop()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const path = `${crypto.randomUUID()}.${ext}`;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Tu sesión terminó. Vuelve a ingresar.");
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`,
    );
    xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
    xhr.setRequestHeader(
      "apikey",
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    );
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(
            new Error(
              "No pudimos subir el archivo. Revisa el formato y los permisos.",
            ),
          );
    xhr.onerror = () =>
      reject(new Error("Se interrumpió la conexión. Intenta nuevamente."));
    xhr.send(file);
  });
  return path;
}
