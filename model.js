import { Schema, model } from "mongoose";

const urlSchema = new Schema({
  original: {
    type: String,
    required: true
  },
  short: {
    type: String,
    required: true
  }
})

export const URL = model("URL", urlSchema);
