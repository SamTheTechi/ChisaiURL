import { Schema, model } from "mongoose";

const urlSchema = new Schema({
  original: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  short: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
});

export const URL = model("URL", urlSchema);
