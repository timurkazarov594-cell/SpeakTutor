import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, X, Sparkles, ArrowRight } from "lucide-react";

function compressImage(dataUrl: string, maxDim = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
        else { width = Math.round(width * maxDim / height); height = maxDim; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export default function PhotoUpload() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setCompressing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawDataUrl = e.target?.result as string;
      const compressed = await compressImage(rawDataUrl);
      const base64 = compressed.split(",")[1];
      setPhotoPreview(compressed);
      setPhoto(base64);
      setCompressing(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleAnalyze = () => {
    if (photo) {
      sessionStorage.setItem("atelier_photo", photo);
    } else {
      sessionStorage.removeItem("atelier_photo");
    }
    navigate("/loading");
  };

  const handleSkip = () => {
    sessionStorage.removeItem("atelier_photo");
    navigate("/loading");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex flex-col items-center" data-testid="photo-upload-page">
      <div className="w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <h1
              className="text-4xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Add your photo
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Upload a photo and our AI will analyze your features to create a
              perfectly tailored outfit recommendation.
            </p>
          </div>

          {!photoPreview ? (
            <div
              {...getRootProps()}
              data-testid="dropzone"
              className="relative rounded-2xl p-12 text-center cursor-pointer transition-all duration-300"
              style={{
                background: isDragActive ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.02)",
                border: isDragActive ? "2px dashed rgba(212,175,55,0.6)" : "2px dashed rgba(255,255,255,0.12)",
                boxShadow: isDragActive ? "0 0 40px rgba(212,175,55,0.15)" : "none",
              }}
            >
              <input {...getInputProps()} data-testid="file-input" />
              <motion.div animate={{ scale: isDragActive ? 1.1 : 1 }} transition={{ type: "spring", stiffness: 400 }}>
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}
                >
                  <Upload size={24} style={{ color: "#d4af37" }} />
                </div>
                <p className="text-base font-medium mb-2">
                  {isDragActive ? "Drop your photo here" : "Drag & drop your photo here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or <span style={{ color: "#d4af37" }} className="font-medium">browse files</span>
                </p>
                <p className="text-xs text-muted-foreground mt-3 opacity-60">JPG, PNG, or WebP — max 10MB</p>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(212,175,55,0.25)" }}
            >
              <img src={photoPreview} alt="Your photo" className="w-full h-80 object-cover" data-testid="photo-preview" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
              <button
                onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/70 transition-colors"
                data-testid="remove-photo"
              >
                <X size={16} className="text-white" />
              </button>
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                <Sparkles size={14} style={{ color: "#d4af37" }} />
                <p className="text-sm text-white font-medium">
                  {compressing ? "Optimizing photo..." : "Photo ready for analysis"}
                </p>
              </div>
            </motion.div>
          )}

          <div className="mt-8 space-y-3">
            <motion.button
              onClick={handleAnalyze}
              disabled={compressing}
              data-testid="analyze-button"
              className="w-full flex items-center justify-center gap-3 py-4 rounded-full text-base font-semibold text-black disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 50%, #c9a227 100%)",
                boxShadow: "0 8px 32px rgba(212,175,55,0.3)",
              }}
              whileHover={{ scale: compressing ? 1 : 1.02 }}
              whileTap={{ scale: compressing ? 1 : 0.97 }}
            >
              <Sparkles size={18} />
              {photo ? "Analyze My Style" : "Generate Outfit (No Photo)"}
              <ArrowRight size={18} />
            </motion.button>

            {photo && (
              <motion.button
                onClick={handleSkip}
                data-testid="skip-photo"
                className="w-full py-3 rounded-full text-sm font-medium text-foreground/50 hover:text-foreground/70 transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Skip photo, generate without it
              </motion.button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 opacity-60">
            Your photo is processed securely and never stored permanently.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
