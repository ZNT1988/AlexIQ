import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { AI_KEYS } from "../config/aiKeys.js";

export const openai = AI_KEYS.OPENAI ? new OpenAI({ apiKey: AI_KEYS.OPENAI }) : null;
export const anthropic = AI_KEYS.ANTHROPIC ? new Anthropic({ apiKey: AI_KEYS.ANTHROPIC }) : null;