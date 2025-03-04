from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
from PIL import Image
import io
import torch

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model_name = "nlpconnect/vit-gpt2-image-captioning"
model = VisionEncoderDecoderModel.from_pretrained(model_name)
feature_extractor = ViTImageProcessor.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)


MAX_LENGTH = 64      
NUM_BEAMS = 5        

@app.post("/caption")
async def generate_caption(image: UploadFile = File(...)):
    """
    Accepts an image file, processes it, and returns a generated caption.
    Uses the VisionEncoderDecoderModel for caption generation.
    """
 
    contents = await image.read()

 
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        return {"caption": f"Error processing image: {e}"}


    try:
        pixel_values = feature_extractor(images=img, return_tensors="pt").pixel_values
        pixel_values = pixel_values.to(device)
    except Exception as e:
        return {"caption": f"Error processing image features: {e}"}


    try:
        output_ids = model.generate(
            pixel_values,
            num_beams=NUM_BEAMS,
            max_length=MAX_LENGTH,
            early_stopping=True
        )
        caption = tokenizer.decode(output_ids[0], skip_special_tokens=True).strip()
    except Exception as e:
        return {"caption": f"Error generating caption: {e}"}

    return {"caption": caption}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
