import fs from "fs";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "mock-uploads");

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function createMockStorage() {
  return {
    from(bucket: string) {
      return {
        async upload(filePath: string, bytes: Buffer) {
          try {
            const fullPath = path.join(UPLOAD_ROOT, bucket, filePath);
            ensureDir(path.dirname(fullPath));
            fs.writeFileSync(fullPath, bytes);
            return { data: { path: filePath }, error: null };
          } catch (e: any) {
            return { data: null, error: { message: e.message } };
          }
        },
        getPublicUrl(filePath: string) {
          return { data: { publicUrl: `/mock-uploads/${bucket}/${filePath}` } };
        },
        async remove(paths: string[]) {
          try {
            for (const p of paths) {
              const fullPath = path.join(UPLOAD_ROOT, bucket, p);
              if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
            }
            return { data: null, error: null };
          } catch (e: any) {
            return { data: null, error: { message: e.message } };
          }
        }
      };
    }
  };
}
