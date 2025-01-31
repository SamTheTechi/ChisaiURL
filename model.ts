import { Schema, Document, model } from "mongoose";

interface URL extends Document {
  original: string;
  short: string;
}

const urlSchema = new Schema<URL>({
  original: {
    type: String,
    required: true
  },
  short: {
    type: String,
    required: true
  }
})

export const URL = model<URL>("URL", urlSchema);
