import { NextRequest as OriginalNextRequest } from "next/server";
import { JWTPayload } from "./types/auth";

declare global {
  namespace Next {
    interface NextRequest extends OriginalNextRequest {
      user: JWTPayload;
    }
  }
}
